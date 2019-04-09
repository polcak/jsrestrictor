> **Disclaimer**: This is a research project under development, see the [issue page](https://github.com/polcak/jsrestrictor/issues) and the [webextension home page](https://polcak.github.io/jsrestrictor/) for more details about the current status.

A JS-enabled web page can access any of the APIs that a web browser provides. The user has only a limited control and some APIs cannot be restricted by the user easily. JavaScript Restrictor aims to improve the user control of the web browser. Similarly to a firewall that controls the network traffic, JavaScript Restrictor controls the APIs provided by the browser. The goal is to improve the privacy and security of the user running the extension.

JavaScript Restrictor (JSR) is a browser extension with support for multiple browsers: [Firefox](https://addons.mozilla.org/cs/firefox/addon/javascript-restrictor/), [Google Chrome](https://chrome.google.com/webstore/detail/javascript-restrictor/ammoloihpcbognfddfjcljgembpibcmb), and [Opera](https://addons.opera.com/en/extensions/details/javascript-restrictor/).

Various websites collect information about users without their awareness. The collected information is used to track users. Malicious websites can fingerprint user browsers or computers. JavaScript Restrictor protects the user by restricting or modifying several web browser APIs used to create side-channels and identify the user, the browser or the computer. JavaScript Restrictor can block access to JavaScript objects, functions and properties or provide a less precise implementation of their functionality, for example, by modifying or spoofing values returned by the JS calls. The goal is to mislead websites by providing false data or no data at all.

Another goal of the extension is not to break the visited websites. As the deployment of JavaScript only websites rise, it is necessary to fine-tune the API available to the websites to prevent unsolicited tracking and protect against data thefts.

JavaScript Restrictor currently supports modifying and restricting the following APIs (for full details visit [levels of protection page](https://polcak.github.io/jsrestrictor/levels.html):

* **Various Navigator object data** and **HTTP web requests,** which can be queried for information about the user's User Agent, platform, browser version etc.,
* **document.referrer** and **Referrer HTTP web request** gives the URI of the page that linked to the current page,
* **navigator.language** and **Accept-Language HTTP web request** can reveal user's preferred language and the language of the browser UI,
* **navigator.doNotTrack** gives browser's Do Not Track setting,
* **window.Date object** and **window.performance.now() function** provide high-resolution timestamps that can be used to idenfity the user or can be used for microarchitectural attacks,
* **HTMLCanvasElement.toDataURL()** function can be used to fingerprint user's device. Canvas element provides access to HW acceleration which may reveal the card and consequently be used as a fingerprinting source,
* **Geolocation data** can reveal the physical location of the device,
* **navigator.deviceMemory** or **navigator.hardwareConcurrency** can reveal hardware specification of the device, 
* **navigator.cookieEnabled, experimental only** (available only in the _Custom level_) to determine if the client web browser has cookies enabled,
* **XMLHttpRequest (XHR), experimental only** (available only in the _Custom level_) issues requests to the server after the page is displayed and gathered information available through other APIs. Such information might carry identification data,

JavaScript Restrictor provides five levels of protection:

* 0 - the functionality of the extension is turned off. All web pages are displayed as intended without any interaction from JavaScript Restrictor.
* 1 - the minimal level of protection. The timestamp values and geolocation data are modified. Also hardware spoofing is enabled.
* 2 - improved level of protection. On this level User Agent, platform and hardware information as well as referrer are spoofed. Protection against canvas fingerprinting is enabled. The timestamp values and geolocation data are even more restricted.
* 3 - maximal level of protection. User Agent, platrofm, hardware and also browser's language is spoofed. Protection against canvas fingerprinting is enabled. Timestamp values are even more restricted and geolocation data is nullified.
* Custom - your level of protection. If desired, you can set your own level of protection.

For more accurate description of the restrictions see [levels of protection page](https://polcak.github.io/jsrestrictor/levels.html).

Note that the spoofing and rounding actions performed by the extension can break the functionality of a website (e.g. Facebook or Instagram). Please [report to us](https://github.com/polcak/jsrestrictor/issues) any malfunction websites that do not track users.

The default level of protection can be set by a popup (clicking on JSR icon) or through options of the extension. Specific level of protection for specific domains can be set in options by adding them to the list of websites with specific level of protection. This can be done also by a popup during a visit of the website.

If you have any questions or you’ve spotted a bug, please [let us know](https://github.com/polcak/jsrestrictor/issues).

If you would like to give us [feedback](https://github.com/polcak/jsrestrictor/issues), we would really appreciate it.

Once you install the extension, see the [test page](test/test.html) for the working demo on how the
extension can help in restricting JS capabilities.
