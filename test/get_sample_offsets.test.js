/************************************************************************************************************
 *                Copyright (C) 2026 by Dolby International AB.
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

import ISOBoxer from "codem-isoboxer";
import { getSampleOffsets } from "../src/get_sample_offsets.js";

const DEFAULT_BASE_IS_MOOF = 0x020000;
const TRUN_DATA_OFFSET_AND_SAMPLE_SIZE = 0x000201;

const u32 = (value) => [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
const fourCC = (type) => [...type].map((c) => c.charCodeAt(0));
const box = (type, payload) => [...u32(8 + payload.length), ...fourCC(type), ...payload];
const fullBox = (type, flags, payload) => box(type, [...u32(flags), ...payload]);

/**
 * Build one fragment (moof + mdat) with a single traf/trun.
 * @param {number} sequenceNumber
 * @param {number[]} sampleSizes
 * @returns {number[]} bytes
 */
const buildFragment = (sequenceNumber, sampleSizes) => {
  const mfhd = fullBox("mfhd", 0, u32(sequenceNumber));
  const tfhd = fullBox("tfhd", DEFAULT_BASE_IS_MOOF, u32(1));
  // trun size is fixed by sample count, so moof size is known before writing data_offset
  const trunSize = 8 + 4 + 4 + 4 + 4 * sampleSizes.length;
  const moofSize = 8 + mfhd.length + 8 + tfhd.length + trunSize;
  const dataOffset = moofSize + 8;
  const trun = fullBox("trun", TRUN_DATA_OFFSET_AND_SAMPLE_SIZE, [
    ...u32(sampleSizes.length),
    ...u32(dataOffset),
    ...sampleSizes.flatMap(u32),
  ]);
  const moof = box("moof", [...mfhd, ...box("traf", [...tfhd, ...trun])]);
  const totalSize = sampleSizes.reduce((a, b) => a + b, 0);
  const mdat = box(
    "mdat",
    Array.from({ length: totalSize }, () => sequenceNumber),
  );
  return [...moof, ...mdat];
};

describe("getSampleOffsets", () => {
  it("should return offsets for a segment with a single fragment", () => {
    const bytes = buildFragment(1, [3, 5]);
    const parsed = ISOBoxer.parseBuffer(new Uint8Array(bytes).buffer);

    const moofSize = bytes.length - 8 - 8;
    expect(getSampleOffsets(parsed)).toEqual([
      { offset: moofSize + 8, size: 3 },
      { offset: moofSize + 8 + 3, size: 5 },
    ]);
  });

  it("should return offsets for samples of every fragment in a multi-fragment segment", () => {
    const fragment1 = buildFragment(1, [3, 5]);
    const fragment2 = buildFragment(2, [4, 6]);
    const fragment3 = buildFragment(3, [7]);
    const bytes = [...fragment1, ...fragment2, ...fragment3];
    const parsed = ISOBoxer.parseBuffer(new Uint8Array(bytes).buffer);

    const offsets = getSampleOffsets(parsed);

    expect(offsets.map((o) => o.size)).toEqual([3, 5, 4, 6, 7]);
    // each mdat payload is filled with its fragment's sequence number
    expect(offsets.map((o) => bytes[o.offset])).toEqual([1, 1, 2, 2, 3]);
    expect(offsets.map((o) => bytes[o.offset + o.size - 1])).toEqual([1, 1, 2, 2, 3]);
  });
});
