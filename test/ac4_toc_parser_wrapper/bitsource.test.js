import { BitSource } from "../../src/ac4_toc_parser_wrapper/bitsource.js";

describe("#BitSource", () => {
  const _name = "test_field";

  const NO_DATA = [];
  const SEQUENTIAL_DATA = [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244];
  const ALTERNATING_DATA = [255, 0, 255, 0, 255];

  const createBitSource = (data) => new BitSource(data[Symbol.iterator]());

  describe(".get", () => {
    let bs;

    describe("Given data = []", () => {
      it("should return 0 for any width", () => {
        bs = createBitSource(NO_DATA);

        expect(bs.get(_name, 1)).toBe(0);
        expect(bs.get(_name, 8)).toBe(0);
      });
    });

    describe("Given data = [255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244]", () => {
      beforeEach(() => {
        bs = createBitSource(SEQUENTIAL_DATA);
      });

      describe("And firstly calling .get with width=64 (width exceeding)", () => {
        beforeEach(() => {
          bs.get(_name, 64);
        });

        it("should return 1 for width=1", () => {
          expect(bs.get(_name, 1)).toBe(1);
        });

        it("should return 247 for width=8", () => {
          expect(bs.get(_name, 8)).toBe(247);
        });

        it("should return 247<<16+246<<8+245 for width=24", () => {
          expect(bs.get(_name, 24)).toBe((247 << 16) + (246 << 8) + 245);
        });
      });
    });

    describe("Given data = [255, 0, 255, 0, 255]", () => {
      beforeEach(() => {
        bs = createBitSource(ALTERNATING_DATA);
      });

      describe("Supported width", () => {
        describe("Single reading", () => {
          it("should return 0 for width=0", () => {
            expect(bs.get(_name, 0)).toBe(0);
          });

          it("should return 1 for width=1", () => {
            expect(bs.get(_name, 1)).toBe(1);
          });

          it("should return 255<<17+0<<9+255<<1+0 for width=25", () => {
            expect(bs.get(_name, 25)).toBe((255 << 17) + (0 << 9) + (255 << 1) + 0);
          });
        });

        describe("Sequential readings", () => {
          it("should return 255 for width=8 after reading 0", () => {
            bs.get(_name, 0);
            expect(bs.get(_name, 8)).toBe(255);
          });

          it("should return 15 for width=4 after reading 1", () => {
            bs.get(_name, 1);
            expect(bs.get(_name, 4)).toBe(15);
          });

          it("should return 127<<18+0<<10+255<<2+0 for width=25 after reading 1", () => {
            bs.get(_name, 1);
            expect(bs.get(_name, 25)).toBe((127 << 18) + (0 << 10) + (255 << 2) + 0);
          });

          it("should return 8 for width=4 after reading 7", () => {
            bs.get(_name, 7);
            expect(bs.get(_name, 4)).toBe(8);
          });

          it("should return 1<<24+0<<16+255<<8+0 for width=25 after reading 7", () => {
            bs.get(_name, 7);
            expect(bs.get(_name, 25)).toBe((1 << 24) + (0 << 16) + (255 << 8) + 0);
          });

          it("should return 0 for width=4 after reading 8", () => {
            bs.get(_name, 8);
            expect(bs.get(_name, 4)).toBe(0);
          });

          it("should return 0<<17+255<<9+0<<1+1 for width=25 after reading 8", () => {
            bs.get(_name, 8);
            expect(bs.get(_name, 25)).toBe((0 << 17) + (255 << 9) + (0 << 1) + 1);
          });
        });
      });

      describe("Unsupported width", () => {
        it("should return 255<<8 for width=32 (skips n bytes until valid width)", () => {
          expect(bs.get(_name, 32)).toBe(255 << 8);
        });
      });

      describe("Edge cases", () => {
        it("should return 0 when reading past end of data", () => {
          bs.get(_name, 40);
          expect(bs.get(_name, 1)).toBe(0);
          expect(bs.get(_name, 8)).toBe(0);
        });
      });
    });
  });

  describe(".get_align", () => {
    it("should work the same way as .get", () => {
      const bs = createBitSource(SEQUENTIAL_DATA);

      expect(bs.get(_name, 8)).toBe(255);
      expect(bs.get(_name, 16)).toBe((254 << 8) + 253);
      bs.get(_name, 32);
      expect(bs.get(_name, 8)).toBe(248);
    });
  });
});
