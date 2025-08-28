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
 * @desc The main entry point for the Alps library. This file exports the `Alps` class, which provides the core functionality of the library.
 */

import * as isoBmffBox from "./constants/isobmff_box_names.js";
import * as tocElements from "./constants/toc_elements.js";
import { setBits, shiftLeft } from "./bitwise_operations.js";
import ISOBoxer from "codem-isoboxer";
import { getSampleOffsets } from "./get_sample_offsets.js";
import { parseTocElements } from "./ac4_toc_parser_wrapper";

const PRESENTATION_LEVEL_WIDTH = 3;
const UNDECODABLE_PRESENTATION_LEVEL = 7;
const BITS_TO_SHIFT_TO_DIVIDE_BY_8 = 3;

const elementsToParse = [
  tocElements.PRESENTATION_LEVEL,
  tocElements.B_PRESENTATION_ID,
  tocElements.PRESENTATION_ID,
  tocElements.PAYLOAD_BASE_MINUS1,
  tocElements.BYTE_ALIGNMENT,
  tocElements.AC4_TOC_END,
];

/**
 * This callback is called when list of presentations changes, eg. new init segment is processed for multi-period dash contents.
 *
 * @callback presentationsChangedCallback
 */

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
export class Alps {
  #presentations = [];
  #activePresentationId;
  #presentationsChangedEventHandler;

  /**
   * Create the ALPS object
   */
  constructor() {
    console.log("ALPS::constructor");
  }

  /**
   * Set presentationsChangedEventHandler
   * @param {presentationsChangedCallback} presentationsChangedEventHandler Callback function that will be called if the list of presentations changes
   */
  setPresentationsChangedEventHandler(presentationsChangedEventHandler) {
    console.log("ALPS::setPresentationsChangedEventHandler");
    this.#presentationsChangedEventHandler = presentationsChangedEventHandler;
  }

  /**
   * Get the list of available presentations
   * @returns {Presentation[]} An array of presentation objects containing id, label, and language properties
   */
  getPresentations() {
    console.log(`ALPS::getPresentations - List of presentations: ${JSON.stringify(this.#presentations)}`);
    return this.#presentations;
  }

  /**
   * Get the ID of the currently active presentation
   * @returns {number|undefined} The ID of the active presentation or undefined if no presentation is set
   */
  getActivePresentationId() {
    console.log(`ALPS::getActivePresentation - activePresentation: ${this.#activePresentationId}`);
    return this.#activePresentationId;
  }

  /**
   * Set the ID of the active presentation
   * @param {number|undefined} presentationId - The ID of the presentation to set as active or undefined to select the default presentation
   */
  setActivePresentationId(presentationId) {
    console.log(`ALPS::setActivePresentation - new activePresentation: ${presentationId}`);
    this.#activePresentationId = presentationId;
  }

  /**
   * Process an ISOBMFF segment buffer
   * @param {ArrayBuffer} segmentBuffer - The ISOBMFF segment buffer to process
   */
  processIsoBmffSegment(segmentBuffer) {
    // parse the segment that was just handed in
    console.log("ALPS::processIsoBmffSegment");
    const parsedSegmentBuffer = ISOBoxer.parseBuffer(segmentBuffer);
    const movie = parsedSegmentBuffer.fetch(isoBmffBox.MOVIE);
    const meta = parsedSegmentBuffer.fetch(isoBmffBox.META);

    // if this is the init segment - parse presentations
    if (movie && meta) {
      console.log("ALPS::processIsoBmffSegment - found init segment");

      // Any new init segment replaces the old contents entirely.
      this.#presentations = [];
      const groupsList = meta && meta.boxes.find((box) => box.type === isoBmffBox.GROUPS_LIST);
      const preselectionGroups =
        groupsList && groupsList.boxes.filter((box) => box.type === isoBmffBox.PRESELECTION_GROUP);
      const tracks = movie.boxes.filter((box) => box.type === isoBmffBox.TRACK);
      const trackIds = tracks.map((track) => {
        const trackHeader = track.boxes.find((box) => box.type === isoBmffBox.TRACK_HEADER);
        return trackHeader.track_ID;
      });

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
          this.#presentations.push({ id, label, language });
        }
      }
      if (this.#presentationsChangedEventHandler) {
        this.#presentationsChangedEventHandler();
      }
    }

    const movieFragment = parsedSegmentBuffer.fetch(isoBmffBox.MOVIE_FRAGMENT);
    if (movieFragment) {
      console.log(
        `ALPS::processIsoBmffSegment - processing moof media. ActivePresentation: ${this.#activePresentationId}`,
      );
      const activePresentation = this.#presentations.find(
        (presentation) => presentation.id === this.#activePresentationId,
      );

      // If there is no selected presentation, return an unmodified buffer
      if (activePresentation === undefined) {
        console.log("ALPS::processIsoBmffSegment - presentation not found. Return unmodified buffer");
        return;
      }

      console.log("ALPS::processIsoBmffSegment - found data segment, enabled pres: ", activePresentation);

      // this is the data segment
      // determine the offsets to all samples
      const sampleOffsets = getSampleOffsets(parsedSegmentBuffer);

      console.log(`ALPS::processIsoBmffSegment - obtained ${sampleOffsets.length} sample offsets`);

      for (const sampleOffset of sampleOffsets) {
        const sampleData = new DataView(parsedSegmentBuffer._raw.buffer, sampleOffset.offset, sampleOffset.size);
        const parsedElements = parseTocElements(sampleData, elementsToParse);

        let accumulatedShift = 0;
        const payloadBaseMinus1 = parsedElements.find((element) => element.name === tocElements.PAYLOAD_BASE_MINUS1);
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
            default: {
              console.error(`Unknown TOC parsed element: ${element.name}`);
            }
          }
        });

        // check that all presentations carry an ID
        if (presentationOffsets.some((presentation) => presentation.presentationId === undefined)) {
          console.error("Not every presentation carries an ID");
          return;
        }

        if (presentationOffsets.every((offset) => offset.presentationId !== this.#activePresentationId)) {
          console.log("ALPS::processIsobmffSegment - activePresentationId not found in TOC");
          return;
        }

        // set presentation level to 7 for inactive presentations
        presentationOffsets.forEach((presentation) => {
          const presentationId = presentation.presentationId;

          if (presentation.width !== PRESENTATION_LEVEL_WIDTH) {
            console.warn(`Presentation level has unexpected width: ${presentation.width}`);
          }

          // in all presentations except the selected one, overwrite presentation level with "7"
          if (this.#activePresentationId !== presentationId) {
            // updating inactive presentation with undecodable presentation level
            setBits(sampleData, presentation.pos, presentation.width, UNDECODABLE_PRESENTATION_LEVEL);
          }
        });

        // add available bytes to payload_base_minus1 (>>> is more efficient than Math.floor)
        const availableAdditionalBytes = accumulatedShift >>> BITS_TO_SHIFT_TO_DIVIDE_BY_8;
        if (payloadBaseMinus1) {
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
      }
    }
    console.log("ALPS::processIsoBmffSegment - done");
  }
}
