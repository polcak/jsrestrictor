> **Disclaimer**: This is a research project under development, see the [issue page](https://github.com/polcak/jsrestrictor/issues) and the [webextension home page](https://polcak.github.io/jsrestrictor/) for more details about the current status.

A JS-enabled web page has a full control of the APIs that a web browser provides. The customization is only minimal and some APIs cannot be restricted by the user without modifying the web browser source code. JavaScript Restrictor aims to improve the user control of the web browser. Similarly to a firewall that controls the network traffic, JavaScript Restrictor controls the APIs provided by the browser. The goal is to improve the privacy and security of the user running the extension.

<<<<<<< HEAD
JavaScript Restrictor or JSR is a browser extension with support for multiple browsers: [Firefox](https://addons.mozilla.org/cs/firefox/addon/javascript-restrictor/), [Google Chrome](https://chrome.google.com/webstore/detail/javascript-restrictor/ammoloihpcbognfddfjcljgembpibcmb), and [Opera](https://addons.opera.com/en/extensions/details/javascript-restrictor/).
=======
* **window.Date object**: this high-resolution timestamp can be used to idenfity the user or can be used for microarchitectural attacks
* **window.performance.now() function**: this high-resolution timestamp can be used to idenfity the user or can be used for microarchitectural attacks,
* **Canvas element**: this element is used to draw graphics in browser, however it can be also used to fingerprint the user’s device,
* **Geolocation data**: this can be used to identify an electronic device’s physical location,
* **XMLHttpRequest (XHR), experimental only**: available only for "Custom level", XHR issues additional requests to the server even
>>>>>>> 7dac7ae6c0af1aa1732ff598858cfe4fb44f6b86

Various websites collect information about users without their awareness. The collected information is used to track users. Malicious websites can fingerprint user browsers or computers. JavaScript Restrictor protects the user by restricting or modifying several web browser APIs used to create side-channels and identify the user, the browser or the computer. JavaScript Restrictor can block access to JavaScript objects, functions and properties or provide a less precise implementation of their functionality, for example, by rounding or modifying values returned by the JS calls. The goal is to mislead websites by providing false data or no data at all.

<<<<<<< HEAD
Another goal of the extension is not to break the visited websites. As the deployment of JavaScript only websites rise, it is necessary to fine-tune the API available to the websites to prevent unsolicited tracking and protect against data thefts.
=======
* 0 - the functionality of the extension is turned off. No actions are taken. All web pages are displayed as intended without any interaction from JavaScritpt Restrictor.

* 1 - first level of protection. This increases your level of protection. It means that websites collect a modified timestamp values and geolocation data. Canvas elements are not blocked.
* 2 - second level of protection. On this level websites collect even more modified timestamp values and geolocation data, all canvas elements are blocked.
* 3 - maximum level of protection. Websites collect highly modified timestamp values, all canvas elements are blocked and geolocation data is nulled.
* Custom - your level of protection. If you want, you can set your own level of protection and use it.
>>>>>>> 7dac7ae6c0af1aa1732ff598858cfe4fb44f6b86

JavaScript Restrictor currently supports modifying and restricting the following APIs:

* **window.Date object** and **window.performance.now() function** provide high-resolution timestamps that can be used to idenfity the user or can be used for microarchitectural attacks,
* **Canvas element** allows drawing graphics inside a web browser, however the element provides access to HW acceleration which may reveal the card and consequently be used as a fingerprinting source,
* **Geolocation data** can reveal the physical location of the device,
* **XMLHttpRequest (XHR), experimental only** (available only in the _Custom level_) issues requests to the server after the page is displayed and gathered information available through other APIs. Such information might carry identification data.

JavaScript Restrictor provides five levels of protection:

* 0 - the functionality of the extension is turned off. All web pages are displayed as intended without any interaction from JavaScript Restrictor.
* 1 - the minimal level of protection. The timestamp values and geolocation data are modified. Canvas APIs are not blocked.
* 2 - improved level of protection. On this level the timestamp values and geolocation data are even more restricted, all canvas elements are blocked.
* 3 - maximal level of protection. Timestamp values are even more restricted, all canvas elements are blocked and geolocation data is nullified.
* Custom - your level of protection. If desired, you can set your own level of protection.

Note that the blocking and rounding actions performed by the extension can break the functionality of a website (e.g. Google Maps). Please [report to us](https://github.com/polcak/jsrestrictor/issues) any malfunction websites that do not track users.

The default level of protection can be set by a popup (clicking on JSR icon) or through options of the extension. Specific level of protection for specific domains can be set in options by adding them to the list of websites with specific level of protection. This can be done also by a popup during a visit of the website.

If you have any questions or you’ve spotted a bug, please [let us know](https://github.com/polcak/jsrestrictor/issues).

If you would like to give us [feedback](https://github.com/polcak/jsrestrictor/issues), we would really appreciate it.

Once you install the extension, see the [test page](test/test.html) for the working demo on how the
extension can help in restricting JS capabilities.
