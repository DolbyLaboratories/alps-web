import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ...js.configs.all,
    files: ["src/**/*"],
  },
  prettierRecommended,
  {
    rules: {
      "one-var": ["error", { initialized: "never", uninitialized: "always" }],
      "no-console": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-magic-numbers": ["error", { ignore: [0, 1] }],
      "no-bitwise": "off",
      "no-underscore-dangle": "off",
      "capitalized-comments": "off",
      "id-length": ["error", { exceptions: ["i"] }],
      "no-plusplus": "off",
      "prefer-destructuring": "off",
      camelcase: [
        "error",
        { allow: ["after_call", "after_position", "before_call", "get_align", "write_align", "write_uint"] },
      ],
      // TODO
      "max-statements": "off",
      "max-params": "off",
      "max-lines-per-function": "off",
    },
    files: ["src/**/*"],
  },
  {
    rules: {
      "no-magic-numbers": "off",
    },
    files: ["src/bitwise_operations.js"],
  },
  {
    rules: {
      "sort-keys": "off",
      "new-cap": "off",
    },
    files: ["src/ac4_toc_parser_wrapper/index.js"],
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    ignores: ["dist/", "src/ac4_toc_parser.js"],
  },
  {
    files: ["test/**/*"],
    languageOptions: { globals: globals.jest },
  },
];
