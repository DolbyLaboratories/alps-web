/************************************************************************************************************
 *                Copyright (C) 2025-2026 by Dolby International AB.
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

import { processIsoBmffInitSegment, processIsoBmffMediaSegment } from "../src/alps_core";
import * as isoBmffBox from "../src/constants/isobmff_box_names.js";
import * as tocElements from "../src/constants/toc_elements.js";
import { parseTocElements } from "../src/ac4_toc_parser_wrapper/index.js";
import { getSampleOffsets } from "../src/get_sample_offsets.js";

jest.mock("../src/ac4_toc_parser_wrapper/index.js");
jest.mock("../src/get_sample_offsets.js");

const createMockParsedSegmentBuffer = (movieBox = null, metaBox = null) => ({
  fetch: jest.fn(function (type) {
    if (type === isoBmffBox.MOVIE) return movieBox;
    if (type === isoBmffBox.META) return metaBox;
    return null;
  }),
});

const createMockMovieBox = (tracks = []) => ({
  boxes: tracks,
});

const createMockTrack = (trackId) => ({
  type: isoBmffBox.TRACK,
  boxes: [
    {
      type: isoBmffBox.TRACK_HEADER,
      track_ID: trackId,
    },
  ],
});

const createMockMetaBox = (preselectionGroups = []) => ({
  boxes: [
    {
      type: isoBmffBox.GROUPS_LIST,
      boxes: preselectionGroups,
    },
  ],
});

const createMockPreselectionGroup = (options = {}) => ({
  type: isoBmffBox.PRESELECTION_GROUP,
  entities: options.entities || [],
  preselection_tag: options.preselection_tag || null,
  selection_priority: options.selection_priority || null,
  boxes: options.boxes || [],
});

const minimalPreselectionGroupOptions = {
  entities: [{ entity_id: 1 }],
};

const fullPreselectionGroupOptions = {
  entities: [{ entity_id: 1 }],
  preselection_tag: "1",
  selection_priority: 1,
  boxes: [
    {
      type: isoBmffBox.USER_DATA,
      boxes: [
        {
          type: isoBmffBox.DIALOG_PROCESSING,
          dialog_gain: 62,
        },
      ],
    },
    {
      type: isoBmffBox.EXTENDED_LANGUAGE_TAG,
      extended_language: "en",
    },
    {
      type: isoBmffBox.AUDIO_RENDERING_INDICATION,
      audio_rendering_indication: 3,
    },
    {
      type: isoBmffBox.LABEL,
      is_group_label: true,
      label: "commentary",
      label_id: 1,
      language: "en",
    },
    {
      type: isoBmffBox.KIND,
      schemeURI: "tag:example.com,2025:alps:unit_test:2025",
      value: "example",
    },
  ],
};

const minimalParsedPresentation = {
  audioRenderingIndication: null,
  dialogGain: null,
  extendedLanguage: null,
  id: null,
  kinds: [],
  labels: [],
  selectionPriority: null,
};

const fullParsedPresentation = {
  audioRenderingIndication: 3,
  dialogGain: 31,
  extendedLanguage: "en",
  id: 1,
  kinds: [
    {
      schemeURI: "tag:example.com,2025:alps:unit_test:2025",
      value: "example",
    },
  ],
  labels: [
    {
      isGroupLabel: true,
      label: "commentary",
      labelId: 1,
      language: "en",
    },
  ],
  selectionPriority: 1,
};

describe("AlpsCore", () => {
  describe(".processIsoBmffInitSegment", () => {
    it("should return empty list if 'moov' box is missing", () => {
      const initSegmentNoMoov = createMockParsedSegmentBuffer(null, createMockMetaBox());
      const resultNoMoov = processIsoBmffInitSegment(initSegmentNoMoov);
      expect(resultNoMoov).toEqual([]);
    });

    it("should return empty list if 'meta' box is missing", () => {
      const initSegmentNoMeta = createMockParsedSegmentBuffer(createMockMovieBox(), null);
      const resultNoMeta = processIsoBmffInitSegment(initSegmentNoMeta);
      expect(resultNoMeta).toEqual([]);
    });

    it("should return empty list if 'grpl' box is missing", () => {
      const initSegmentNoGrpl = createMockParsedSegmentBuffer(createMockMovieBox(), { boxes: [] });
      const resultNoGrpl = processIsoBmffInitSegment(initSegmentNoGrpl);
      expect(resultNoGrpl).toEqual([]);
    });

    it("should return empty list if there is no 'prsl' box", () => {
      const initSegmentNoPrsl = createMockParsedSegmentBuffer(createMockMovieBox(), createMockMetaBox());
      const resultNoPrsl = processIsoBmffInitSegment(initSegmentNoPrsl);
      expect(resultNoPrsl).toEqual([]);
    });

    it("should parse presentation for valid preselection group", () => {
      const tracks = [createMockTrack(1)];
      const preselectionGroups = [createMockPreselectionGroup(fullPreselectionGroupOptions)];
      const initSegment = createMockParsedSegmentBuffer(
        createMockMovieBox(tracks),
        createMockMetaBox(preselectionGroups),
      );
      const resultInvalidTrackReference = processIsoBmffInitSegment(initSegment);
      expect(resultInvalidTrackReference).toEqual([fullParsedPresentation]);
    });

    it("should parse presentation for preselection with minimal info", () => {
      const tracks = [createMockTrack(1)];
      const preselectionGroups = [createMockPreselectionGroup(minimalPreselectionGroupOptions)];
      const initSegment = createMockParsedSegmentBuffer(
        createMockMovieBox(tracks),
        createMockMetaBox(preselectionGroups),
      );
      const resultInvalidTrackReference = processIsoBmffInitSegment(initSegment);
      expect(resultInvalidTrackReference).toEqual([minimalParsedPresentation]);
    });

    it("should filter out preselections that reference tracks from outside the file", () => {
      const tracks = [createMockTrack(1)];
      const preselectionGroupOptions = { ...fullPreselectionGroupOptions, entities: [{ entity_id: 2 }] };
      const preselectionGroups = [createMockPreselectionGroup(preselectionGroupOptions)];
      const initSegment = createMockParsedSegmentBuffer(
        createMockMovieBox(tracks),
        createMockMetaBox(preselectionGroups),
      );
      const resultInvalidTrackReference = processIsoBmffInitSegment(initSegment);
      expect(resultInvalidTrackReference).toEqual([]);
    });

    it.each([
      { dialogGain: -128, expected: -64 },
      { dialogGain: 127, expected: 63.5 },
      { dialogGain: 0, expected: 0 },
    ])("should parse dialog_gain $dialogGain as $expected", ({ dialogGain, expected }) => {
      const tracks = [createMockTrack(1)];
      const preselectionGroupOptions = {
        ...minimalPreselectionGroupOptions,
        boxes: [
          {
            type: isoBmffBox.USER_DATA,
            boxes: [
              {
                type: isoBmffBox.DIALOG_PROCESSING,
                dialog_gain: dialogGain,
              },
            ],
          },
        ],
      };
      const preselectionGroups = [createMockPreselectionGroup(preselectionGroupOptions)];
      const initSegment = createMockParsedSegmentBuffer(
        createMockMovieBox(tracks),
        createMockMetaBox(preselectionGroups),
      );
      const result = processIsoBmffInitSegment(initSegment);

      expect(result).toEqual([
        {
          ...minimalParsedPresentation,
          dialogGain: expected,
        },
      ]);
    });
  });

  describe(".processIsoBmffMediaSegment", () => {
    // Bit layout used by all tests:
    //   Bits  0–2  : presentation_level for presentation 1          (byte 0)
    //   Bit   3    : b_presentation_id for presentation 1           (byte 0)
    //   Bits  4–6  : presentation_level for presentation 2          (byte 0)
    //   Bit   7    : b_presentation_id for presentation 2           (byte 0)
    //   Bits 40–44 : payload_base_minus1 (5-bit field)              (byte 5, top 5 bits)
    //   Bits 45–47 : extended payload_base field (3-bit)            (byte 5, bottom 3 bits)
    //   Bit  80    : ac4_toc_end position marker
    //
    // Both presentation IDs have zero width (before_call.pos == after_call.pos) so
    // accumulatedShift from ID removal is always 0. accumulatedShift is controlled
    // exclusively via the BYTE_ALIGNMENT element width.
    const PBM1_POS = 40;
    const TOC_END_POS = 80;
    const BYTE5 = 5; // byte index containing bits 40–47

    // Build the parsedElements array returned by the mocked parseTocElements.
    //   pbm1Value        : 5-bit payload_base_minus1 value (0–31)
    //   payloadBaseValue : when provided, adds the PAYLOAD_BASE after_add element (32–39)
    //   byteAlignmentWidth : sets accumulatedShift via BYTE_ALIGNMENT (default 0)
    const buildParsedElements = ({ pbm1Value, payloadBaseValue = undefined, byteAlignmentWidth = 0 } = {}) => [
      // Presentation 1 (id=1)
      { name: tocElements.PRESENTATION_LEVEL, pos: 0, value: 3, width: 3, handler: undefined },
      { name: tocElements.B_PRESENTATION_ID, pos: 3, value: 1, width: 1, handler: undefined },
      { name: tocElements.PRESENTATION_ID, pos: 4, value: null, width: null, handler: "before_call" },
      { name: tocElements.PRESENTATION_ID, pos: 4, value: 1, width: null, handler: "after_call" },
      // Presentation 2 (id=2)
      { name: tocElements.PRESENTATION_LEVEL, pos: 4, value: 3, width: 3, handler: undefined },
      { name: tocElements.B_PRESENTATION_ID, pos: 7, value: 1, width: 1, handler: undefined },
      { name: tocElements.PRESENTATION_ID, pos: 8, value: null, width: null, handler: "before_call" },
      { name: tocElements.PRESENTATION_ID, pos: 8, value: 2, width: null, handler: "after_call" },
      // payload_base_minus1 (written by write_uint, no handler)
      { name: tocElements.PAYLOAD_BASE_MINUS1, pos: PBM1_POS, value: pbm1Value, width: 5, handler: undefined },
      // optional PAYLOAD_BASE (extended form, written by after_add)
      ...(payloadBaseValue !== undefined
        ? [{ name: tocElements.PAYLOAD_BASE, pos: null, value: payloadBaseValue, width: null, handler: "after_add" }]
        : []),
      // optional byte alignment (adds to accumulatedShift)
      ...(byteAlignmentWidth > 0
        ? [{ name: tocElements.BYTE_ALIGNMENT, pos: null, value: 0, width: byteAlignmentWidth, handler: "write_align" }]
        : []),
      // ac4_toc_end
      { name: tocElements.AC4_TOC_END, pos: TOC_END_POS, value: null, width: null, handler: "after_position" },
    ];

    let rawBuffer;
    let parsedSegmentBuffer;

    beforeEach(() => {
      rawBuffer = new ArrayBuffer(20);
      parsedSegmentBuffer = { _raw: { buffer: rawBuffer } };
      getSampleOffsets.mockReturnValue([{ offset: 0, size: 20 }]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // ─── newPayloadBase > 39 ──────────────────────────────────────────────────

    it("should return null when newPayloadBase = 40 (overflow > 39)", () => {
      // payloadBase=39, 1 additional byte (8 bits alignment) → newPayloadBase=40
      parseTocElements.mockReturnValue(
        buildParsedElements({ pbm1Value: 31, payloadBaseValue: 39, byteAlignmentWidth: 8 }),
      );
      const result = processIsoBmffMediaSegment(parsedSegmentBuffer, 1);
      expect(result).toBeNull();
      expect(new DataView(rawBuffer).getUint8(BYTE5)).toBe(0x00); // buffer untouched
    });

    // ─── newPayloadBase <= 31  (updatepayloadBaseMinus1 directly) ────────────
    //
    // setBits(PBM1_POS=40, width=5, value=pbm1Value + additionalBytes) writes the
    // top 5 bits of byte 5.  With additionalBytes=0:
    //   value=0  → byte5 = 0b00000_000 = 0x00
    //   value=29 → byte5 = 0b11101_000 = 0xE8
    //   value=30 → byte5 = 0b11110_000 = 0xF0

    test.each([
      { desc: "payloadBase=1  (pbm1=0,  newPayloadBase=1)", pbm1Value: 0, expectedByte5: 0x00 },
      { desc: "payloadBase=30 (pbm1=29, newPayloadBase=30)", pbm1Value: 29, expectedByte5: 0xe8 },
      { desc: "payloadBase=31 (pbm1=30, newPayloadBase=31)", pbm1Value: 30, expectedByte5: 0xf0 },
    ])("newPayloadBase <= 31: $desc → setBits 5-bit field", ({ pbm1Value, expectedByte5 }) => {
      parseTocElements.mockReturnValue(buildParsedElements({ pbm1Value }));
      const result = processIsoBmffMediaSegment(parsedSegmentBuffer, 1);
      expect(result).toBe(1);
      expect(new DataView(rawBuffer).getUint8(BYTE5)).toBe(expectedByte5);
    });

    // ─── payloadBase > 31 already, newPayloadBase > 31 ───────────────────────
    //
    // Only the 3-bit extension at bits 45–47 (byte 5 low 3 bits) is updated:
    //   setBits(PBM1_POS+5=45, width=3, value=payloadBase-32)
    //   payloadBase=32 → ext=0 → byte5 = 0x00
    //   payloadBase=33 → ext=1 → byte5 = 0x01
    //   payloadBase=39 → ext=7 → byte5 = 0x07

    test.each([
      { desc: "payloadBase=32 (ext=0)", payloadBaseValue: 32, expectedByte5: 0x00 },
      { desc: "payloadBase=33 (ext=1)", payloadBaseValue: 33, expectedByte5: 0x01 },
      { desc: "payloadBase=39 (ext=7)", payloadBaseValue: 39, expectedByte5: 0x07 },
    ])("payloadBase already > 31: $desc → setBits 3-bit extension only", ({ payloadBaseValue, expectedByte5 }) => {
      // pbm1Value=31 is the sentinel the bitstream always carries when payload_base > 31
      parseTocElements.mockReturnValue(buildParsedElements({ pbm1Value: 31, payloadBaseValue }));
      const result = processIsoBmffMediaSegment(parsedSegmentBuffer, 1);
      expect(result).toBe(1);
      expect(new DataView(rawBuffer).getUint8(BYTE5)).toBe(expectedByte5);
    });

    // ─── payloadBase <= 31, but newPayloadBase > 31 (transition) ─────────────

    it("transition: payloadBase=30, 3 additional bytes → shiftRight + setBits(31) + setBits(ext=0)", () => {
      // accumulatedShift=24b → availableAdditionalBytes=3 → newPayloadBase=30+3=33
      // payloadBase=30 <= 31, newPayloadBase=33 > 31 → insert extension
      // newAccumulatedShift=24-3=21 → newAvailableAdditionalBytes=2
      // newPayloadBaseAfterShift=30+2=32 > 31 → proceeds
      // shiftRight(pos=40, width=40, shift=3) on zeroed buffer → no change
      // setBits(40, 5, 31) → top 5 bits of byte5 = 0b11111 → 0xF8
      // setBits(45, 3, 0)  → low 3 bits stay 0
      parseTocElements.mockReturnValue(buildParsedElements({ pbm1Value: 29, byteAlignmentWidth: 24 }));
      const result = processIsoBmffMediaSegment(parsedSegmentBuffer, 1);
      expect(result).toBe(1);
      expect(new DataView(rawBuffer).getUint8(BYTE5)).toBe(0xf8);
    });

    it("transition impossible: payloadBase=31, 1 additional byte → newPayloadBase=32, but newPayloadBaseAfterShift=31 → returns null", () => {
      // accumulatedShift=8b → availableAdditionalBytes=1 → newPayloadBase=31+1=32
      // payloadBase=31 <= 31, newPayloadBase=32 > 31 → try to insert extension
      // newAccumulatedShift=8-3=5 → newAvailableAdditionalBytes=0
      // newPayloadBaseAfterShift=31+0=31 <= 31 → "Impossible to shift and not to shift" → null
      parseTocElements.mockReturnValue(buildParsedElements({ pbm1Value: 30, byteAlignmentWidth: 8 }));
      const result = processIsoBmffMediaSegment(parsedSegmentBuffer, 1);
      expect(result).toBeNull();
    });
  });
});
