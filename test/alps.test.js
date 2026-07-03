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

import { Alps } from "../src/alps.js";
import fs from "fs";

/*global Buffer, __dirname*/

describe("#Alps", () => {
  describe(".processIsoBmffSegment", () => {
    let alps;

    const originalBuffer = fs.readFileSync(`${__dirname}/examples/test_seg.m4s`);
    const bufferWithSelectedPresentationId0 = fs.readFileSync(`${__dirname}/examples/test_seg_0.m4s`);
    const bufferWithSelectedPresentationId1 = fs.readFileSync(`${__dirname}/examples/test_seg_1.m4s`);
    const bufferWithSelectedPresentationId2 = fs.readFileSync(`${__dirname}/examples/test_seg_2.m4s`);

    describe("Alps initialized with init segment with 5 presentations content", () => {
      const first_period = "1";
      const second_period = "2";

      beforeEach(() => {
        alps = new Alps();
        const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_init.mp4`)).buffer;
        alps.processIsoBmffSegment(buffer);
      });

      describe("activePresentationId in process param", () => {
        it("should change the Segment buffer to buffer with selected presentation id 0 if passed 0 as activePresentationId", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 0);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId0);
        });

        it("should change the Segment buffer to buffer with selected presentation id 1 if passed 1 as activePresentationId", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 1);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);
        });

        it("should change the Segment buffer to buffer with selected presentation id 2 if passed 2 as activePresentationId", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });

        it("should not change the Segment buffer for -1", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, -1);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });

        it("should not change the Segment buffer for 6", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 6);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });
      });

      describe("activePresentationId=1 for period 1", () => {
        beforeEach(() => {
          alps.setActivePresentationId(1, first_period);
        });

        it("should change the Segment buffer for period 1 to presentation 1", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);
        });

        it("should not change the Segment buffer for period 2", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, second_period);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });

        it("should handle different activePresentationIds for multiple periods", () => {
          alps.setActivePresentationId(2, second_period);

          let buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);

          buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, second_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);

          buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });

        it("param with active 0 should take precedence and change buffer to presentation 0", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period, 0);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId0);
        });

        it("param with active 2 should take precedence and change buffer to presentation 2", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });
      });
    });

    describe("Verify incompatible stream protection", () => {
      it.todo("Verify that missing 'prsl' boxes case is handled gracefully");
    });

    describe("External signaling cases", () => {
      const externalPresentations = [
        {
          id: 0,
        },
        {
          id: 1,
        },
        {
          id: 2,
        },
        {
          id: 3,
        },
        {
          id: 4,
        },
      ];

      beforeEach(() => {
        alps = new Alps();
      });

      it("should return unmodified buffer if content has no presentations", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/no_pres_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/no_pres_segment.m4s");

        alps.processIsoBmffSegment(initBuffer);

        const presentations = alps.getPresentations();
        expect(presentations).toEqual([]);

        alps.setActivePresentationId(0);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/no_pres_segment.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses init segment signaling only", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/test_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/test_seg.m4s");

        alps.processIsoBmffSegment(initBuffer);

        const presentations = alps.getPresentations();
        expect(presentations.length > 1);

        alps.setActivePresentationId(presentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses external signaling only", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/no_isobmff_signaling_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/no_isobmff_signaling_segment.m4s");

        alps.processIsoBmffSegment(initBuffer);

        alps.setActivePresentationId(externalPresentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/no_isobmff_signaling_segment.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses both init segment and external signaling", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/test_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/test_seg.m4s");

        alps.processIsoBmffSegment(initBuffer);

        alps.setActivePresentationId(externalPresentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });
    });

    describe("PayloadBase update scenarios", () => {
      /**
       * Byte offset within test_seg_pb*.m4s at which the first sample begins.
       * Derived by inspecting test_seg.m4s (moof._offset=0, sampleStart=456).
       */
      const SAMPLE_START = 456;

      /**
       * Read `width` bits (MSB first) from an ArrayBuffer starting at the bit
       * position `sampleBitPos` relative to the sample start.
       *
       * @param {ArrayBuffer} buffer
       * @param {number} sampleBitPos  Bit offset within the first sample
       * @param {number} width         Number of bits to read
       * @returns {number}
       */
      const readSampleBits = (buffer, sampleBitPos, width) => {
        const view = new DataView(buffer);
        let value = 0;
        for (let i = 0; i < width; i++) {
          const absPos = SAMPLE_START * 8 + sampleBitPos + i;
          const byteIdx = absPos >> 3;
          const bitShift = 7 - (absPos & 7);
          value = (value << 1) | ((view.getUint8(byteIdx) >> bitShift) & 1);
        }
        return value;
      };

      /**
       * Bit position (within the sample) of the 5-bit payload_base_minus1 field.
       * When pbm1 == 31 the three-bit F_variable_bits(3) extension immediately follows
       * at bit EXT_BIT_OFFSET.
       */
      const PBM1_BIT_OFFSET = 30;
      const EXT_BIT_OFFSET = 35;

      /** availableAdditionalBytes = accumulatedShift(19) >>> 3 = 2 for all test_seg_pb*.m4s fixtures. */
      const AVAILABLE_ADDITIONAL_BYTES = 2;

      let alps;
      beforeEach(() => {
        alps = new Alps();
        const initBuffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_init.mp4`)).buffer;
        alps.processIsoBmffSegment(initBuffer);
      });

      describe("branch: newPayloadBase <= 31 (setBits on pbm1 only)", () => {
        // payload_base_minus1 value at bit 30–34 is simply incremented by availableAdditionalBytes.
        it.each([
          // [fixture,             origPayloadBase, expectedPbm1InOutput]
          ["test_seg.m4s", 1, 1 + AVAILABLE_ADDITIONAL_BYTES - 1], // newPB=3,  pbm1=2
          ["test_seg_pb29.m4s", 29, 29 + AVAILABLE_ADDITIONAL_BYTES - 1], // newPB=31, pbm1=30
        ])("%s (payloadBase=%i): pbm1 field should be %i after processing", (filename, _origPB, expectedPbm1) => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/${filename}`)).buffer;
          const result = alps.processIsoBmffSegment(buffer, undefined, 0);

          expect(result.forcedPresentationId).toBe(0);
          expect(readSampleBits(buffer, PBM1_BIT_OFFSET, 5)).toBe(expectedPbm1);
        });
      });

      describe("branch: payloadBase <= 31 → newPayloadBase > 31 → newNewPayloadBase <= 31 (overflow guard)", () => {
        // newPayloadBaseAfterShift = origPB + floor((accumulatedShift − 3) / 8) = origPB + 2
        it.each([["test_seg_pb30.m4s", 30]])(
          "%s (payloadBase=%i): pbm1 → 31 and ext → %i after processing",
          (filename, _origPB) => {
            const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/${filename}`)).buffer;
            const result = alps.processIsoBmffSegment(buffer, undefined, 0);

            expect(result.forcedPresentationId).toBe(null);
            expect(readSampleBits(buffer, PBM1_BIT_OFFSET, 5)).toBe(_origPB - 1);
          },
        );
      });

      describe("branch: payloadBase <= 31 → newPayloadBase > 31 (shiftRight + extension)", () => {
        // After shiftRight(pos=30, width, 3) the two-byte payload_base field expands:
        //   bits 30–34 → pbm1 = 31
        //   bits 35–37 → F_variable_bits(3) extension = newPayloadBaseAfterShift − 32
        // newPayloadBaseAfterShift = origPB + floor((accumulatedShift − 3) / 8) = origPB + 2
        it.each([
          // [fixture,            origPayloadBase, expectedExt]
          ["test_seg_pb31.m4s", 31, 31 + AVAILABLE_ADDITIONAL_BYTES - 32 - 1], // newPBAfterShift=33, ext=1
        ])("%s (payloadBase=%i): pbm1 → 31 and ext → %i after processing", (filename, _origPB, expectedExt) => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/${filename}`)).buffer;
          const result = alps.processIsoBmffSegment(buffer, undefined, 0);

          expect(result.forcedPresentationId).toBe(0);
          expect(readSampleBits(buffer, PBM1_BIT_OFFSET, 5)).toBe(31);
          expect(readSampleBits(buffer, EXT_BIT_OFFSET, 3)).toBe(expectedExt);
          expect(readSampleBits(buffer, EXT_BIT_OFFSET + 3, 1)).toBe(0);
        });
      });

      describe("branch: payloadBase > 31 (setBits on extension field only)", () => {
        // pbm1 stays 31; only the 3-bit extension at bit 35 is updated.
        // newPayloadBase = origPB + availableAdditionalBytes, ext = newPB − 32.
        it.each([
          // [fixture,            origPayloadBase, expectedExt]
          ["test_seg_pb32.m4s", 32, 32 + AVAILABLE_ADDITIONAL_BYTES - 32], // newPB=34, ext=2
          ["test_seg_pb37.m4s", 37, 37 + AVAILABLE_ADDITIONAL_BYTES - 32], // newPB=39, ext=7
        ])("%s (payloadBase=%i): pbm1 stays 31 and ext → %i after processing", (filename, _origPB, expectedExt) => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/${filename}`)).buffer;
          const result = alps.processIsoBmffSegment(buffer, undefined, 0);

          expect(result.forcedPresentationId).toBe(0);
          expect(readSampleBits(buffer, PBM1_BIT_OFFSET, 5)).toBe(31);
          expect(readSampleBits(buffer, EXT_BIT_OFFSET, 3)).toBe(expectedExt);
          expect(readSampleBits(buffer, EXT_BIT_OFFSET + 3, 1)).toBe(0);
        });
      });

      describe("branch: newPayloadBase > 39 (overflow guard)", () => {
        // payloadBase=38 → newPB=40 exceeds the maximum of 39; processing must abort.
        it("test_seg_pb38.m4s (payloadBase=38): processIsoBmffSegment should return forcedPresentationId=null", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg_pb38.m4s`)).buffer;
          const result = alps.processIsoBmffSegment(buffer, undefined, 0);

          expect(result.forcedPresentationId).toBeNull();
        });
      });
    });
  });
});
