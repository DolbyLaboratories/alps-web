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

/*global console*/

/**
 * @module
 * @desc This file contains functions for performing bitwise operations on byte arrays (DataView objects).
 */

/**
 * Reverses the bit order of a single byte using a parallel bit-swap technique.
 * Each step swaps groups of bits at halving granularity:
 *   1. swap the two nibbles  (4-bit groups)
 *   2. swap 2-bit pairs      (2-bit groups)
 *   3. swap adjacent bits    (1-bit groups)
 *
 * @param {number} byte - An unsigned byte value (0–255)
 * @returns {number} The byte with its bits reversed
 *
 * @example
 * rev(0b10000000) // → 0b00000001 (1)
 * rev(0b10110001) // → 0b10001101 (141)
 */
const rev = (byte) => {
  // swap nibbles
  let result = ((byte & 0xf0) >>> 4) | ((byte & 0x0f) << 4);
  // swap bit pairs
  result = ((result & 0xcc) >>> 2) | ((result & 0x33) << 2);
  // swap adjacent bits
  result = ((result & 0xaa) >>> 1) | ((result & 0x55) << 1);
  return result;
};

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
  if (width === 0) return data;

  const startByte = offset >> 3;
  const endByte = (offset + width - 1) >> 3;
  const startMask = 0xff >> (offset & 7);
  const endMask = (0xff << (7 - ((offset + width - 1) & 7))) & 0xff;

  // For shift < 24 the accumulator stays below 2^31 so plain bitwise << and
  // unsigned >>> are exact.  For shift >= 24 we fall back to IEEE-754 double
  // multiplication which is exact up to 2^53.
  const useBitwise = shift < 24;
  const shiftMul = useBitwise ? 0 : 2 ** shift;
  let shiftAcc = 0;

  // Iterate end→start: carry propagates naturally from LSB side toward MSB.
  for (let i = endByte; i >= startByte; i--) {
    let mask = 0xff;
    if (i === startByte) mask &= startMask;
    if (i === endByte) mask &= endMask;

    const byte = data.getUint8(i);
    if (useBitwise) {
      shiftAcc = ((byte & mask) << shift) + shiftAcc;
      data.setUint8(i, (byte & ~mask) | (shiftAcc & 0xff & mask));
      shiftAcc >>>= 8;
    } else {
      shiftAcc = (byte & mask) * shiftMul + shiftAcc;
      data.setUint8(i, (byte & ~mask) | (shiftAcc % 256 & mask));
      shiftAcc = Math.trunc(shiftAcc / 256);
    }
  }
  return data;
};

/**
 * Shifts the specified range of bits right without shifting bits outside the range.
 * Zeros are pushed in from the left side to maintain width.
 *
 * @summary Shifts a range of bits within a byte array right by a specified amount.
 *
 * @param {DataView} data - The byte array containing the bits to shift
 * @param {number} offset - The start index of the bit range to shift (must be >= 0)
 * @param {number} width - The number of bits to shift (must be >= 0)
 * @param {number} shift - The number of positions to shift right (must be >= 0)
 * @returns {DataView} The same byte array with the bits shifted in-place
 *
 * @example
 * const arrayBuffer = new ArrayBuffer(1);
 * const dataView = new DataView(arrayBuffer);
 * dataView.setUint8(0, 0b01011101);
 * shiftRight(dataView, 3, 3, 2);
 * // Only bits 5,4,3 = '111' are shifted right by 2 → become '001'
 * // Result: 0b01000101
 */
const shiftRight = (data, offset, width, shift) => {
  if (width === 0) return data;

  const startByte = offset >> 3;
  const endByte = (offset + width - 1) >> 3;
  const startMask = 0xff >> (offset & 7);
  const endMask = (0xff << (7 - ((offset + width - 1) & 7))) & 0xff;

  // Same fast/slow split as shiftLeft; rev() mirrors the carry direction.
  const useBitwise = shift < 24;
  const shiftMul = useBitwise ? 0 : 2 ** shift;
  let shiftAcc = 0;

  // Iterate start→end: rev() maps MSB carry into LSB carry for the reversed bytes.
  for (let i = startByte; i <= endByte; i++) {
    let mask = 0xff;
    if (i === startByte) mask &= startMask;
    if (i === endByte) mask &= endMask;

    const byte = data.getUint8(i);
    if (useBitwise) {
      shiftAcc = (rev(byte & mask) << shift) + shiftAcc;
      data.setUint8(i, (byte & ~mask) | (rev(shiftAcc & 0xff) & mask));
      shiftAcc >>>= 8;
    } else {
      shiftAcc = rev(byte & mask) * shiftMul + shiftAcc;
      data.setUint8(i, (byte & ~mask) | (rev(shiftAcc % 256) & mask));
      shiftAcc = Math.trunc(shiftAcc / 256);
    }
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

export { rev, shiftLeft, shiftRight, setBits };
