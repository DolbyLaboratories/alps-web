# ALPS

ALPS (Application Layer Presentation Selection) enables selection of a presentation from an AC-4 bitstream. The AC-4 decoder will subsequently decode the selected presentation from that bitstream only, ignoring all the other presentations. ALPS is designed for integration with a web-based media playback application and build to process ISOBMFF media segments.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [AC-4 content requirements](#ac-4-content-requirements)
- [Buffer management](#buffer-management)

## Installation

ALPS is available through the npm registry. Install ALPS using the `npm install` command.

```
npm install @oei/alps
```

## Usage

Import and instantiate 'Alps'. You can set a callback function that will be called if the list of presentations changes. The following example updates the list of presentations. For more details check out the [API](#api) section.

```
import Alps from '@oei/alps';

const alps = new Alps();

const presentationsChangedHandler = () => {
    currentPresentations = alps.getPresentations();
    
    // you can change presentation ID of the presentation you want to be played, by calling setActivePresentationId method:
    alps.setActivePresentationId(selectedPresentationId);
    // if not set explicit alps will try to play previouvsly selected activePresentationId
};
alps.setPresentationsChangedEventHandler(presentationsChangedHandler);
```

ALPS processes memory buffers that contain ISOBMFF segment data. These buffers are typically the result of network requests performed by the media player. After the player has downloaded the ISOBMFF segment data, data is processed using the ALPS method 'processIsoBmffSegment'. The processed data is then returned to the media player for forwarding to the decoder. Integration with the media player depends on the player and differs from player to player implementation.

Here is an example implementation using dash.js player:

```
<script>
    function init() {
        var video,
            player,
            url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

        video = document.querySelector("video");
        player = dashjs.MediaPlayer().create();

        /* Extend SegmentResponseModifier class and process AC-4 chunks */
        player.extend("SegmentResponseModifier", function () {
            return {
                modifyResponseAsync: function (chunk) {
                    if (chunk.mediaInfo.codec.includes('ac-4')) {
                        alps.processIsoBmffSegment(chunk.bytes);
                    }
                    return Promise.resolve(chunk);
                }
            };
        });
        player.initialize(video, url, true);
    }
</script>
```

## API

### Alps

Class that provides methods to access and select AC-4 presentations.

#### Constructor

```
new Alps()
```

Creates a new instance of Alps with the specified handler.

#### Methods

##### setPresentationsChangedEventHandler(presentationsChangedEventHandler)

- **presentationsChangedEventHandler** `() => void` - Callback which is executed when bitstreams presentations list changes.

##### processIsoBmffSegment(segmentBuffer)

- **segmentBuffer** `ArrayBuffer` - ISOBMFF segment buffer
- **Returns:** `void`

Processes the segment buffer before it is appended to SourceBuffer. Processing a buffer has two parts: parsing presentation metadata from ISOBMFF boxes and modifying the AC-4 TOC (to enable/disable selected presentations and make other required changes). The buffer is modified in place.

##### getPresentations()

- **Returns:** `{id: number, label: string, language: string}[]`

Returns the list of presentations.
If there are no presentations or the presentations have not been parsed yet, the returned list will be empty.

##### getActivePresentationId()

- **Returns:** `number`

Returns the ID of the active presentation, or -1 if no presentation has been selected yet.

##### setActivePresentationId(presentationId)

- **presentationId** `number` - ID of the presentation that will be selected
- **Returns:** `void`

Sets the active presentation using the presentation ID. The ID must reference a presentation that is present in the presentations list. 

## AC-4 content requirements

ALPS discovers available presentations by parsing ISOBMFF level information in accordance with latest MPEG standards. Below is an abbreviated example of ISOBMFF structure with boxes that are relevant to ALPS. ALPS requires content to be packaged containing this information so that the available presentations and their properties is known. 

```
[moov]
    [trak]
        [tkhd]
            track_ID
[meta]
    [grpl]
        [prsl]
            entities
                entity_id
            preselection_tag
            labl
            elng
```

ALPS functionality depends on parsing and modifying AC-4 TOC.
DRM protected content may be compatible with ALPS if the TOC is left  "in the clear" in the encryption process. In that case, only the audio substreams are encrypted.

## Buffer management

Devices typically buffer some audio to ensure a good playback experience in cases of varying network conditions. These buffers need to be flushed when changing the presentation to apply the changed audio configuration quickly after the user selection has been made. Flushing buffers should ideally be provided by the player and should be triggered when a different presentation is selected. Since not all players have built-in support for buffer flushing, it is also possible to use two identical Adaptation Sets as a workaround. In this case the player is instructed to switch to the other adaptation set upon a presentation change, which causes the player to perform a buffer flush. Both adaptation sets can point to the same AC-4 elementary stream.
For custom player implementations it is recommended to implement buffer flushing functionality at the player level as a more efficient solution. This eliminates the need for an additional Adaptation Set and content level changes.
