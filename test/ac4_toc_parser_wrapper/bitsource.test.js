import { BitSource } from "../../src/ac4_toc_parser_wrapper/bitsource.js";

describe("#BitSource", () => {
  describe(".get", () => {
    const _name = "test_field";
    let bs;

    describe("Given data = [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244]", () => {
      beforeEach(() => {
        const data = [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244][Symbol.iterator]();
        bs = new BitSource(data);
      });

      describe("And firstly calling .get with width=64", () => {
        beforeEach(() => {
          bs.get(_name, 64);
        });

        test("should return 1 for width=1", () => {
          expect(bs.get(_name, 1)).toBe(1);
        });

        test("should return 247 for width=8", () => {
          expect(bs.get(_name, 8)).toBe(247);
        });

        test("should return 247<<16+246<<8+245 for width=24", () => {
          expect(bs.get(_name, 24)).toBe((247 << 16) + (246 << 8) + 245);
        });
      });
    });
  });
});
