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
