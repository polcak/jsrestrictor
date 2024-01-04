Title: Farbling-based wrappers to hinder browser fingerprinting
Date: 2021-08-23 09:00
Series: Browser fingerprinting
---

[Browser fingerprinting](https://arxiv.org/pdf/1905.01051.pdf) is a more and more popular technique used to identify browsers. The fingerprint is computed based on the results of JavaScript calls, the content of HTTP headers, hardware characteristics, underlying operating system and other software information. Consequently, browser fingerprints are used for cross-domain tracking. However, users cannot clear their browser fingerprint as it is not stored on the client-side. It is also challenging to determine whether a browser is being fingerprinted.

Another issue that hinders fingerprinting protection is the ever-changing variety of supported APIs. Browsers implement new APIs over time, and existing APIs change. Consequently, it is necessary to continuously monitor the APIs being used for fingerprinting purposes to block fingerprinting attempts.

Due to fingerprinting scripts being [more prevalent](https://www.cs.princeton.edu/~arvindn/publications/OpenWPM_1_million_site_tracking_measurement.pdf), various web browsers - for example, Tor, Brave, and Firefox - started implementing fingerprinting protection to protect users and their privacy.

This post contains:

[TOC]

## Brave fingerprinting protection

Why is Brave's Farbling special? Until recently, [Tor browser](https://2019.www.torproject.org/projects/torbrowser/design/#fingerprinting-linkability) had the most robust defence against fingerprinting. It (1) implemented modifications in various APIs, (2) blocks some other APIs, (3) runs in a window of predefined size, etc. to ensure all users have the same fingerprint. This approach is very effective at producing uniform fingerprint for all users, which makes it difficult for fingerprinters to differentiate between browsers. Still, such fingerprint is also brittle -- minor changes like resizing the window could cause the browser to have a unique fingerprint. Hence, users need to follow inconvenient steps to keep their fingerprint uniform.

With all this in [mind](https://brave.com/brave-fingerprinting-and-privacy-budgets/), Brave software decided to improve their fingerprinting protection. They [proposed](https://brave.com/privacy-updates-3/) new fingerprinting protection, Farbling, arguing that it is (almost) impossible to produce uniform fingerprint without compromising user experience. Their countermeasures involve randomising values based on previous research papers [PriVaricator](https://www.doc.ic.ac.uk/~livshits/papers/pdf/www15.pdf) and [FPRandom](https://hal.inria.fr/hal-01527580/document) Both papers have shown promising results, and Brave has perfected this approach, creating effective defence while retaining almost full user experience. Farbling is a comprehensive collection of modifications that aim at producing a unique fingerprint on every domain and in every session.

### How does farbling work?

Farbling uses generated session and [eTLD+1](https://web.dev/same-site-same-origin/) keys to deterministically change outputs of certain APIs commonly used for browser fingerprinting. These little lies result in different websites calculating different fingerprints. Moreover, a previously visited website calculates a different fingerprint in a new browsing session.

Farbling implementation is publicly available on Github [issue](https://github.com/brave/brave-browser/issues/8787) with discussions on design decisions, future plans and possible changes in a separate [issue](https://github.com/brave/brave-browser/issues/11770).

Farbling operates on three levels:
 1. **Off** - countermeasures are not active
 2. **Balanced** - various APIs have modified values based on domain/session keys
 3. **Maximum** - various  APIs values replaced by randomised values based on domain/session keys

Now, what changes did actually Brave implement to specific APIs?

### Canvas

Canvas modifications are tracked in a separate [issue](https://github.com/brave/brave-browser/issues/9186).
Both *balanced* and *maximum* approach modify API calls `CanvasRendering2dContext.getImageData`,
`HTMLCanvasElement.toDataURL`,
`HTMLCanvasElement.toBlob`, and
`OffscreenCanvas.convertToBlob`. A [Filter function](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc) changes values of certain pixels chosen based on session/domain keys, resulting in a unique canvas fingerprint.
On *maximum* level, methods `CanvasRenderingContext2D.isPointInPath` and `CanvasRenderingContext2D.isPointInStroke` always return *false*.

### WebGL

Modifications for both WebGL and WebGL2 are described in issues [webgl](https://github.com/brave/brave-browser/issues/9188) , [webgl2](https://github.com/brave/brave-browser/issues/9189).
On *balanced* level
`WebGLRenderingContext.getParameter` and other methods return slightly modified values.
`WebGLRenderingContext.readPixels` is modified similarly to canvas methods.
On *maximum* level, `WebGLRenderingContext.getParameter` returns random strings for unmasked vendor and renderer, bottom values for other arguments. Other modified calls return bottom values. All modifications can be found in the issues mentioned above or directly in the [code](https://github.com/brave/brave-core/tree/master/chromium_src/third_party/blink/renderer/modules/webgl).

### Web Audio

The [issue](https://github.com/brave/brave-browser/issues/9187) modifies
several endpoints of `AnalyserNode`  and  `AudioBuffer`  APIs used for audio data handling are modified.  On the *balanced* level, the amplitude of returned audio data is slightly changed based on the domain key. However, data are replaced by white noise generated from domain hash on the maximum level, so there is no relation with original data.

### Plugins

Currently,
`navigator.plugins` and `navigator.mimeTypes` are modified on *balanced* level to return an array with altered plugins and two fake plugins. On *maximum* level, the returned array contains only two fake plugins.
See [issue1](https://github.com/brave/brave-browser/issues/9435) and [issue2](https://github.com/brave/brave-browser/issues/10597) for more details.

### User agent

Brave employs the default Chrome UA and the newest OS version as the user agent string. Also, a random number of blank spaces (up to 5) appended to the end of the user agent string.
For more details, see the [GitHub issue](https://github.com/brave/brave-browser/issues/9190).

### EnumerateDevices

This API is used to list I/O media devices like microphone or speakers.  When fingerprinting protection is active, Brave returns a shuffled list of devices. For more details, see
[issue1](https://github.com/brave/brave-browser/issues/11271) and
[issue2](https://github.com/brave/brave-browser/issues/8666).

### HardwareConcurrency

The number of logical processors returned by this interface is modified as follows -- on *balanced* level, a valid value between 2 and the true value, on *maximum* level, a valid value between 2 and 8.
See the [GitHub issue](https://github.com/brave/brave-browser/issues/10808) for more details.

# Porting Farbling to JShelter

Our goal was to extend JShelter anti-fingerprinting protections with similar measures to those available in Brave's Farbling.
We decided to implement Brave Farbling with minor tweaks. As Brave is an open-source project based on [Chromium](https://www.chromium.org/Home), core changes are available in the public [repository](https://github.com/brave/brave-core). Furthermore, as Brave is licensed under [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/) license, its countermeasures can be ported to JShelter.
Similarly to Brave, JShelter utilises session and domain hashes (currently, we use a different domain hash based on origin, however, we consider switching to the eTLD+1 approach used by Brave). Nevertheless, we ported only those changes that an extension can reasonably apply. So we do not plan to change system fonts as the true set of fonts can leak in several ways (e.g., CSS, canvas). We will keep a close eye on anti-fingerprining techniquest applied by Brave in the future.

Former JShelter defences were left as an option so user can choose which protection they want. For example, for **Canvas API**, JShelter retains the old defence that returns a white image, but it is also possible to use Farbling and slightly modify the image.

`CanvasRenderingContext2D.isPointInPath` and `CanvasRenderingContext2D.isPointInStroke` are modified to return *false* with 5% probability, returning *false* to every call seems to be easily identifiable and it limits the usablity of the calls.

**WebGL**, **Web audio**, **plugins**,  **hardwareConcurrency** and **deviceMemory** have been changed accordingly to Brave. API **enumerateDevices** has the same functionality as in Brave. In addition, we add fake devices to the list. **User agent** wasn't modified because it can cause compatibility issues as we support multiple browsers. Adding empty spaces at the end of UAS seems to be quite a weak countermeasure. We will continue to watch changes in the user agent and may implement some defence in future, although it looks like a [better solution](https://datatracker.ietf.org/doc/html/rfc8942) is on the way.

JShelter 0.5 changes the default level -- **level 2** to apply the farbling-based defence for all covered APIs, and it will be very similar to the *balanced* level of *Brave*. **Level 3** is redesigned to partly apply new and partly old countermeasures to provide as little information as possible. Please report websites that does not work correctly with Farbling.

During the examination of the ported code, we [identified and reported](https://github.com/brave/brave-browser/issues/15882) an issue in the original Brave implementation. The issue was acknowledged and fixed by Brave. This is the beauty of the free software: several projects can benefit from the same code-base and mutualy improve the quality.

# Conclusion

Farbling-based wrappers produce very similar outputs to Brave. So with JShelter, Farbling-like capabilities are available in multiple browsers. Nevertheless, keep in mind that the best anti-fingerprinting techniques are still a research question, fingerprinting techniques are deployed for security reasons (and farbling-like anti-fingerprinting masking may complicate some log in processes), so it is not completely clear what defences are the best and the choice of the defences also depends on specific use cases. We will investigate fingerprinting scripts further during the future work on this project.
