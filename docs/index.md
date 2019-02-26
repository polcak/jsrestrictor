---
---

JavaScript Restrictor or JSR is a browser extension which increases level of security, anonymity and privacy of the user while browsing the internet. Various websites can collect information about users without their awareness of it, which can lead to identification of the users. Also, an attacker can use malicious websites to collect data about the user or fingerprint user’s device. This extension aims to protect the user by rounding or modifying values which are websites collecting. Inaccurate values of data - given by this extension - mislead websites which are collecting such data. This leads to a higher level of anonymity and security for the user. JavaScript Restrictor can modify following values:

* **window.Date object**: this high-resolution timestamp can be used to idenfity the user or can be used for microarchitectural attacks
* **window.performance.now() function**: this high-resolution timestamp can be used to idenfity the user or can be used for microarchitectural attacks,
* **Canvas element**: this element is used to draw graphics in browser, however it can be also used to fingerprint the user’s device,
* **Geolocation data**: this can be used to identify an electronic device’s physical location,
* **XMLHttpRequest (XHR), experimental only**: available only for "Custom level", XHR issues additional requests to the server even

There are five levels of protection ready to use:

* 0 - the functionality of the extension is turned off. No actions are taken. All web pages are displayed as intended without any interaction from JavaScritpt Restrictor.

* 1 - first level of protection. This increases your level of protection. It means that websites collect a modified timestamp values and geolocation data. Canvas elements are not blocked.
* 2 - second level of protection. On this level websites collect even more modified timestamp values and geolocation data, all canvas elements are blocked.
* 3 - maximum level of protection. Websites collect highly modified timestamp values, all canvas elements are blocked and geolocation data is nulled.
* Custom - your level of protection. If you want, you can set your own level of protection and use it.

Note that the blocking and rounding actions performed by the extension can break the functionality of the site (e.g. Google Maps). Please [report to us](https://github.com/polcak/jsrestrictor/issues) any malfunction sites that does not track users and bugs.

The default level of protection can be set by a popup (clicking on JSR icon) or through options of the extension. Specific level of protection for specific domains/websites can be set in options by adding them to the list of websites with specific level. This can be done also by a popup when the user visits the website.
Support

If you have any questions or you’ve spotted a bug, please [let us know](https://github.com/polcak/jsrestrictor/issues).

If you would like to give us [feedback](https://github.com/polcak/jsrestrictor/issues), we would really appreciate it.

Once you install the extension, see the [test page](test/test.html) for the working demo on how the
extension can help in restricting JS capabilities.
