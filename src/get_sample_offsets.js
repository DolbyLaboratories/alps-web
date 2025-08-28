/************************************************************************************************************
 *                Copyright (C) 2023-2024 by Dolby International AB.
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

/**
 * @module
 * @desc This file contains the function that calculates offsets and sizes of individual media samples.
 */

import * as isoBmffBox from "./constants/isobmff_box_names.js";

/**
 * @typedef {Object} SampleData
 * @property {number} offset - offset to Sample
 * @property {number} size - Sample size
 */

/**
 * Calculates offsets and sizes of individual samples within the media data.
 *
 * @param {ISOFile} parsedBuffer - The parsed buffer containing ISOBMFF boxes
 * @returns {SampleData[]} An array of objects containing the offset and size of each sample
 */
const getSampleOffsets = (parsedBuffer) => {
  const sampleOffsets = [];
  const DEFAULT_BASE_IS_MOOF_FLAG_OFFSET = 0x020000;
  // must be exactly one in a media segment
  const movieFragment = parsedBuffer.fetch(isoBmffBox.MOVIE_FRAGMENT);

  let isFirstTrackFragment = true;

  for (const trackFragment of parsedBuffer.fetchAll(isoBmffBox.TRACK_FRAGMENT)) {
    // Exactly one must be present per traf
    const trackFragmentHeader = trackFragment.boxes.find((box) => box.type === isoBmffBox.TRACK_FRAGMENT_HEADER);

    const baseDataOffset = trackFragmentHeader.base_data_offset || 0;
    const defaultBaseIsMoof = trackFragmentHeader.flags & DEFAULT_BASE_IS_MOOF_FLAG_OFFSET;

    if (baseDataOffset) {
      /* base_data_offset is relative to the file identified by the referenced data reference entry */
      throw Error(
        "base_data_offset is relative to the file identified by the referenced data reference entry unsupported",
      );
    }

    if (!defaultBaseIsMoof) {
      if (isFirstTrackFragment) {
        /* base_data_offset is relative to the first byte of the MovieFragmentBox containing this box */
        throw Error(
          "base_data_offset is relative to the first byte of the MovieFragmentBox containing this box unsupported",
        );
      }
      /* base_data_offset is relative to the end of the data defined by the preceding track fragment */
      throw Error(
        "base_data_offset is relative to the end of the data defined by the preceding track fragment is unsupported",
      );
    }

    /* base_data_offset is relative to the first byte of the MovieFragmentBox containing this box */
    const relative = movieFragment._offset;

    for (const trackFragmentRun of trackFragment.boxes.filter((box) => box.type === isoBmffBox.TRACK_FRAGMENT_RUN)) {
      let sampleOffset = relative + baseDataOffset + trackFragmentRun.data_offset;
      for (const sample of trackFragmentRun.samples) {
        sampleOffsets.push({ offset: sampleOffset, size: sample.sample_size });
        sampleOffset += sample.sample_size;
      }
    }

    isFirstTrackFragment = false;
  }

  return sampleOffsets;
};

export { getSampleOffsets };
