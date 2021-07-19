Title: WebGL
Filename: ../common/wrappingS-WEBGL.js

This file contains wrappers for WebGL related calls
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext

The goal is to prevent fingerprinting by modifying the values from certain WebGLRenderingContext API functions.
This includes return values of various functions which can be hardware/software specific and image data reading.

Content is either modified according to domain and session keys to be different than the original albeit very similar
or replaced by bottom value which is consistent every time.
Both approaches are inspired by the algorithms created by [Brave Software](https://brave.com) available [here](https://github.com/brave/brave-core/$blob/master/chromium_src/third_party/blink/renderer/modules/webgl/webgl_rendering_context_base.cc)
and [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/webgl/webgl2_rendering_context_base.cc).

This wrapper operates with two levels of protection:
*	(0) - return modified results, such as slightly changed image, slightly changed number or random string
*	(1) - return bottom values - such as zero, empty string, empty image, null, etc.

Level 0 is trying to force WebGL fingeprint to be unique on every domain and every session. This can be effective
when used with other wrappers with same options. This level causes breakage of websites using WebGL only rarely.
Level 1 is trying to return as little information as possible while being consistent across domains and sessions.
This level can cause breakage on majority of websites using WebGL.

Note:  Both approaches are detectable by a fingerprinter that checks if a predetermined image
is the same as the read one or if specific function returns expected value.
Nevertheless, the aim of the wrappers is to limit the finerprintability.


