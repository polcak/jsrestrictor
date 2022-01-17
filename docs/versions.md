---
title: Release history
---

## 0.6.2

* Make sure that dynamically created iframes are not vulnerable to leaking unwrapped APIs (Update NSCL)

## 0.6.1

* Disable FPD by default, you are welcome to opt-in
* Provide access to advanced options from the main options page
* Fix update script to migrate to new configuration

## 0.6

* New protection: Fingerprint detector, see the blogpost for explanation.
* Physical environment wrapper group added. It contains `Sensor`, `Magnetometer`, `Accelerometer`, `LinearAccelerationSensor`, `GravitySensor` wrappers. Some readings might be inconsistent. `Gyroscope` and `Orientation` sensors will be a part of a future release.
* It is possible to import/export configuration (Github issue #159).
* Improved accessibility of the pop up and option pages.
* Bugfix: Fix double injection of some wrappers. For example, this solves regression in Geolocation
	wrapper introduced in 0.5.

## 0.5.5

* Tighter content script initialization
* Bugfix: wrap `Navigator.prototype` and `Geolocation.prototype` instead of `navigator` and
	`navigator.geolocation`
* Remove additional Geolocation API objects when Geolocation is disabled completely
* Icons updated and synced with the JShelter website

## 0.5.4

* Dark style support added (Github issue #134)
* Bugfix: Removal of debugging noise (Github issue #139)
* Bugfix: Allow removal of user-defined levels with names of a built-in level
* Bugfix: Make sure that all user-defined levels are displayed in "Specific domain level configuration"
  settings page
* Bugfix: Ignore non-existing levels for a specific domain

## 0.5.3

* Bugfix: Cascade top document's level to subframes with no explicitly assigned level. (workaround
	for Github issue #133).
* Bugfix: Improve IPv6 handling in NBS
* Bugfix (Chromium-based browsers): Fix per-domain level options/settings page (Github issue #147)
* Do not display NBS notifactions when accessing 0.0.0.0 and :: (workaround
	for Github issue #125)
* Improve NBS description in the option/settings page.
* Display level names in the pop up to improve usability.

## 0.5.2

* Bugfix: Do not modify JS environment on level 0. Regression appeared in 0.5.

## 0.5.1

* Bugfix: Display correctly NBS status at the current page (Github issue #114)
* Rebranding step 1: change UI-facing icons
* Set minimal pop up width so that the pop up is usable in Chrome (Github issue #112, Pagure issue
	#7)
* Chromium-based browsers: revise Battery API protection that should match the expectations of page
	scripts (mimic Firefox behaviour).
* Fixed typos in settings.

## 0.5

* Add fingerprinting defenses based on Farbling developed by the Brave browser (improved or added
	wrappers for Canvas, Audio, Web	GL, device memory, hardware concurrency, enumerateDevices). Most
	wrappers support provisioning of white lies that differ between origins and sessions (the
	fingeprint is different across origins and across sessions).
 * We claimed to generate white image fake Canvas value but instead generated fully transparent black image. We now generate the white image as it is more common in other anti-canvas fingerprinting tools (level 3).
 * toDataUrl() no longer destructs the original canvas.
* We use NoScript Commons Library to simplify some tasks like cross-browser support.
 * More reliable early content script configuration.
   * CSP headers no longer prevents the extension from wrapping JS APIs in Firefox (Github issue #25)
   * Wrappers should be injected reliably before page scripts start to operate (Github issue #40)
 * We use NSCL to wrap APIs in iframes and workers
   * It is no longer possible to access unwrapped functions from iframes and workers (Pagure issue #2, Github issue #56)
* Ignore trailing '.' in domain names when selecting appropriate custom level.
* Do not freeze wrappers to prevent fingeprintability of the users of JSR. We wrap the correct function
	in the prototype chain instead.
* navigator.getGamepads() wrapper added
* navigator.activeVRDisplays() and navigator.xr wrappers added
* Limit precision of high resolution timestamps in the Event, VRFrameData, and Gamepad interface to be consistent
	with Date and Performance precision

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
