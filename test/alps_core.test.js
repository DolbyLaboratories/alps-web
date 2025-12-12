/************************************************************************************************************
 *                Copyright (C) 2025 by Dolby International AB.
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

import { processIsoBmffInitSegment } from "../src/alps_core";
import * as isoBmffBox from "../src/constants/isobmff_box_names.js";

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
          dialog_gain: 1536,
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
  dialogGain: 6,
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
  });
});
