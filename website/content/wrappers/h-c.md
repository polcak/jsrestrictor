Title: HTML Canvas
Filename: ../common/wrappingS-H-C.js

This file contains wrappers for calls related to the Canvas API, about which you can read more at MDN:
 * [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
 * [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

The goal is to prevent fingerprinting by modifying the values that can be read from the canvas.
So the visual content of wrapped canvases as displayed on the screen is the same as intended.

The modified content can be either an empty image or a fake image that is modified according to
session and domain keys to be different than the original albeit very similar (i.e. the approach
inspired by the algorithms created by [Brave Software](https://brave.com) available [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc).

Note that both approaches are detectable by a fingerprinter that checks if a predetermined image
inserted to the canvas is the same as the read one, see [here](https://arkenfox.github.io/TZP/tests/canvasnoise.html) for an example,
Nevertheless, the aim of the wrappers is to limit the finerprintability.

Also note that a determined fingerprinter can reveal the modifications and consequently uncover
the original image. This can be avoided with the approach that completely clears the data stored
in the canvas. Use the modifications based on session and domain keys if you want to provide an
image that is similar to the original or if you want to produce a fake image that is not
obviously spoofed to a naked eye. Otherwise, use the clearing approach.

