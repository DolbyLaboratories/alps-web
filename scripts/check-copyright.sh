#!/bin/bash
########################################################################################################################
# Copyright (C) 2025-2026 by Dolby International AB.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
# following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
#    disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
#    disclaimer in the documentation and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
#    products derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES,
# INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
# WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
########################################################################################################################

IGNORED_DIRS=(".git" "coverage" "docs" "node_modules" ".copyrights" "dist")

FIND_ARGS=()
for dir in "${IGNORED_DIRS[@]}"; do
    FIND_ARGS+=(-name "$dir" -prune -o)
done

FIND_ARGS+=(-type f -print)

check_copyright() {
    local file="$1"
    local ext

    basename="${file##*/}"

    if [[ "$basename" == *.* && "$basename" != .* ]]; then
        ext="${basename##*.}"
    else
        ext="$basename"
    fi

    local notice_file=".copyrights/copyright.$ext"

    [[ -f "$notice_file" ]] || return 0

    local notice_content
    notice_content=$(tr -d '\r' < "$notice_file")

    local file_content
    file_content=$(tr -d '\r' < "$file")

    if [[ "$file_content" == *"$notice_content"* ]]; then
        echo "Copyright years not found"
        return 1
    fi

    file_content=$(sed -E 's/Copyright \(C\) [0-9]{4}(-[0-9]{4})?/Copyright (C) {YEARS}/g' "$file")

    if [[ "$file_content" == *"$notice_content"* ]]; then
        return 0
    else
        echo "Missing or incorrect copyright notice in $file"
        return 1
    fi
}

is_ignored_dir() {
    local dir="$1"
    for ignored in "${IGNORED_DIRS[@]}"; do
        [[ "$dir" == *"$ignored"* ]] && return 0
    done
    return 1
}

while read -r file; do
    dir=$(dirname "$file")
    is_ignored_dir "$dir" && continue
    echo "checking $file ..."
    if ! check_copyright "$file"; then
        exit 1
    fi
done < <(find . "${FIND_ARGS[@]}")

echo "OK"