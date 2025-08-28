import { Alps } from "../src/alps.js";
import fs from "fs";

/*global Buffer*/

describe("#Alps", () => {
  describe(".processIsoBmffSegment", () => {
    let alps;

    describe("Alps initialized with init segment with 5 presentations content", () => {
      beforeEach(() => {
        alps = new Alps();
        const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_init.mp4")).buffer;

        alps.processIsoBmffSegment(buffer);
      });

      const originalBuffer = fs.readFileSync("./test/examples/test_seg.m4s");

      describe("activePresentationId=0", () => {
        beforeEach(() => {
          alps.setActivePresentationId(1);
        });

        it("should change the Segment buffer", () => {
          const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
          alps.processIsoBmffSegment(buffer);
          expect(Buffer.from(buffer, 0)).not.toEqual(originalBuffer);
        });
      });

      describe("activePresentationId=6", () => {
        beforeEach(() => {
          alps.setActivePresentationId(6);
        });

        it("should not change the Segment buffer", () => {
          const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
          alps.processIsoBmffSegment(buffer);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });
      });
    });

    describe("Verify incompatible stream protection", () => {
      it.todo("Verify that missing 'prsl' boxes case is handled gracefully");
    });
  });
});
