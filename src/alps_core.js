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
 * @desc AlpsCore
 */

import * as isoBmffBox from "./constants/isobmff_box_names.js";
import * as tocElements from "./constants/toc_elements.js";
import { setBits, shiftLeft } from "./bitwise_operations.js";
import { getSampleOffsets } from "./get_sample_offsets.js";
import { parseTocElements } from "./ac4_toc_parser_wrapper/index.js";

const PRESENTATION_LEVEL_WIDTH = 3;
const UNDECODABLE_PRESENTATION_LEVEL = 7;
const BITS_TO_SHIFT_TO_DIVIDE_BY_8 = 3;
const MINIMUM_PRESENTATIONS_AMOUNT = 2;

const elementsToParse = [
  tocElements.PRESENTATION_LEVEL,
  tocElements.B_PRESENTATION_ID,
  tocElements.PRESENTATION_ID,
  tocElements.PAYLOAD_BASE_MINUS1,
  tocElements.BYTE_ALIGNMENT,
  tocElements.AC4_TOC_END,
];

/**
 * Presentation entity.
 * @typedef {Object} Presentation
 * @property {number} id - id of presentation - preselection_tag from init segment and presentation_id in TOC
 * @property {string} label - label for presentation as read from isoBMFF box labl
 * @property {string} language - language tag as read from isoBMFF box elng
 */

/**
 * Provides the core functionality of the library. It allows to process ISOBMFF segments and manage presentations.
 */
/**
 * Process an ISOBMFF Init segment buffer
 * @param {ISOBoxer} parsedSegmentBuffer - The ISOBMFF segment buffer to process
 * @returns {Presentation[]} - List of presentations read from Init ISO BMFF Segment
 */
const processIsoBmffInitSegment = (parsedSegmentBuffer) => {
  // parse the segment that was just handed in
  const movie = parsedSegmentBuffer.fetch(isoBmffBox.MOVIE);
  const meta = parsedSegmentBuffer.fetch(isoBmffBox.META);

  console.log("ALPS::processIsoBmffSegment - found init segment");

  // Any new init segment replaces the old contents entirely.
  const presentations = [];
  const groupsList = meta && meta.boxes.find((box) => box.type === isoBmffBox.GROUPS_LIST);
  const preselectionGroups = groupsList && groupsList.boxes.filter((box) => box.type === isoBmffBox.PRESELECTION_GROUP);
  const tracks = movie.boxes.filter((box) => box.type === isoBmffBox.TRACK);
  const trackIds = tracks.map((track) => {
    const trackHeader = track.boxes.find((box) => box.type === isoBmffBox.TRACK_HEADER);
    return trackHeader.track_ID;
  });

  if (Array.isArray(preselectionGroups)) {
    for (const preselectionGroup of preselectionGroups) {
      // filter out those preselection groups that reference tracks only from within this file
      // (that is, where every entity_ID is also the ID of a track in the file)
      // and that have a preselection_tag set so that we reference to it
      if (
        preselectionGroup.entities.every((entity) => trackIds.includes(entity.entity_id)) &&
        preselectionGroup.preselection_tag
      ) {
        const id = parseInt(preselectionGroup.preselection_tag, 10);

        const labelBox = preselectionGroup.boxes.find((box) => box.type === isoBmffBox.LABEL && !box.is_group_label);
        const label = labelBox ? labelBox.label : undefined;

        const languageBox = preselectionGroup.boxes.find((box) => box.type === isoBmffBox.EXTENDED_LANGUAGE_TAG);
        const language = languageBox ? languageBox.extended_language : undefined;

        // append parsed presentation object
        presentations.push({ id, label, language });
      }
    }
  } else {
    console.log("ALPS::processIsoBmffSegment - no preselection group found");
  }

  return presentations;
};

/**
 * Process an ISOBMFF segment buffer
 * @param {ISOBoxer} parsedSegmentBuffer - The ISOBMFF segment buffer to process
 * @returns {number|undefined} Presentation ID of enforced presentation
 */
