/************************************************************************************************************
 *                Copyright (C) 2023-2026 by Dolby International AB.
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
 * @desc The main entry point for the ALPS library. This file exports the `Alps` class, which provides the core functionality of the library.
 */

import * as isoBmffBox from "./constants/isobmff_box_names.js";

import { processIsoBmffInitSegment, processIsoBmffMediaSegment } from "./alps_core.js";

import ISOBoxer from "codem-isoboxer";

const SEGMENT_TYPES = {
  INIT: "init",
  MEDIA: "media",
};

/* eslint-disable */
ISOBoxer.addBoxProcessor("diap", function () {
  this._procFullBox();
  this._procField("dialog_gain", "int", 8);
});
/* eslint-enable */

/**
 * This callback is called when list of presentations changes, e.g. new init segment is processed for multi-period DASH contents.
 * @callback presentationsChangedCallback
 * @param {PresentationsChangedEvent} event
 */

/**
 * Event data for presentationsChangedCallback
 * @typedef {Object} PresentationsChangedEvent
 * @property {string|null} streamId - ID of the stream for which the presentations were parsed
 */

/**
 * ALPS Data for stream
 * @typedef {Object} Stream
 * @property {import('./types.js').Presentation[]} presentations - presentation related to the stream
 * @property {number|undefined} activePresentationId - current active presentation ID for the stream
 */

/**
 * Buffer processing result for init segment.
 * @typedef {Object} ProcessIsoBmffInitSegmentResult
 * @property {"init"} segmentType - "init" indicating that segment is an init segment
 * @property {import('./types.js').Presentation[]} presentations - list of presentations read from ISOBMFF init segment
 * @property {null} forcedPresentationId - always null for init segments
 */

/**
 * Buffer processing result for media segment.
 * @typedef {Object} ProcessIsoBmffMediaSegmentResult
 * @property {"media"} segmentType - "media" indicating that segment is a media segment
 * @property {null} presentations - null for media segments
 * @property {number|null} forcedPresentationId - ID of presentation selected in bitstream, null when no presentation was selected
 */

/**
 * Buffer processing result for unknown segment.
 * @typedef {Object} ProcessIsoBmffUnknownSegmentResult
 * @property {null} segmentType - null indicating that segment type is unknown
 * @property {null} presentations - null for unknown segments
 * @property {null} forcedPresentationId - null for unknown segments
 */

/**
 * Buffer processing result.
 * @typedef {ProcessIsoBmffInitSegmentResult|ProcessIsoBmffMediaSegmentResult|ProcessIsoBmffUnknownSegmentResult} ProcessIsoBmffSegmentResult
 */

// Export shared types
export * from "./types.js";

/**
 * Provides the core functionality of the library. It allows to process ISOBMFF segments and manage presentations.
 */
export class Alps {
  /** @type {Record<string,Stream>} */
  #streams = {};
  /** @type {presentationsChangedCallback|undefined} */
  #presentationsChangedEventHandler;

  #initializeStream(streamId) {
    if (this.#streams[streamId] === undefined) {
      this.#streams[streamId] = { activePresentationId: -1, presentations: [] };
    }
  }

  /**
   * Create the ALPS object
   */
  constructor() {
    console.log("ALPS::constructor");
  }

  /**
   * Get presentation and activePresentationId for all streams
   * @returns {Record<string,Stream>} Data for all streams present in current ALPS state
   */
  getStreams() {
    return this.#streams;
  }

  /**
   * Clear data for unused stream
   * @param {string|null} streamId Stream ID which should be deleted, null for non-multi-period use
   */
  clearStream(streamId = null) {
    delete this.#streams[streamId];
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
   * @param {string|null} streamId The ID of the stream, null for non-multi-period use
   * @returns {import('./types.js').Presentation[]} An array of presentation objects
   */
  getPresentations(streamId = null) {
    this.#initializeStream(streamId);
    console.log(
      `ALPS::getPresentations - List of presentations: ${JSON.stringify(this.#streams[streamId].presentations)}`,
    );
    return this.#streams[streamId].presentations;
  }

  /**
   * Get the ID of the currently active presentation
   * @param {string|null} streamId The ID of the stream, null for non-multi-period use
   * @returns {number|undefined} The ID of the active presentation, -1 if no presentation is set, undefined if no stream data exists
   */
  getActivePresentationId(streamId = null) {
    console.log(`ALPS::getActivePresentation - activePresentation: ${this.#streams[streamId]?.activePresentationId}`);
    return this.#streams[streamId]?.activePresentationId;
  }

  /**
   * Set the ID of the active presentation
   * @param {number|undefined} presentationId - The ID of the presentation to set as active, -1 to select the default presentation or undefined to clear any active presentation
   * @param {string|null} streamId The ID of the stream, null for non-multi-period use
   */
  setActivePresentationId(presentationId, streamId = null) {
    console.log(`ALPS::setActivePresentation - new activePresentation: ${presentationId}`);
    this.#initializeStream(streamId);
    this.#streams[streamId].activePresentationId = presentationId;
  }

  /**
   * Process an ISOBMFF segment buffer
   * @param {ArrayBuffer} segmentBuffer - The ISOBMFF segment buffer to process
   * @param {string|null} streamId - Stream ID for Segment buffer, null for non-multi-period use
   * @param {number|undefined} activePresentationId - Forced presentation ID that should be selected for processing, use -1 for TV default, and leave undefined to use value set by setActivePresentationId. This parameter takes precedence over this.activePresentationId
   * @returns {ProcessIsoBmffSegmentResult} Data retrieved from processed segment
   */
  processIsoBmffSegment(segmentBuffer, streamId = null, activePresentationId = undefined) {
    // parse the segment that was just handed in
    console.log("ALPS::processIsoBmffSegment");

    let forcedPresentationId = null;
    let presentations = null;
    let segmentType = null;

    const parsedSegmentBuffer = ISOBoxer.parseBuffer(segmentBuffer);

    const movie = parsedSegmentBuffer.fetch(isoBmffBox.MOVIE);
    const meta = parsedSegmentBuffer.fetch(isoBmffBox.META);
    const movieFragment = parsedSegmentBuffer.fetch(isoBmffBox.MOVIE_FRAGMENT);

    this.#initializeStream(streamId);
    const stream = this.#streams[streamId];

    // if this is the init segment - parse presentations
    if (movie && meta) {
      presentations = processIsoBmffInitSegment(parsedSegmentBuffer);
      stream.presentations = presentations;

      if (this.#presentationsChangedEventHandler) {
        this.#presentationsChangedEventHandler({ streamId });
      }
      segmentType = SEGMENT_TYPES.INIT;
    }

    if (movieFragment) {
      forcedPresentationId = processIsoBmffMediaSegment(
        parsedSegmentBuffer,
        activePresentationId ?? stream.activePresentationId,
      );
      segmentType = SEGMENT_TYPES.MEDIA;
    }
    console.log("ALPS::processIsoBmffSegment - done");
    return {
      forcedPresentationId,
      presentations,
      segmentType,
    };
  }
}
