# ALPS Web

ALPS (Application Layer Presentation Selection) enables selection of a presentation from a **Dolby** AC-4 bitstream. The **Dolby** AC-4 decoder will subsequently decode only the selected presentation from that bitstream, ignoring all the other presentations. ALPS Web is designed for integration with a web-based media playback application and build to process ISOBMFF media segments.

## Table of Contents

- [Installation](#installation)
- [Quickstart](#quickstart)
- [API](#api)
- [**Dolby** AC-4 presentation signaling](#dolby-ac-4-presentation-signaling)
- [Known limitations](#known-limitations)
- [Support / Contact](#support--contact)
- [License & third-party](#license--third-party)
- [Release notes](#release-notes)

## Installation

To install the package:

1. Clone the repository

   `git clone git@github.com:DolbyLaboratories/alps-web.git`

2. Install the dependencies

   `npm i`

3. Build the package

   `npm run build:production`

4. Copy the build files to your codebase, e.g. upload to directory libs/alps.

   To simplify import syntax and enable TypeScript support:

   - rename <i>alps.bundle.min.js</i> to <i>index.js</i>
   - rename <i>alps.d.ts</i> to <i>index.d.ts</i>.

## Quickstart

Import and instantiate 'Alps'. Optionally, set a callback function that will be called whenever Init Segment is processed - new Init Segment may result in different presentations and proper active presentation should be selected by the application. The following example updates the list of presentations. For more details check out the [API](#api) section.

```typescript
// This assumes you have installed ALPS following installation instructions, and that index file resolution is turned on.
import { Alps } from "[path-to-libs]/alps";

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

```html
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
          if (chunk.mediaInfo.codec.includes("ac-4")) {
            alps.processIsoBmffSegment(chunk.bytes);
          }
          return Promise.resolve(chunk);
        },
      };
    });
    player.initialize(video, url, true);
  }
</script>
```

And an example using dash.js version 5 player:

```html
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
      if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT && context?.stream?.codecs.startsWith('ac-4')) {
        alps.processIsoBmffSegment(response.data, null, user.presentationId);
      }
    });

    await player.load(url);
  }
</script>
```

## API

Library API is represented by [Alps](src/alps.js) class.

Detailed API description can be found in [HTML code documentation](docs) or in the code directly.

## **Dolby** AC-4 presentation signaling

ALPS supports two signaling methods:

- ISOBMFF init segment level signaling
- External signaling

### ISOBMFF init segment signaling

ALPS supports presentation signaling on ISOBMFF init segment level and provides parsing support for this data. An abbreviated example of the ISOBMFF structure with boxes that are relevant to ALPS can be found below. AC-4 bitstreams may be packaged containing this information so that the available presentations and their properties can be derived from the ISOBMFF segment. Information derived from those boxes can be accessed through the `getPresentations` method.

```
[moov]
    [trak]
        [tkhd]
            track_ID
[meta]
    [grpl]
        [prsl]
            entity_id
            preselection_tag
            selection_priority
            [elng]
                extended_language
            [labl]
                label_id
                language
                label
            [ardi]
                audio_rendering_indication
            [kind]
                schemeURI
                value
            [udta]
                [diap]
                    dialog_gain

```

### External signaling

ALPS supports presentation signaling by external means, typically done via MPEG-DASH manifest. Parsing this data is out-of-scope for the ALPS library and must be performed on application level. In such a case ALPS still allows to set the active presentation using `setActivePresentationId`. The `getPresentations` method can be used to validate whether the presentations from the external source match those from the ISOBMFF init segment. Note that ALPS will always validate the selected presentation ID against the presentation IDs found in the TOC and disable processing if the requested ID is not available in the TOC.

## Known limitations

### CMAF compliance

The ALPS library has been tested using **CMAF (Common Media Application Format)** compliant content.
Using the ALPS library with content that uses features beyond the standardized CMAF feature subset
might cause unexpected behavior.

### **Dolby** AC-4 content requirements

ALPS functionality depends on parsing and modifying **Dolby** AC-4 TOC. DRM protected content may be
compatible with ALPS if the TOC is left unencrypted. In that case, only the audio substreams are
encrypted.

### Buffer management

Devices typically buffer some audio to ensure a good playback experience in cases of varying network conditions. These buffers need to be flushed when changing the presentation to apply the changed audio configuration quickly after the user selection has been made. Flushing buffers should ideally be provided by the player and should be triggered when a different presentation is selected. Since not all players have built-in support for buffer flushing, it is also possible to use two identical Adaptation Sets as a workaround. In this case the player is instructed to switch to the other adaptation set upon a presentation change, which causes the player to perform a buffer flush. Both adaptation sets can point to the same **Dolby** AC-4 elementary stream.
For custom player implementations it is recommended to implement buffer flushing functionality at the player level as a more efficient solution. This eliminates the need for an additional Adaptation Set and content level changes.

## Support / Contact

- Questions, issues, or feature requests: please open an issue in this repository.
- For commercial support inquiries, contact your Dolby representative.

## License & third-party

- License: see [LICENSE.md](LICENSE.md).
- Third-party notices are included in package dependencies; see `package.json`.

## Release notes

See [RELEASENOTES.md](RELEASENOTES.md)