const processIsoBmffMediaSegment = (parsedSegmentBuffer, activePresentationId) => {
  // parse the segment that was just handed in
  console.log(`ALPS::processIsoBmffSegment - processing moof media. ActivePresentation: ${activePresentationId}`);

  // this is the data segment
  // determine the offsets to all samples
  const sampleOffsets = getSampleOffsets(parsedSegmentBuffer);

  console.log(`ALPS::processIsoBmffSegment - obtained ${sampleOffsets.length} sample offsets`);

  for (const sampleOffset of sampleOffsets) {
    const sampleData = new DataView(parsedSegmentBuffer._raw.buffer, sampleOffset.offset, sampleOffset.size);
    const parsedElements = parseTocElements(sampleData, elementsToParse);

    if (parsedElements === null) {
      console.log("ALPS::processIsobmffSegment - parsing error");
      return null;
    }

    const payloadBaseMinus1 = parsedElements.find((element) => element.name === tocElements.PAYLOAD_BASE_MINUS1);
    if (!payloadBaseMinus1) {
      console.log("ALPS::processIsobmffSegment - payloadBaseMinus1 field not found, returning unmodified buffer");
      return null;
    }

    let accumulatedShift = 0;
    const byteAlignment = parsedElements.find((element) => element.name === tocElements.BYTE_ALIGNMENT);
    if (byteAlignment) {
      accumulatedShift = byteAlignment.width;
    }

    const ac4TocEnd = parsedElements.find((element) => element.name === tocElements.AC4_TOC_END);

    // filter the table to produce a list of preselections complete with ID, a list of b_presentation_ids and a list of presentation_ids
    const presentationOffsets = [];
    const bPresentationIds = [];

    parsedElements.forEach((element) => {
      switch (element.name) {
        case tocElements.PRESENTATION_LEVEL: {
          presentationOffsets.push({ pos: element.pos, value: element.value, width: element.width });
          break;
        }
        case tocElements.PRESENTATION_ID: {
          const lastPresentationOffset = presentationOffsets[presentationOffsets.length - 1];

          // modify last seen presentation. If there was none, this is an error:
          // a presentation_id would always follow, never preceed, the level
          if (presentationOffsets.length === 0) {
            console.error("Encountered a presentationID without a presentation");
          }
          if (element.handler === "before_call") {
            lastPresentationOffset.presentationIdPos = element.pos;
          }
          if (element.handler === "after_call") {
            lastPresentationOffset.presentationId = element.value;
            const width = element.pos - lastPresentationOffset.presentationIdPos;
            lastPresentationOffset.presentationIdWidth = width;
            accumulatedShift += width;
          }
          break;
        }
        case tocElements.B_PRESENTATION_ID: {
          bPresentationIds.push(element);
          break;
        }
        case tocElements.PAYLOAD_BASE_MINUS1:
        case tocElements.BYTE_ALIGNMENT:
        case tocElements.AC4_TOC_END: {
          break;
        }
        default: {
          console.error(`Unknown TOC parsed element: ${element.name}`);
        }
      }
    });

    // if there are less than 2 presentations in TOC - return unmodified buffer
    if (presentationOffsets.length < MINIMUM_PRESENTATIONS_AMOUNT) {
      console.log("ALPS::processIsobmffSegment - less then 2 presentations found");
      return null;
    }

    // check that all presentations carry an ID
    if (presentationOffsets.some((presentation) => presentation.presentationId === undefined)) {
      console.error("Not every presentation carries an ID");
      return null;
    }

    if (presentationOffsets.every((offset) => offset.presentationId !== activePresentationId)) {
      console.log("ALPS::processIsobmffSegment - activePresentationId not found in TOC");
      return null;
    }

    // set presentation level to 7 for inactive presentations
    presentationOffsets.forEach((presentation) => {
      const presentationId = presentation.presentationId;

      if (presentation.width !== PRESENTATION_LEVEL_WIDTH) {
        console.warn(`Presentation level has unexpected width: ${presentation.width}`);
      }

      // in all presentations except the selected one, overwrite presentation level with "7"
      if (activePresentationId !== presentationId) {
        // updating inactive presentation with undecodable presentation level
        setBits(sampleData, presentation.pos, presentation.width, UNDECODABLE_PRESENTATION_LEVEL);
      }
    });

    // add available bytes to payload_base_minus1 (>>> is more efficient than Math.floor)
    const availableAdditionalBytes = accumulatedShift >>> BITS_TO_SHIFT_TO_DIVIDE_BY_8;

    // update payloadbase_minus_1
    setBits(
      sampleData,
      payloadBaseMinus1.pos,
      payloadBaseMinus1.width,
      payloadBaseMinus1.value + availableAdditionalBytes,
    );

    // set all b_presentation_id fields to 0
    bPresentationIds.forEach((bPresentationId) => {
      setBits(sampleData, bPresentationId.pos, bPresentationId.width, 0);
    });

    // bit shifting
    presentationOffsets
      .slice()
      .reverse()
      .forEach((presentation) => {
        const shiftWidth = ac4TocEnd.pos - presentation.presentationIdPos;
        shiftLeft(sampleData, presentation.presentationIdPos, shiftWidth, presentation.presentationIdWidth);
      });
  }

  console.log("ALPS::processIsoBmffSegment - done");

  return activePresentationId;
};

export { processIsoBmffInitSegment, processIsoBmffMediaSegment };
