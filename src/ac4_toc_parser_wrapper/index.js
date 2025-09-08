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

/*global console*/

/**
 * @module
 * @desc This file provides a wrapper function to the AC-4 TOC parser, allowing to parse the TOC from an AC-4 bitstream and filter specific elements of interest.
 */

import { BitSource } from "./bitsource.js";
import { FilterSink } from "./filtersink.js";
import { Parser } from "../ac4_toc_parser.js";

/**
 * Object containing parsed information about parsed element
 * @typedef {Object} ElementData
 * @property {string} name
 * @property {number} value
 * @property {number} pos
 * @property {number} width
 * @property {string} handler
 */

/**
 * Parses the TOC from an AC-4 bitstream with filtering specified elements
 * @param {DataView} data - DataView that represents individual media sample
 * @param {string[]} elements - The AC-4 TOC elements to be filtered
 * @returns {ElementData[]|null} An array of objects containing the parsed elements
 */
const parseTocElements = (data, elements) => {
  let parsedElements = [];
  let index = 0;

  const bitSourceIterator = {
    next() {
      if (index < data.byteLength) {
        return { value: data.getUint8(index), done: ++index >= data.byteLength };
      }
      return { done: true };
    },
  };

  const sinkCallback = (name, value, width, position, handler) => {
    // subtract width because we are called after the position has been updated
    const pos = position - width;
    parsedElements.push({ handler, name, pos, value, width });
  };

  const bitSource = new BitSource(bitSourceIterator);
  const sink = new FilterSink(elements, sinkCallback);

  const parser = new Parser(bitSource, sink);

  // in case of parsing errors log them and set parsed elements to null (which will result in returning unmodified buffer)
  try {
    parser.F_raw_ac4_frame_toc_only();
  } catch (err) {
    console.error(err);
    parsedElements = null;
  }

  return parsedElements;
};

export { parseTocElements };
