
# Release history

## 0.3

* Major code rewrite - make the code more modular, remove duplications
* Allow multiple custom levels
* Do not modify DOM of displayed pages (the modifications were detectable by the page scripts and may
	reveal that the user is running JSR)
* Canvas fingerprinting: originally, only toDataURL was blocked. The extension now blocks CanvasRenderingContext2D.prototype.getImageData and HTMLCanvasElement.prototype.toBlob.
* Block additionaly methods to get performance data.
* Removed features:
 * Do not change request HTTP headers. See the paper FP-Scanner: The privacy implications of browser
    fingerprint inconsistencies and pages like
    https://ghacksuserjs.github.io/TorZillaPrint/TorZillaPrint.html.
 * GPS/location is not blocked anymore, we expect to reintroduce this feature in the future.
* Unfortunately, we do not migrate old settings as the levels were redesigned and several features
	were removed. We expect to migrate previous settings in the future.
* Initial attempt to deal with a bug https://bugzilla.mozilla.org/show_bug.cgi?id=1267027 but it
	does not work completely as expected, yet.
* Make sure that calling toString on the wrapped function does not leak the wrapping code.
* GUI rewritten.
* Do not open the main page after browser or extension update as it is irritating and may send a
	signal that the user is tracked.

## 0.2.1

* Fix `Date` wrapping that used to break some pages; `Date` wrapping code improved
* Improve `XMLHttpRequest` wrapping

## 0.2

* Additional APIs that can be wrapped:
 * `navigator` properties: `userAgent`, `vendor`, `platform`, `appVersion`, `oscpu`, `language`, `languages`
 * `document` properties: `referrer`

## 0.1

* Initial public version
