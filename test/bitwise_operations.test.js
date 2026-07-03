/************************************************************************************************************
 *                Copyright (C) 2024-2026 by Dolby International AB.
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

import { rev, shiftLeft, shiftRight, setBits } from "../src/bitwise_operations.js";

describe("BitwiseOperations", () => {
  let dataView;

  describe(".rev", () => {
    test.each([
      [0b00000000, 0b00000000],
      [0b11111111, 0b11111111],
      [0b10000000, 0b00000001],
      [0b00000001, 0b10000000],
      [0b10101010, 0b01010101],
      [0b01010101, 0b10101010],
      [0b11110000, 0b00001111],
      [0b00001111, 0b11110000],
      [0b10110001, 0b10001101],
    ])("rev(0b%b) should equal 0b%b", (input, expected) => {
      expect(rev(input)).toBe(expected);
    });
  });

  describe(".shiftLeft", () => {
    describe("Given bits: 00000001", () => {
      beforeEach(() => {
        const arrayBuffer = new ArrayBuffer(1);
        dataView = new DataView(arrayBuffer);
        dataView.setUint8(0, 0b00000001);
      });

      describe("When offset=7", () => {
        const offset = 7;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should throw RangeError", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b00000000);
            });
          });
        });
      });
    });

    describe("Given bits: 10101010 01010101 11110000", () => {
      beforeEach(() => {
        const arrayBuffer = new ArrayBuffer(3);
        dataView = new DataView(arrayBuffer);
        dataView.setUint8(0, 0b10101010);
        dataView.setUint8(1, 0b01010101);
        dataView.setUint8(2, 0b11110000);
      });

      describe("When offset=-1", () => {
        const offset = -1;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should throw RangeError", () => {
              const t = () => {
                shiftLeft(dataView, offset, width, shift);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      describe("When offset=0", () => {
        const offset = 0;
        describe("When width=0", () => {
          const width = 0;
          describe("When shift=3", () => {
            const shift = 3;
            test("Should not change bits", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 00101010 01010101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b00101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=24", () => {
          const width = 24;
          describe("When shift=0", () => {
            const shift = 0;
            test("Should not change bits", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });

          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 01010100 10101011 11100000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b01010100);
              expect(dataView.getUint8(1)).toBe(0b10101011);
              expect(dataView.getUint8(2)).toBe(0b11100000);
            });
          });
        });
      });

      describe("When offset=1", () => {
        const offset = 1;
        describe("When width=4", () => {
          const width = 4;
          describe("When shift=3", () => {
            const shift = 3;
            test("Should change bits to: 11000010 01010101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b11000010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=4", () => {
        const offset = 4;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 10100010 01010101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });

          describe("When shift=5", () => {
            const shift = 5;
            test("Should change bits to: 10100010 01010101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=8", () => {
          const width = 8;
          describe("When shift=7", () => {
            const shift = 7;
            test("Should change bits to: 10101000 00000101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101000);
              expect(dataView.getUint8(1)).toBe(0b00000101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=16", () => {
          const width = 16;
          describe("When shift=7", () => {
            const shift = 7;
            test("Should change bits to: 10101010 11111000 00000000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b11111000);
              expect(dataView.getUint8(2)).toBe(0b00000000);
            });
          });
        });
      });

      describe("When offset=23", () => {
        const offset = 23;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 10101010 01010101 11110000", () => {
              shiftLeft(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=24", () => {
        const offset = 24;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should throw RangeError", () => {
              const t = () => {
                setBits(dataView, offset, width, shift);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      test.todo("should log an error and not modify the data when width is negative");

      test.todo("should log an error and not modify the data when width is exceeding data view");

      test.todo("should log an error and not modify the data when shift is negative");
    });

    describe("Large shift values (shiftAcc overflow boundary)", () => {
      // These cases require BigInt accumulation: JS Number << truncates to 32-bit
      // signed, so shift >= 25 corrupts carries via sign-extension in >>= 8,
      // and shift >= 32 silently wraps (x << 32 === x in Number arithmetic).

      describe("Given 4 bytes: FF FF FF FF", () => {
        beforeEach(() => {
          const buf = new ArrayBuffer(4);
          dataView = new DataView(buf);
          for (let i = 0; i < 4; i++) dataView.setUint8(i, 0xff);
        });

        describe("When offset=0, width=32, shift=25", () => {
          test("Should change bits to: FE 00 00 00", () => {
            shiftLeft(dataView, 0, 32, 25);
            expect(dataView.getUint8(0)).toBe(0xfe);
            expect(dataView.getUint8(1)).toBe(0x00);
            expect(dataView.getUint8(2)).toBe(0x00);
            expect(dataView.getUint8(3)).toBe(0x00);
          });
        });
      });

      describe("Given 5 bytes: FF FF FF FF FF", () => {
        beforeEach(() => {
          const buf = new ArrayBuffer(5);
          dataView = new DataView(buf);
          for (let i = 0; i < 5; i++) dataView.setUint8(i, 0xff);
        });

        describe("When offset=0, width=40, shift=32", () => {
          test("Should change bits to: FF 00 00 00 00", () => {
            shiftLeft(dataView, 0, 40, 32);
            expect(dataView.getUint8(0)).toBe(0xff);
            expect(dataView.getUint8(1)).toBe(0x00);
            expect(dataView.getUint8(2)).toBe(0x00);
            expect(dataView.getUint8(3)).toBe(0x00);
            expect(dataView.getUint8(4)).toBe(0x00);
          });
        });
      });
    });
  });

  describe(".shiftRight", () => {
    let dataView;

    describe("Given bits: 00000001", () => {
      beforeEach(() => {
        const arrayBuffer = new ArrayBuffer(1);
        dataView = new DataView(arrayBuffer);
        dataView.setUint8(0, 0b00000001);
      });

      describe("When offset=7", () => {
        const offset = 7;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should shift the single bit right, but it falls off → becomes 0", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b00000000);
            });
          });
        });
      });
    });

    describe("Given bits: 10101010 01010101 11110000", () => {
      beforeEach(() => {
        const arrayBuffer = new ArrayBuffer(3);
        dataView = new DataView(arrayBuffer);
        dataView.setUint8(0, 0b10101010);
        dataView.setUint8(1, 0b01010101);
        dataView.setUint8(2, 0b11110000);
      });

      describe("When offset=-1", () => {
        const offset = -1;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should throw RangeError", () => {
              const t = () => {
                shiftRight(dataView, offset, width, shift);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      describe("When offset=0", () => {
        const offset = 0;
        describe("When width=0", () => {
          const width = 0;
          describe("When shift=3", () => {
            const shift = 3;
            test("Should not change bits", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 00101010 01010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b00101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=24", () => {
          const width = 24;
          describe("When shift=0", () => {
            const shift = 0;
            test("Should not change bits", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });

          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 01010101 00101010 11111000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b01010101);
              expect(dataView.getUint8(1)).toBe(0b00101010);
              expect(dataView.getUint8(2)).toBe(0b11111000);
            });
          });
        });
      });

      describe("When offset=1", () => {
        const offset = 1;
        describe("When width=4", () => {
          const width = 4;
          describe("When shift=3", () => {
            const shift = 3;
            test("Should change bits to: 10000010 01010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10000010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=4", () => {
        const offset = 4;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 10100010 01010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });

          describe("When shift=5", () => {
            const shift = 5;
            test("Should change bits to: 10100010 01010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=8", () => {
          const width = 8;
          describe("When shift=7", () => {
            const shift = 7;
            test("Should change bits to: 10100000 00010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100000);
              expect(dataView.getUint8(1)).toBe(0b00010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=16", () => {
          const width = 16;
          describe("When shift=7", () => {
            const shift = 7;
            test("Should change bits to: 10100000 00010101 01010000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10100000);
              expect(dataView.getUint8(1)).toBe(0b00010100);
              expect(dataView.getUint8(2)).toBe(0b10100000);
            });
          });
        });
      });

      describe("When offset=23", () => {
        const offset = 23;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should change bits to: 10101010 01010101 11110000", () => {
              shiftRight(dataView, offset, width, shift);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=24", () => {
        const offset = 24;
        describe("When width=1", () => {
          const width = 1;
          describe("When shift=1", () => {
            const shift = 1;
            test("Should throw RangeError", () => {
              const t = () => {
                shiftRight(dataView, offset, width, shift);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      test.todo("should log an error and not modify the data when width is negative");

      test.todo("should log an error and not modify the data when width is exceeding data view");

      test.todo("should log an error and not modify the data when shift is negative");
    });

    describe("Large shift values (shiftAcc overflow boundary)", () => {
      describe("Given 4 bytes: FF FF FF FF", () => {
        beforeEach(() => {
          const buf = new ArrayBuffer(4);
          dataView = new DataView(buf);
          for (let i = 0; i < 4; i++) dataView.setUint8(i, 0xff);
        });

        describe("When offset=0, width=32, shift=25", () => {
          test("Should change bits to: 00 00 00 7F", () => {
            shiftRight(dataView, 0, 32, 25);
            expect(dataView.getUint8(0)).toBe(0x00);
            expect(dataView.getUint8(1)).toBe(0x00);
            expect(dataView.getUint8(2)).toBe(0x00);
            expect(dataView.getUint8(3)).toBe(0x7f);
          });
        });
      });

      describe("Given 5 bytes: FF FF FF FF FF", () => {
        beforeEach(() => {
          const buf = new ArrayBuffer(5);
          dataView = new DataView(buf);
          for (let i = 0; i < 5; i++) dataView.setUint8(i, 0xff);
        });

        describe("When offset=0, width=40, shift=32", () => {
          test("Should change bits to: 00 00 00 00 FF", () => {
            shiftRight(dataView, 0, 40, 32);
            expect(dataView.getUint8(0)).toBe(0x00);
            expect(dataView.getUint8(1)).toBe(0x00);
            expect(dataView.getUint8(2)).toBe(0x00);
            expect(dataView.getUint8(3)).toBe(0x00);
            expect(dataView.getUint8(4)).toBe(0xff);
          });
        });
      });
    });
  });

  describe(".setBits", () => {
    describe("Given bits: 10101010 01010101 11110000", () => {
      beforeEach(() => {
        const arrayBuffer = new ArrayBuffer(3);
        dataView = new DataView(arrayBuffer);
        dataView.setUint8(0, 0b10101010);
        dataView.setUint8(1, 0b01010101);
        dataView.setUint8(2, 0b11110000);
      });

      describe("When offset=-1", () => {
        const offset = -1;
        describe("When width=1", () => {
          const width = 1;
          describe("When value=1", () => {
            const value = 1;
            test("Should throw RangeError", () => {
              const t = () => {
                setBits(dataView, offset, width, value);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      describe("When offset=0", () => {
        const offset = 0;
        describe("When width=0", () => {
          const width = 0;
          describe("When value=0", () => {
            const value = 0;
            test("Should not change bits", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=1", () => {
          const width = 1;
          describe("When value=0", () => {
            const value = 0;
            test("Should change bits to: 00101010 01010101 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b00101010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=8", () => {
          const width = 8;
          describe("When value=0b11111111", () => {
            const value = 0b11111111;
            test("Should change bits to: 11111111 01010101 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b11111111);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });

        describe("When width=16", () => {
          const width = 16;
          describe("When value=0b1111000011110000", () => {
            const value = 0b1111000011110000;
            test("Should change bits to: 11110000 11110000 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b11110000);
              expect(dataView.getUint8(1)).toBe(0b11110000);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=2", () => {
        const offset = 2;
        describe("When width=1", () => {
          const width = 1;
          describe("When value=0", () => {
            const value = 0;
            test("Should change bits to: 10001010 01010101 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b10001010);
              expect(dataView.getUint8(1)).toBe(0b01010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=4", () => {
        const offset = 4;
        describe("When width=8", () => {
          const width = 8;
          describe("When value=0b11111111", () => {
            const value = 0b11111111;
            test("Should change bits to: 10101111 11110101 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b10101111);
              expect(dataView.getUint8(1)).toBe(0b11110101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=8", () => {
        const offset = 8;
        describe("When width=1", () => {
          const width = 1;
          describe("When value=1", () => {
            const value = 1;
            test("Should change bits to: 10101010 11010101 11110000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b11010101);
              expect(dataView.getUint8(2)).toBe(0b11110000);
            });
          });
        });
      });

      describe("When offset=9", () => {
        const offset = 9;
        describe("When width=16", () => {
          const width = 16;
          describe("When value=1", () => {
            const value = 1;
            test("Should change bits (incorrectly) to: 10101010 00000000 00000000", () => {
              setBits(dataView, offset, width, value);
              expect(dataView.getUint8(0)).toBe(0b10101010);
              expect(dataView.getUint8(1)).toBe(0b00000000);
              expect(dataView.getUint8(2)).toBe(0b00000000);
            });
          });
        });
      });

      describe("When offset=24", () => {
        const offset = 24;
        describe("When width=1", () => {
          const width = 1;
          describe("When value=0b1111111111111111", () => {
            const value = 0b1111111111111111;
            test("should throw RangeError", () => {
              const t = () => {
                setBits(dataView, offset, width, value);
              };
              expect(t).toThrow(RangeError);
              expect(t).toThrow("Offset is outside the bounds of the DataView");
            });
          });
        });
      });

      test.todo("should set bits at last bit of last byte");

      test.todo("should log an error and not modify the data when width is negative");

      test.todo("should log an error and not modify the data when width is exceeding 16");

      test.todo("should log an error and not modify the data when value is negative");

      test.todo("should log an error and not modify the data when the value is too large to fit given width");
    });
  });
});
