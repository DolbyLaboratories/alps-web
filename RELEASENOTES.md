# 2.0.0

This release includes the following changes since the 1.0.0

### Features

- Improved ISOBMFF signaling - `Presentation` object provides more information parsed from ISOBMFF
- Multi-period content support
- External signaling support
- Type declarations

### Bug Fixes

- Return null for MediaSegment process when AC-4 parsing error occurred
- Return unmodified buffer if `payload_base_minus1` field not found

### BREAKING CHANGES

- Presentation object structure has changed: `id` can now also be null, `language` has been renamed to `extendedLanguage`, `label` has changed to `labels` and is now an array of objects

# 1.0.0

First public release

### Features

- Selection of active presentation from AC-4 bitstream
- Processing ISOBMFF segment to force selected presentation decoding
- Fetching presentations list available in the stream
- Fetching active presentation ID
- Presentations list change detection - callback when detected
