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
 * @desc This file contains functions for performing bitwise operations on byte arrays (DataView objects).
 */

/**
 * Shifts the specified range of bits left without shifting bits outside the range.
 * Zeros are pushed in from the right side to maintain width.
 *
 * @summary Shifts a range of bits within a byte array left by a specified amount.
 *
 * @param {DataView} data - The byte array containing the bits to shift
 * @param {number} offset - The start index of the bit range to shift (must be >= 0)
 * @param {number} width - The number of bits to shift (must be >= 0)
 * @param {number} shift - The number of positions to shift left (must be >= 0)
 * @returns {DataView} The same byte array with the bits shifted in-place
 *
 * @example
 * const arrayBuffer = new ArrayBuffer(1);
 * const dataView = new DataView(arrayBuffer);
 * dataView.setUint8(0, 0b01011101);
 * shiftLeft(dataView, 3, 3, 3)
 * // dataView = [0b01000001]
 */
const shiftLeft = (data, offset, width, shift) => {
  // Calculate start and end byte and bit indexes
  const startByte = offset >> 3;
  const endByte = (offset + width - 1) >> 3;
  const startBit = offset & 7;
  const endBit = (offset + width - 1) & 7;

  // Calculate bitmasks for start and end bytes
  const startMask = 0b11111111 >> startBit;
  const endMask = (0b11111111 << (7 - endBit)) & 0b11111111;

  // Accumulator for shifted bits across byte boundaries
  let shiftAcc = 0;

  // Iterate bytes from end to start
  for (let i = endByte; i >= startByte; i--) {
    // Get byte and mask
    const currByte = data.getUint8(i);
    let mask = 0b11111111;
    if (i === startByte) {
      mask &= startMask;
    }
    if (i === endByte) {
      mask &= endMask;
    }

    // Apply mask and shift
    const clearedByte = currByte & ~mask;
    const maskedCurrByte = currByte & mask;
    shiftAcc = (maskedCurrByte << shift) + shiftAcc;
    const shiftedCurrByte = clearedByte | (shiftAcc & 0b11111111 & mask);
    shiftAcc >>= 8;

    // Store shifted result
    data.setUint8(i, shiftedCurrByte);
  }
  return data;
};

/**
 * This function modifies a range of bits within a byte array by setting them to a given value. It handles cases where the bit range spans across maximum of two bytes.
 *
 * @summary Sets a range of bits within a byte array to a specified value.
 *
 * @param {DataView} data - The byte array in which the bits will be replaced
 * @param {number} offset - The start index of the bit range to set (must be >= 0)
 * @param {number} width - The number of bits to set (must be >= 0)
 * @param {number} value - The value to set the bits to (must fit within the specified width)
 *
 * @example
 * const arrayBuffer = new ArrayBuffer(2);
 * const dataView = new DataView(arrayBuffer);
 * dataView.setUint8(0, 0b10101010);
 * dataView.setUint8(1, 0b01010101);
 * setBits(dataView, 5, 4, 0b1011);
 * // dataView = [0b10101101, 0b11010101]
 */
const setBits = (data, offset, width, value) => {
  // Make sure the value is not too large to fit
  console.assert(value >> width === 0, `value is not a ${width} bit value`);

  // Offset in bytes and bits
  const byteOffset = offset >>> 3;
  const bitOffset = offset & 7;

  // Mask to mask out the presentation bits
  const mask = (((1 << width) - 1) << (16 - width)) >> bitOffset;

  // Read a 16-bit word
  let word = (data.getUint8(byteOffset) << 8) | data.getUint8(byteOffset + 1);

  // Zero out the bits in the mask
  word &= ~mask;

  // Stamp the value into word
  word |= value << (16 - width - bitOffset);

  // Write back into databuffer
  data.setUint8(byteOffset, word >>> 8);
  data.setUint8(byteOffset + 1, word & 0xff);
};

export { shiftLeft, setBits };
