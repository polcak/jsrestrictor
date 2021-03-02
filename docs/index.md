> **Disclaimer**: This is a research project under development, see the [issue page](https://github.com/polcak/jsrestrictor/issues) and the [webextension home page](https://polcak.github.io/jsrestrictor/) for more details about the current status.

A JS-enabled web page can access any of the APIs that a web browser provides. The user has only a limited control and some APIs cannot be restricted by the user easily. JavaScript Restrictor aims to improve the user control of the web browser. Similarly to a firewall that controls the network traffic, JavaScript Restrictor controls the APIs provided by the browser. The goal is to improve the privacy and security of the user running the extension.

JavaScript Restrictor (JSR) is a browser extension with support for multiple browsers: [Firefox](https://addons.mozilla.org/cs/firefox/addon/javascript-restrictor/), [Google Chrome](https://chrome.google.com/webstore/detail/javascript-restrictor/ammoloihpcbognfddfjcljgembpibcmb), and [Opera](https://addons.opera.com/en/extensions/details/javascript-restrictor/). The extension also works with Brave, Microsoft Edge, and most likely any Chromium-based browser. [Let us know](https://github.com/polcak/jsrestrictor/issues) if you want to add the extension to additional store.

Various websites collect information about users without their awareness. The collected information is used to track users. Malicious websites can fingerprint user browsers or computers. JavaScript Restrictor protects the user by restricting or modifying several web browser APIs used to create side-channels and identify the user, the browser or the computer. JavaScript Restrictor can block access to JavaScript objects, functions and properties or provide a less precise implementation of their functionality, for example, by modifying or spoofing values returned by the JS calls. The goal is to mislead websites by providing false data or no data at all.

Another goal of the extension is not to break the visited websites. As the deployment of JavaScript only websites rise, it is necessary to fine-tune the API available to the websites to prevent unsolicited tracking and protect against data thefts.

JavaScript Restrictor currently supports modifying and restricting the following APIs (for more details visit [levels of protection page](https://polcak.github.io/jsrestrictor/levels.html)):

* **Network boundary shield** (NBS) prevents web pages to use the browser as a proxy between local network and the public Internet. See the [Force Point report](https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf) for an example of the attack. The protection encapsulates the WebRequest API, so it captures all outgoing requests including all elements created by JavaScript.
* **window.Date object**, **window.performance.now()** and **window.PerformanceEntry** provide high-resolution timestamps that can be used to [idenfity the user](http://www.jucs.org/jucs_21_9/clock_skew_based_computer) or can be used for microarchitectural attacks and [timing attacks](https://lirias.kuleuven.be/retrieve/389086).
* **HTMLCanvasElement**:  Functions canvas.toDataURL(), canvas.toBlob(), CanvasRenderingContext2D.getImageData, OffscreenCanvas.convertToBlob() return either - modified image data based on session and domain keys, making canvas fingerprint unique, or white image. Canvas element provides access to HW acceleration which may reveal the card and consequently be used as a fingerprinting source.
* **AudioBuffer and AnalyserNode**: These API can be used to create fingerprint by analysing audio signal. JSR modifies AudioBuffer.getChannelData(), AudioBuffer.copyFromChannel(), AnalyserNode.getByteTimeDomainData(), AnalyserNode.getFloatTimeDomainData(), AnalyserNode.getByteFrequencyData() and AnalyserNode.getFloatFrequencyData() to alter audio data based on domain key, or return white noise based on domain key, making audio fingerprint unique.
* **WebGLRenderingContext**: WebGL parameters and functions can expose hardware and software uniqueness. JSR modifies function WebGLRenderingContext.getParameter() to return bottom values (null, 0, empty string, etc) or alter return values for certain arguments. WebGLRenderingContext.getActiveAttrib, WebGLRenderingContext.getActiveUniform,
WebGLRenderingContext.getAttribLocation, WebGLRenderingContext.getBufferParameter, WebGLRenderingContext.getFramebufferAttachmentParameter,
WebGLRenderingContext.getProgramParameter, WebGLRenderingContext.getRenderbufferParameter, WebGLRenderingContext.getShaderParameter,
WebGLRenderingContext.getShaderPrecisionFormat, WebGLRenderingContext.getTexParameter, WebGLRenderingContext.getUniformLocation,
WebGLRenderingContext.getVertexAttribOffset, WebGLRenderingContext.getSupportedExtensions, WebGLRenderingContext.getExtension are modified to return bottom values. WebGLRenderingContext.readPixels() is modified to return either empty image or modified image data based on session and domain keys.
* **MediaDevices.prototype.enumerateDevices** provides a unique strings identifying cameras and
	microphones. This strings can be used to fingerprint the user (user session).
* **navigator.deviceMemory** or **navigator.hardwareConcurrency** can reveal hardware specification of the device.
* **XMLHttpRequest (XHR)** performs requests to the server after the page is displayed and gathered information available through other APIs. Such information might carry identification data or results of other attacks.
* **ArrayBuffer** can be exploited for microarchitectural attacks.
    * Encapsulates window.DataView, window.Uint8Array, window.Int8Array, window.Uint8ClampedArray, window.Int16Array, window.Uint16Array, window.Int32Array, window.Uint32Array, window.Float32Array, window.Float64Array
* **SharedArrayBuffer (window.SharedArrayBuffer)** can be exploited for [timing attacks](https://graz.pure.elsevier.com/de/publications/fantastic-timers-and-where-to-find-them-high-resolution-microarch).
* **WebWorker (window.Worker)** can be exploited for [timing attacks](https://graz.pure.elsevier.com/de/publications/practical-keystroke-timing-attacks-in-sandboxed-javascript).
* **[Geolocation API](https://www.w3.org/TR/geolocation-API/) (navigator.geolocation)**: Although
	the browser should request permission to access to the Geolocation API, the user can be unwilling
	to share the exact position. JSR allows the user to limit the precission of the API or disable the
	API. JSR also modifies the timestamps provided by Geolocation API in consistency with its time
	precision settings.
* **window.name** provides a very simple cross-origin tracking method of the same tab, see https://github.com/polcak/jsrestrictor/issues/72, https://developer.mozilla.org/en-US/docs/Web/API/Window/name,	https://2019.www.torproject.org/projects/torbrowser/design/,	https://bugzilla.mozilla.org/show_bug.cgi?id=444222, and https://html.spec.whatwg.org/#history-traversal. JSR provides an option to remove any `window.name` content on each page load.

JavaScript Restrictor provides four in-built levels of protection:

* 0 - the functionality of the extension is turned off. All web pages are displayed as intended without any interaction from JavaScript Restrictor.
* 1 - the minimal level of protection. Only changes that should not break most pages are enabled.
	Note that timestamps are rounded so pages relying on precise time may be broken.
* 2 - intended to be used as a default level of protection, this level should not break any site
	while maintaining strong protection.
* 3 - maximal level of protection: enable all functionality.

For more accurate description of the restrictions see [levels of protection page](https://polcak.github.io/jsrestrictor/levels.html).

Note that the spoofing and rounding actions performed by the extension can break the functionality of a website (e.g. Netflix). Please [report to us](https://github.com/polcak/jsrestrictor/issues) any malfunction websites that do not track users.

The default level of protection can be set by a popup (clicking on JSR icon) or through options of the extension. Specific level of protection for specific domains can be set in options by adding them to the list of websites with specific level of protection. This can be done also by a popup during a visit of the website.

If you have any questions or you’ve spotted a bug, please [let us know](https://github.com/polcak/jsrestrictor/issues).

If you would like to give us [feedback](https://github.com/polcak/jsrestrictor/issues), we would really appreciate it.

Once you install the extension, see the [test page](test/test.html) for the working demo on how the
extension can help in restricting JS capabilities.
