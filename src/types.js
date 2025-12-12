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

/**
 * @module
 * @desc Shared types.
 */

/**
 * Presentation entity.
 * @typedef {Object} Presentation
 * @property {number|null} id - unique presentation identifier, should match presentation ID from TOC
 * @property {number|null} selectionPriority - priority value for presentation when no other differentiation is possible
 * @property {number|null} dialogGain - the gain applied to the dialog compared to the default mix
 * @property {string|null} extendedLanguage - language parsed from ISOBMFF elng box
 * @property {number|null} audioRenderingIndication - hint for a preferred reproduction channel layout
 * @property {Label[]} labels - presentation labels parsed from ISOBMFF labl boxes
 * @property {Kind[]} kinds - presentation kinds parsed from ISOBMFF kind boxes
 */

/**
 * Label object.
 * @typedef {Object} Label
 * @property {boolean} isGroupLabel - flag indicating that label is a summary label for group of labels
 * @property {number} labelId - identifier for the label
 * @property {string} language - language tag string compliant with IETF BCP 47
 * @property {string} label - label text
 */

/**
 * Kind object.
 * @typedef {Object} Kind
 * @property {string} schemeURI - declares the identifier of the kind or the identifier of the naming scheme for the following value
 * @property {string} value - is defined by the declared scheme
 */

export {};
