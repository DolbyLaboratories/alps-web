/************************************************************************************************************
 *                Copyright (C) 2024-2026 by Dolby International AB.
 *                All rights reserved.

 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:

 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions
 *    and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
 *    and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or
 *    promote products derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 ************************************************************************************************************/

import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ...js.configs.all,
    files: ["src/**/*"],
  },
  prettierRecommended,
  {
    rules: {
      "one-var": ["error", { initialized: "never", uninitialized: "always" }],
      "no-console": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-magic-numbers": ["error", { ignore: [0, 1] }],
      "no-bitwise": "off",
      "no-underscore-dangle": "off",
      "capitalized-comments": "off",
      "id-length": ["error", { exceptions: ["i"] }],
      "no-plusplus": "off",
      "prefer-destructuring": "off",
      camelcase: [
        "error",
        {
          allow: ["after_add", "after_call", "after_position", "before_call", "get_align", "write_align", "write_uint"],
        },
      ],
      // TODO
      "max-lines": "off",
      "max-statements": "off",
      "max-params": "off",
      "max-lines-per-function": "off",
    },
    files: ["src/**/*"],
  },
  {
    rules: {
      "no-magic-numbers": "off",
    },
    files: ["src/bitwise_operations.js"],
  },
  {
    rules: {
      "sort-keys": "off",
      "new-cap": "off",
    },
    files: ["src/ac4_toc_parser_wrapper/index.js"],
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    ignores: ["dist/", "src/ac4_toc_parser.js", "docs/"],
  },
  {
    files: ["test/**/*"],
    languageOptions: { globals: globals.jest },
  },
];
