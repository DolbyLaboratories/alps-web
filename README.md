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

Import and instantiate 'Alps'. You can set a callback function that will be called whenever Init Segment is processed - new Init Segment may result in different presentations and proper active presentation should be selected by the application. The following example updates the list of presentations. For more details check out the [API](#api) section.

```
import { Alps } from '@oei/alps';

const alps = new Alps();

const presentationsChangedHandler = () => {
    currentPresentations = alps.getPresentations();

    // you can change presentation ID of the presentation you want to be played, by calling setActivePresentationId method:
    alps.setActivePresentationId(selectedPresentationId);
    // if not set explicit alps will try to play previouvsly selected activePresentationId
};
alps.setPresentationsChangedEventHandler(presentationsChangedHandler);
```

ALPS processes memory buffers that contain ISOBMFF segment data. These buffers are typically the result of network requests performed by the media player. After the player has downloaded the ISOBMFF segment data, data is processed using the ALPS method 'processIsoBmffSegment'. The data is modified and ready for media player to forward to the decoder. Integration with the media player depends on the player and differs from player to player implementation.

Here is an example implementation using dash.js version 4 player:

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

And an example using dash.js version 5 player:
```
<script>
    function init() {
        var video,
            player,
            url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

        video = document.querySelector("video");
        player = dashjs.MediaPlayer().create();

        var alps = new Alps();
        var user = { presentationId: 1 };

        const interceptor: ResponseInterceptor = (response: CommonMediaResponse) => {
          if (response.request.customData?.request?.representation?.codecFamily === 'ac-4') {
            alps.processIsoBmffSegment(response.data, null, user.presentationId);
          }
          return Promise.resolve(response)
        }

        player.addResponseInterceptor(interceptor)

        player.initialize(video, url, true);
    }
</script>

```

Here is an example for [shaka player](https://github.com/shaka-project/shaka-player):

```html
<script>
    async function init() {
        const url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

        const video = document.querySelector("video");
        const player = new shaka.Player();
        await player.attach(video);

        const alps = new Alps();
        const user = { presentationId: 1 };

        player.getNetworkingEngine().registerResponseFilter((type, response, context) => {
           if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT && context?.codecs?.startsWith('ac-4')) {
             alps.processIsoBmffSegment(response.data, null, user.presentationId);
           }
        });

        await player.load(url);
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

- **presentationsChangedEventHandler** `() => void` - Callback which is executed when new Init Segment is processed and potentially bitstreams presentations list changes.

##### processIsoBmffSegment(segmentBuffer, streamId = null, activePresentationId = undefined)

- **segmentBuffer** `ArrayBuffer` - ISOBMFF segment buffer
- **streamId** `string|null` - Stream ID for Segment buffer
- **activePresentationId** `number|undefined` - Forced presentation ID that should be selected for processing, use -1 for TV default, and leave undefined to use value set by setActivePresentationId, this parameter takes precedence over this.#activePresentationId
- **Returns:** `{segmentType: INIT|MEDIA, presentations: Presentation[]|null, forcedPresentationId: number|null }`

Processes the segment buffer before it is appended to SourceBuffer. Processing a buffer has two parts: parsing presentation metadata from ISOBMFF boxes and modifying the AC-4 TOC (to enable/disable selected presentations and make other required changes). The buffer is modified in place.

##### getPresentations(streamId = null)

- **streamId** `string|null` - Stream ID for which return presentations
- **Returns:** `{id: number, label: string, language: string}[]`

Returns the list of presentations for specified streamId.
If there are no presentations or the presentations have not been parsed yet, the returned list will be empty.

##### getActivePresentationId(streamId = null)

- **streamId** `string|null` - Stream ID
- **Returns:** `number`

Returns the ID of the active presentation for specified streamId, or -1 if no presentation has been selected yet.

##### setActivePresentationId(presentationId, streamId = null)

- **presentationId** `number` - ID of the presentation that will be selected
- **streamId** `string|null` - Stream ID for which to set active presentation Id
- **Returns:** `void`

Sets the active presentation using the presentation ID for specified stream id.

## AC-4 presentation signaling

ALPS supports two signaling methods:

- ISOBMFF init segment level signaling
- External signaling

### ISOBMFF init segment signaling

ALPS supports presentation signaling on ISOBMFF init segment level and provides parsing support for this data. An abbreviated example of ISOBMFF structure with boxes that are relevant to ALPS can be found below. AC-4 bitstreams may be packaged containing this information so that the available presentations and their properties can be derived from the ISOBMFF segment. Information derived from those boxes can be accessed through the `getPresentations` method.

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

### External signaling

ALPS supports presentation signaling by external means, typically done via MPEG-DASH manifest. Parsing this data is out-of-scope for the ALPS library and must be performed on application level. In such a case ALPS still allows to set the active presentation using `setActivePresentationId`. The `getPresentations` method can be used to validate whether the presentations from the external source match those from the ISOBMFF init segment. Note that ALPS will always validate the selected presentation ID against the presentation IDs found in the TOC and disable processing if the requested ID is not available in the TOC.

## Buffer management

Devices typically buffer some audio to ensure a good playback experience in cases of varying network conditions. These buffers need to be flushed when changing the presentation to apply the changed audio configuration quickly after the user selection has been made. Flushing buffers should ideally be provided by the player and should be triggered when a different presentation is selected. Since not all players have built-in support for buffer flushing, it is also possible to use two identical Adaptation Sets as a workaround. In this case the player is instructed to switch to the other adaptation set upon a presentation change, which causes the player to perform a buffer flush. Both adaptation sets can point to the same AC-4 elementary stream.
For custom player implementations it is recommended to implement buffer flushing functionality at the player level as a more efficient solution. This eliminates the need for an additional Adaptation Set and content level changes.

## Known issues

### Content Limitations

The ALPS library has been tested using **CMAF (Common Media Application Format)** compliant content.
Using the ALPS library with content that uses features beyond the standardized CMAF feature
subset may cause unexpected behavior.
