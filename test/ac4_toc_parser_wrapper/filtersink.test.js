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

import { FilterSink } from "../../src/ac4_toc_parser_wrapper/filtersink.js";
import * as tocElements from "../../src/constants/toc_elements.js";

describe("#FilterSink", () => {
  let callbackResult = null;

  const elements = [tocElements.B_PRESENTATION_ID, tocElements.AC4_TOC_END];
  const callback = (name, value, width, position, handler) => {
    callbackResult = {
      name,
      value,
      width,
      position,
      handler,
    };
  };
  const filterSink = new FilterSink(elements, callback);

  beforeEach(() => {
    callbackResult = null;
  });

  describe(".before_call", () => {
    it("should call the callback if the element should be filtered", () => {
      filterSink.before_call("f_name", ["example_param"], "b_presentation_id", 0);

      expect(callbackResult).toEqual({
        name: "b_presentation_id",
        value: null,
        width: null,
        position: 0,
        handler: "before_call",
      });
    });

    it("should not call the callback if the element should not be filtered", () => {
      filterSink.before_call("f_name", ["example_param"], "this_should_not_be_filtered", 0);

      expect(callbackResult).toEqual(null);
    });
  });

  describe(".after_call", () => {
    it("should call the callback if the element should be filtered", () => {
      filterSink.after_call("f_name", "read_value", "b_presentation_id", 0);

      expect(callbackResult).toEqual({
        name: "b_presentation_id",
        value: "read_value",
        width: null,
        position: 0,
        handler: "after_call",
      });
    });

    it("should not call the callback if the element should not be filtered", () => {
      filterSink.after_call("f_name", "read_value", "this_should_not_be_filtered", 0);

      expect(callbackResult).toEqual(null);
    });
  });

  describe(".write_uint", () => {
    it("should call the callback if the element should be filtered", () => {
      filterSink.write_uint("b_presentation_id", 1, 0, 0);

      expect(callbackResult).toEqual({
        name: "b_presentation_id",
        value: 0,
        width: 1,
        position: 0,
      });
    });

    it("should not call the callback if the element should not be filtered", () => {
      filterSink.write_uint("this_should_not_be_filtered", 1, 0, 0);

      expect(callbackResult).toEqual(null);
    });
  });

  describe(".write_align", () => {
    it("should call the callback if elements list contains BYTE_ALIGNMENT", () => {
      filterSink.elements.push(tocElements.BYTE_ALIGNMENT);

      filterSink.write_align(4, 2);

      expect(callbackResult).toEqual({
        name: tocElements.BYTE_ALIGNMENT,
        value: 2,
        width: 4,
        position: null,
        handler: "write_align",
      });

      filterSink.elements.pop();
    });

    it("should not call the callback if elements list doesn't contain BYTE_ALIGNMENT", () => {
      filterSink.write_align(4, 2);

      expect(callbackResult).toEqual(null);
    });
  });

  describe(".after_position", () => {
    it("should call the callback if the element (variable) should be filtered", () => {
      filterSink.after_position(tocElements.AC4_TOC_END, 10);

      expect(callbackResult).toEqual({
        name: tocElements.AC4_TOC_END,
        value: null,
        width: null,
        position: 10,
        handler: "after_position",
      });
    });

    it("should not call the callback if the element (variable) should not be filtered", () => {
      filterSink.after_position("this_should_not_be_filtered", 2);

      expect(callbackResult).toEqual(null);
    });
  });
});
