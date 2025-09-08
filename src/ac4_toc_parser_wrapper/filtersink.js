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

/**
 * @module
 * @desc This file provides a sink class for AC-4 TOC parser callback handling and filtering.
 */

import { BYTE_ALIGNMENT } from "../constants/toc_elements.js";

/**
 * This callback is called when configured element is found while parsing
 *
 * @callback sinkCallback
 * @param {string} name
 * @param {number} value
 * @param {number} width
 * @param {number} position
 * @param {string} handler
 */

/** Handles the callback and filtering functionality for AC-4 TOC parser */
export class FilterSink {
  /**
   * Create the Filter Sink
   * @param {string[]} elements - The AC-4 TOC elements to be filtered
   * @param {sinkCallback} callback - The callback function to be called for filtered elements
   */
  constructor(elements, callback) {
    this.elements = elements;
    this.callback = callback;
  }

  /**
   * Called before calling embedded BSDL function
   * @param {string} _fname - name of the BSDL function
   * @param {unknown} _params - parameters passed to the BSDL function
   * @param {string} name - name of the AC-4 TOC element
   * @param {number} position - position read before calling embedded BSDL function
   */
  before_call(_fname, _params, name, position) {
    if (this.elements.includes(name)) {
      this.callback(name, null, null, position, "before_call");
    }
  }

  /**
   * Called after calling embedded BSDL function. The position is written after field is read
   * @param {string} _fname - name of the BSDL function
   * @param {number} value - value returned by the BSDL function
   * @param {string} name - name of the AC-4 TOC element
   * @param {number} position - position read after calling embedded BSDL function
   */
  after_call(_fname, value, name, position) {
    if (this.elements.includes(name)) {
      this.callback(name, value, null, position, "after_call");
    }
  }

  /**
   * Called when assigning a variable.
   * @param {string} name - name of the AC-4 TOC element
   * @param {number} width - width of the AC-4 TOC element
   * @param {number} value - value of the AC-4 TOC element
   * @param {number} position - position of the AC-4 TOC element
   */
  write_uint(name, width, value, position) {
    if (this.elements.includes(name)) {
      this.callback(name, value, width, position);
    }
  }

  /**
   * Called when assigning byte alignment to a variable.
   * @param {number} width - width of the byte alignment field
   * @param {number} value - value of byte alignment field
   */
  write_align(width, value) {
    if (this.elements.includes(BYTE_ALIGNMENT)) {
      this.callback(BYTE_ALIGNMENT, value, width, null, "write_align");
    }
  }

  /**
   * Called after BSDL position() call to obtain bit position
   * @param {number} name - name of the variable that the position will be assigned to
   * @param {number} position - obtained position
   */
  after_position(name, position) {
    if (this.elements.includes(name)) {
      this.callback(name, null, null, position, "after_position");
    }
  }
}
