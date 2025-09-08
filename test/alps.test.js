import { Alps } from "../src/alps.js";
import fs from "fs";

/*global Buffer, __dirname*/

describe("#Alps", () => {
  describe(".processIsoBmffSegment", () => {
    let alps;

    const originalBuffer = fs.readFileSync(`${__dirname}/examples/test_seg.m4s`);
    const bufferWithSelectedPresentationId1 = fs.readFileSync(`${__dirname}/examples/test_seg_1.m4s`);
    const bufferWithSelectedPresentationId2 = fs.readFileSync(`${__dirname}/examples/test_seg_2.m4s`);

    describe("Alps initialized with init segment with 5 presentations content", () => {
      const first_period = "1";
      const second_period = "2";

      beforeEach(() => {
        alps = new Alps();
        const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_init.mp4`)).buffer;
        alps.processIsoBmffSegment(buffer);
      });

      describe("activePresentationId in process param", () => {
        it("should change the Segment buffer to buffer with selected presentation id 1 if passed 1 as activePresentationId", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 1);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);
        });

        it("should change the Segment buffer to buffer with selected presentation id 2 if passed 2 as activePresentationId", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });

        it("should not change the Segment buffer for -1", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, -1);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });

        it("should not change the Segment buffer for 6", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, undefined, 6);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });
      });

      describe("activePresentationId=1 for period 1", () => {
        beforeEach(() => {
          alps.setActivePresentationId(1, first_period);
        });

        it("should change the Segment buffer for period 1 to presentation 1", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);
        });

        it("should not change the Segment buffer for period 2", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, second_period);
          expect(Buffer.from(buffer, 0)).toEqual(originalBuffer);
        });

        it("should handle different activePresentationIds for multiple periods", () => {
          alps.setActivePresentationId(2, second_period);

          let buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId1);

          buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, second_period);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);

          buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });

        it("param with active 2 should take precedence and change buffer to presentation 2", () => {
          const buffer = new Uint8Array(fs.readFileSync(`${__dirname}/examples/test_seg.m4s`)).buffer;
          alps.processIsoBmffSegment(buffer, first_period, 2);
          expect(Buffer.from(buffer, 0)).toEqual(bufferWithSelectedPresentationId2);
        });
      });
    });

    describe("Verify incompatible stream protection", () => {
      it.todo("Verify that missing 'prsl' boxes case is handled gracefully");
    });

    describe("External signaling cases", () => {
      const externalPresentations = [
        {
          id: 0,
        },
        {
          id: 1,
        },
        {
          id: 2,
        },
        {
          id: 3,
        },
        {
          id: 4,
        },
      ];

      beforeEach(() => {
        alps = new Alps();
      });

      it("should return unmodified buffer if content has no presentations", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/no_pres_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/no_pres_segment.m4s");

        alps.processIsoBmffSegment(initBuffer);

        const presentations = alps.getPresentations();
        expect(presentations).toEqual([]);

        alps.setActivePresentationId(0);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/no_pres_segment.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses init segment signaling only", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/test_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/test_seg.m4s");

        alps.processIsoBmffSegment(initBuffer);

        const presentations = alps.getPresentations();
        expect(presentations.length > 1);

        alps.setActivePresentationId(presentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses external signaling only", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/no_isobmff_signaling_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/no_isobmff_signaling_segment.m4s");

        alps.processIsoBmffSegment(initBuffer);

        alps.setActivePresentationId(externalPresentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/no_isobmff_signaling_segment.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });

      it("should modify buffer if content has presentations and uses both init segment and external signaling", () => {
        const initBuffer = new Uint8Array(fs.readFileSync("./test/examples/test_init.mp4")).buffer;
        const originalSegment = fs.readFileSync("./test/examples/test_seg.m4s");

        alps.processIsoBmffSegment(initBuffer);

        alps.setActivePresentationId(externalPresentations[1].id);

        const buffer = new Uint8Array(fs.readFileSync("./test/examples/test_seg.m4s")).buffer;
        alps.processIsoBmffSegment(buffer);
        expect(Buffer.from(buffer, 0)).not.toEqual(originalSegment);
      });
    });
  });
});
