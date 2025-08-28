/************************************************************************************************************
 *                Copyright (C) 2024 by Dolby International AB.
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
 * @desc This file provides a BitSource class for reading bits from a source that implements iterator protocol
 */

/** Handles reading bits from the source that is an iterator */
export class BitSource {
  /**
   * Create the BitSource
   * @param {Iterator<number>} iterator - an iterator object
   */
  constructor(iterator) {
    this.iterator = iterator;
    this.cache = 0;
    this.bitsLeft = 0;
  }

  /**
   * This function reads n-bit value from the source, where "n" is the specified width.
   *
   * It works by keeping a 32 bit wide cache.
   * In the cache, the next bits are "left/top aligned".
   * That is to say, to read the next three bits, you take the three most significant bits.
   * This can be accomplished by right-shifting the cache by 32-3=29 bits, taking care that it is an unsigned shift and no sign extension takes place.
   * To "expel" the read bits from the cache, simple left-shift the cache by 3 bits.
   *
   * Before any bits are read from the cache, it needs to be filled.
   * We check if more bits are needed, and whether at least 8 can be filled in. If so, do it.
   * This means that the cache contains 25 bits at a minimum after it is filled.
   * Therefore, 25 bits are the most bits that the reader can deliver. We don't check for end of stream in the bit reader. That is better delegated elsewhere.
   *
   * @summary Get a value of specified width from the bit source
   *
   * @param {string} varname - Name of the variable being read (it serves only logging purposes)
   * @param {number} bitsWidth - Width of the value to be read (maximum 24 bits)
   * @returns {number} The value read from the bit source
   */
  get(varname, bitsWidth) {
    const MAX_SUPPORTED_WIDTH = 24;
    const BYTE_SIZE = 8;
    const INT_SIZE = 32;
    // make sure the BitSource supports reading value with given width
    if (bitsWidth > MAX_SUPPORTED_WIDTH) {
      console.warn(
        `BitSource.get getting value ${varname} with not supported width=${bitsWidth} (max supported width: 24)`,
      );
    }

    let width = bitsWidth;
    while (this.bitsLeft < width) {
      const nextByte = this.iterator.next();
      this.cache |= nextByte.value << (MAX_SUPPORTED_WIDTH - this.bitsLeft);
      this.bitsLeft += BYTE_SIZE;
      /*
        We may have an AC-4 stream with field width >= 25/32 bits,
        current tocparser implementation can not handle its value.
        Whenever we have such field we move iterator to proper bits
      */
      if (width > MAX_SUPPORTED_WIDTH) {
        this.cache <<= BYTE_SIZE;
        this.bitsLeft -= BYTE_SIZE;
        width -= BYTE_SIZE;
      }
    }

    // take the highest "width" bits, make sure unsigned shift is used
    const readValue = this.cache >>> (INT_SIZE - width);
    // clear out the highest "width" bits
    this.cache <<= width;
    this.bitsLeft -= width;

    return readValue;
  }

  /**
   * Get bits needed for byte alignment
   *
   * @param {number} numberOfBits - Number of bits to align
   * @returns {number} The value read for alignment
   */
  get_align(numberOfBits) {
    return this.get("align", numberOfBits);
  }
}
