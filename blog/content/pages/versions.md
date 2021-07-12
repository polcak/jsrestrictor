Title: Release History
Date: 2021-01-01 12:00
Slug: changelog
Authors: Libor Polčák
Summary: Project changelog


# Release history

## 0.4.7

* Wrap Beacon API
* Bugfix: inject content scripts to all iframes
* Fix exception throwing in the code generator dealing with Firefox bug 1267027

## 0.4.6

* NBS improvements for Chromium-based browsers: block a host after detecting the first suspicious HTTP request from the public to the private network.

## 0.4.5

* Add wrapper of MediaDevices.prototype.enumerateDevices
* Fix missing Date properties
* Fix Geolocation overflows appearing near poles
* Improve handling of domain names (URLs):
 * Handle IPv4 addresses used as hostnames correctly
 * Do not treat TLD specially and allow specifying wrapping levels for TLDs
 * Fix handling of two-letters 2-nd level domains
* Fix exception throwing in the code generator dealing with Firefox bug 1267027

## 0.4.4

* Bugfix: Do not try to redefine undefined objects. The exceptions thrown in injected code used to
	prevent application of all the wrapping code.

## 0.4.3

* Add an option to clear `window.name` with each page reload.

## 0.4.2

* Rewrite the NBS for Chromium-based browsers with custom DNS cache build with resolved data available in onResponseStartedListener()

## 0.4.1

* Fix the amount of saved data through pop-up (for a specific domain), it is much harder to reach
	the quoa

## 0.4

* Re-introduced Geolocation API wrapping (several settings available).

## 0.3.2

* Bugfix: Set up domain-specific levels from storage correctly
* Wrap PerformanceEntry instead of performance.getEntries\*() - prevents a known leak of precise
	time stamps in Chromium-based browsers.
* Add note on the effectivity of time randomization
* Firefox fix background and content scripts synchronization, use correct naming (improves speed)
* Time wrappers in Firefox affected by the <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1267027">Fiefox CSP bug</a> should work better. However, the precise timers are not wrapped, see also <a href="https://github.com/polcak/jsrestrictor/issues/25">#25</a>.
* NBS message for Chromium-based browsers reworded.

## 0.3.1

* Improve compatibility with Chromium based browsers

## 0.3

* Major code rewrite - make the code more modular, remove duplications
* Add wrappings inspired by [JavaScript Zero: Real JavaScript and Zero S
ide-Channel Attacks](https://misc0110.net/web/files/jszero.pdf)
*  Network boundary shield prevents web pages to use the browser as a proxy between local network and the public Internet. See the [Force Point report](https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf) for an example of the attack. The protection encapsulates the WebRequest API, so it captures all outgoing requests.
* Allow multiple custom levels
* Do not modify DOM of displayed pages (the modifications were detectable by the page scripts and may
	reveal that the user is running JSR)
* Canvas fingerprinting: originally, only `toDataURL` was blocked. The extension now blocks `CanvasRenderingContext2D.prototype.getImageData` and `HTMLCanvasElement.prototype.toBlob`.
* Block additionaly methods to get performance data.
* Unfortunately, we do not migrate old settings as the levels were redesigned and several features
	were removed. We expect to migrate previous settings in the future.
* Initial attempt to deal with a bug [https://bugzilla.mozilla.org/show_bug.cgi?id=1267027](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027) but it
	does not work completely as expected, yet.
* Make sure that calling toString on the wrapped function does not leak the wrapping code.
* Fix original canvas method leaks through iframes
* Do not allow page scripts to delete wrappers
* GUI rewritten.
* Do not open the main page after browser or extension update as it is irritating and may send a
	signal that the user is tracked.
* *Removed feature* Do not change request HTTP headers. See the paper
    FP-Scanner: The privacy implications of browser
    fingerprint inconsistencies and pages like
    [https://ghacksuserjs.github.io/TorZillaPrint/TorZillaPrint.html](https://ghacksuserjs.github.io/TorZillaPrint/TorZillaPrint.html).
* *Removed feature* GPS/location is not blocked anymore, we expect to reintroduce this feature in the future.

## 0.2.1

* Fix `Date` wrapping that used to break some pages; `Date` wrapping code improved
* Improve `XMLHttpRequest` wrapping

## 0.2

* Additional APIs that can be wrapped:
 * `navigator` properties: `userAgent`, `vendor`, `platform`, `appVersion`, `oscpu`, `language`, `languages`
 * `document` properties: `referrer`

## 0.1

* Initial public version
