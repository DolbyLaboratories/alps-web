import { shiftLeft, setBits } from "../src/bitwise_operations.js";

describe("BitwiseOperations", () => {
  let dataView;

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
