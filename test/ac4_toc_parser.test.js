import fs from "fs";

describe("#Parser", () => {
  /* global __dirname */
  const parser = fs.readFileSync(`${__dirname}/../src/ac4_toc_parser.js`, "utf-8");

  describe("Source callbacks validations", () => {
    const whitelist = new Set(["get", "get_align"]);
    const regex = /this\.BAM_source\.([a-zA-Z0-9_]+)\s*\(/g;

    it("should use all callbacks from whitelist", () => {
      const matches = new Set([...parser.matchAll(regex)].map((match) => match[1]));
      expect(matches).toEqual(whitelist);
    });
  });

  describe("Sink callbacks validation", () => {
    const whitelist = new Set(["before_call", "after_call", "after_position", "write_uint", "write_align"]);
    const regex = /this\.BAM_sink\.([a-zA-Z0-9_]+)\s*\(/g;

    it("should use all callbacks from whitelist", () => {
      const matches = new Set([...parser.matchAll(regex)].map((match) => match[1]));
      expect(matches).toEqual(whitelist);
    });
  });
});
