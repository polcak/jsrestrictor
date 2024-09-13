Title: Release history

## 0.19.1

* Improve performance of FPD in temporary background scripts: Limit the amount of data that is stored to the permanent storage as well as the number of write operations without a real hit stemming from the need to recomupte the data.

## 0.19

* [First Manifest V3 release](/mv3-jshelter-debut/), using only MV3 APIs on Chromium-based browsers.
* Updated [NoScript Commons Library](https://github.com/hackademix/nscl) dependency to the `mv3` branch.
* _All browsers_: fixed UI popup failing to render when opened first time after long inactivity
* _Chromium-only_: user-facing warnings about [developer mode](https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users) being currently required on MV3.
* _Chromium-only_: removed Network Boundary Shield (unimplementable in current MV3).
* _Chromium-only_: removed blocking mode Fingerprinting Detection (unimplementable in current MV3).

## 0.18.2

* Improve performance of FPD in temporary background scripts: Limit the amount of data that is stored to the permanent storage as well as the number of write operations without a real hit stemming from the need to recomupte the data.

## 0.18.1

Fix the scope where updateCount used by FPD is created ([Pagure issue
141](https://pagure.io/JShelter/webextension/issue/141). Although the function was not visible to
page scripts, page script could have define their own function with several consequences as JShelter
would call the page script function:

* FPD would not learn about the calls and consequently would not detect fingeprinting attempts by
  the page,
* pop up would not show calls to the wrapped APIs,
* the page would be able to detect that JShelter is being installed,
* if the page would not expect that someone is calling its function it can have any undesired
  consequences.

The bug was present in JShelter since the introduction of FPD in 0.6 and all versions up to 0.18 are
affected.

## 0.18

* Migrate to non-persistent background pages as a [first step towards Manifest v3](/first-mv3-step/).

## 0.17

* Added support for built-in tweaks for specific domains. The goal is to list several domains that
  break unnecessarily. Typically, an addition to the list should be well explained and must not
  lower protection. A nice candidate is WebWorker and the protection of Strict (break) and Remove.
* Updated translations
* Improved FPD report based on user feedback:
 * Do not refresh report automatically when tracking callers but introduce an update button so that
   users refresh when convenient (prevent glitches in the interfaces)
 * Add buttons to hide/show details and fold/unfold groups
 * Do not show traces in bold to better differentiate between API names and traces.
 * Add possibility to forget current traces. Useful when there is a fingerprinting script that activates after some action. The button allows the user to hide the traces triggered in the past and later load only new traces.
* Add support for [signing for Android on AMO](https://blog.mozilla.org/addons/2023/10/05/changes-to-android-extension-signing/), so we needed to increase minimal supported version

## 0.16

* Remove Workers in Recommended JSS level to make JShelter compatible with some pages. This change might be reverted when [Pagure issue 80](https://pagure.io/JShelter/webextension/issue/80#comment-852202) is solved.
* FPD: Add possibility to learn the calling stack of functions that lead to the tracked APIs ([Pagure issue 52](https://pagure.io/JShelter/webextension/issue/52)). This information can be used to create block list or to study the calling code and its effects.
* FPD: Fix browser overloading by FPD messages by HTMLElement.prototype.offsetHeight and offsetWidth wrappers that might have crashed browsers.
* FPD: code cleanup

## 0.15.2

* Fix `window.name` protection, do not clear the property in the first visited page see
  https://pagure.io/JShelter/webextension/issue/116#comment-875070 for more details. The fix affects
  all Chromium-based browsers and Firefox installs with the protection active (by default it is off
  in Firefox as Firefox contains the protection since Firefox 88). This fixes, for example, reCaptcha.
* options: Improve space distribution, see https://github.com/polcak/jsrestrictor/pull/204#issuecomment-1727519706

## 0.15.1

* Fix Chrome manifest that by mistake included a file from a non-existing path. The error prevented
  the extension from starting.

## 0.15

* Update NSCL to uses built-in and faster function to compute sha256.
* Russian translation added.

## 0.14

* Added support for internationalization, Czech translation added, see [blog post](/i18n/) for
  instrctions for translators
* All texts revisited, clarified, and fixed grammar and typos
* Improved performance of Canvas and Audio little-lies wrappers by executing in WebAssembly, there
  will be a separate blog post with additional explanations. See the [bachelor thesis of Martin Zmitko](https://www.vut.cz/en/students/final-thesis/detail/147218) for more details.
* Improved performance of FPD. See the [bachelor thesis of Martin Zmitko](https://www.vut.cz/en/students/final-thesis/detail/147218) for more details.
* Expand description of the wrappers applied when the user interacts with the tweak GUI (suggested by the Plain Text UX review)
* Make level names in main options section stable width
* NSCL updated:
 * Prevent dead object access on using backward/forward cache of the browser
 * Fixed property/function mismatch

## 0.13

Improve performance of the code injection. See the [bachelor thesis of Martin Zmitko](https://www.vut.cz/en/students/final-thesis/detail/147218) for more details.

* The code is no longer generated in the background due to the latency of passing huge messages from
  background to content scripts.
* Optimize injection code size (remove duplicate code).
* Do not generate xray wrapper when in Chromium-based browsers.

## 0.12.2

* Reimplement AudioBuffer.prototype.copyFromChannel to prevent multiple farbling of the same data
* bugfix (Chromium-based): Fix popup to always load current level
* Optimize performance of Canvas and Audio wrappers
* NSCL updated: JShelter benefits from the mechanism to prevent inconsistencies / breakages when the extension gets updated and therefore the old wrappers are invalidated by Firefox which nukes their sandbox and new ones are installed on extension's automatic restart

## 0.12.1

* bugfix: Return the correctly created Worker object from the `Strict` wrapper.

## 0.12

* Cope with the changes of reported plugins and supported MIME types in the HTML standard and
  browsers: The purpose of the wrappers is solely to prevent fingerprinting. As browsers return the
  same 5 plugins, browsers modyfing the array stand out, which makes them more fingerprintable.
  Hence, JShelter does not modify the empty list or the list of five standard plugins.

Reconsider and rewrite Web Worker wrappers (pagure issue 80)

* `Strict` WebWorker policy intentionally breakes Web Workers
* New policy to `Remove` Web Workers used for `Turn fingerprinting protection off` and `Strict` level.
* `Medium` WebWorker policy renamed to `Low` as it only tackles a single issue with Workers.

See FAQ for more information on current Worker wrappers.

Note that the `Low` policy does not work as intended in Firefox and will be fixed in future.
However, it was broken in the same way before 0.12 and the other changes are worth distributing
among our users.

## 0.11.4

* bugfix: allow tweaking all levels except L0 in the popup (pagure issue 89)
* bugfix: clarify and fix the description of changes to NBS in 0.11.3 (pagure issue 41)

## 0.11.3

* bugfix: Remove race condition that reset default level to Recommended from custom levels. Unfortunately, affected users need to manually restore the default level as JShelter cannot distinguish affected users automatically.
* bugfix: Prevent DNS leaks in NBS in the presence of HTTP proxy in Firefox, see pagure issues #41 and #85 and FAQ for more details on the interaction of NBS and proxies.
* enhancement: Fix empty spaces to improve the look of the option page


## 0.11.2

* bugfix: check domains property in advanced options (introduced in 0.10)
* bugfix: remove unused config.whitelistedHosts
* bugfix: Fix several typos in the text in options
* bugfix: Do not use hard-coded level in the advanced options validity checks of configuration
* feature: Add option to reset configuration to advanced options
* enhancement: Reimplement JSS configuration in option to improve understandability
* enhancement: Fix race conditions in displaying stored configuration after changes through options
* enhancement: Add undo to advanced options
* enhancement: Warn users from tweaking their settings due to higher risks of reidentification via browser fingerprinting
* enhancement: Add button to cancel the addition of a new level, update the error texts
* website: little improvements and clarifications

Most of the changes were influenced by the Plain Text UX review

## 0.11.1

* NBS: do not show notifications for hostnames resolving to undefined IP addresses as described in FAQ (broken in 0.11 that does not show notifications only for undefined IP addresses, but shows notifications for hostnames resolving to undefined IP addresses)

## 0.11

* Reset `window.name` only on eTLD+1 changes
* Farbling: Use eTLD+1 instead of origin to generate hash
* FPD: Clear storage during navigation (prevent the page from storing the hash to a local storage
	and loading the hash after page reload)
* FPD configuration: Decouple notification and behaviour settings. Let a user to optionally disable notifications without strict effect on behaviour
* Improve CSP of the extension pages, fix broken favicons in FPD report
* NBS: Block requests to undefined IP address (0.0.0.0 or [::]) but do not show notifications
* Fix extension initialization in permanent private mode
* options: Add external links to JShelter.org FAQ and threat model
* Add favicons to options pages
* Remove unused icons

## 0.10

* Add wrappers modifying calls detecting supported media types and installed codecs (Multimedia playback), github issue 66
* Add wrappers modifying `HTMLMediaElement.prototype.canPlayType` (Multimedia playback)
* Add wrappers disabling Network Information API inspired by Brave, github issue 66
* Add wrappers disabling Web NFC API, github issue 66
* Add wrappers for Cooperative Scheduling of Background Tasks API, github issue 66
* Add wrappers for User idle detection, github issue 66
* Add possibility to set NBS as passive (notify user but do not block), github issue 66
* Fix Web Audio wrappers (Pagure issue #16)
* FPD Report allows exporting data as JSON
* Modified FPD wrappers independent on JSS
* FPD can be configured as strict (more aggressive fingerprinting detection)
* Better storages removal through content script in the absence of browserData permissions by FPD
* Fix early loading of module configuration (FPD used to be disabled after first installation)
* FPD initialization reworked
* Add support for customizing settings for file:// scheme (Github issue #180)
* Improve config checker in advanced options
* Improved English, naming consistency, and some descriptions
* Apply Content-Security-Policy to webextension pages
* Fix some issues with invalid domains in advanced JavaScript Shield configuration (Pagure issue 45)

## 0.9

* Firefox: deactivate window.name wrapper for Firefox; Firefox provides protection since 88 and
	JShelter wrapper brakes pages
* Enable webworker wrappers by default, see the paper https://arxiv.org/abs/2204.01392, §4.3
* Tidy up popup UI and FPD report UI
* Show wrapper groups descriptions in options.html

## 0.8.1

* Add "Turn fingerprinting protection off" level. As the AFPD shows the likelihood of fingerprinting, some users might be tempted to trade some performance gain for no protection against fingerprinting. See for example Github #179.
* Fix displaying empty FPD report

## 0.8

* Add FPD report page
* Show fingerprinting likelihood in the popup and badge icon colour
* GPS wrapper reimplemented to use farbling (simulate a stationary device for per domain and
	sessions), previously each page load generated a new position
* Reorganize canvas reading wrappers, all are in the same group
* Security review and hardening of the wrappers
 * Do not change values depending on activated tweaks
 * Remove obvious reversibility of the canvas farbling
 * Unify wrapping between H-C and WEBGL
 * Unify the wrappers in Strict and Farbling wrapping of WebGL parameters (some were farbled but not disabled on Strict)
 * Farbling of WebGL parameters spread more wildly to hide the correct
   number (that might have been revealed after several visits)
 * WebGL: Farble renderer and vendor the same way as unmasked versions
 * Remove possible dependencies between multiple wrapping groups using
   randomString()
 * Strict: Return empty UNMASKED VENDOR and RENDERER - Previosuly, these values depended
   on the domainHash, that meant that the unique value could be used to uniquely fingerprint the device.
 * Harden WEBA farbling
 * Scramble the output of PRNG with domainHash to prevent guessing the
   future PRNs
 * Try to improve speed as possible but the wrapping is likely slower
   than 0.7.x
* Github #125: Add option to disable NBS notifications, limit the number of notifications
* Fix Pagure #18 Optional permissions for AFPD - it is not necessary to give browsingData
* Allowlist options in NBS and FPD changed breaking backwards compatibility
* When optionally activated, wrap BigInt typed arrays the same way as other typed arrays

## 0.7.1

* Apply proper shielding for `navigator.plugins` in Firefox.
* Hide FPD notification after a while to prevent windows notification spam in chromium-based browsers

## 0.7

* JavaScript Restrictor rebranded to JShelter.
* The extension officially consists of JavaScript Shield (originally called wrappers), NBS, and FPD.
	Unified way to disable each component in the pop up. This should prevent users from disabling NBS
	thinking they disabled JSS.
* New UI to create and tweak JavaScript Shield levels.
* Pop up redesigned. Try not to confuse the user about global/per-page settings.
* It is possible to create per-domain JavaScript Shield tweaks, i.e. enable or disable specific
	group of wrappers for certain domain only without the necessity to create a new level.
* The wrapping strength is defined by the user with a range input.
* The badge icon does not show level ID anymore. JShelter shows the number of wrapping groups
	accessed by the current page. Report the number of calls for wrapped APIs in the pop up.
* Level 1 removed as it was not properly maintained.
* Timestamp protection in level 2 increased to match level 3.
* XHR wrappings and (sharred) array buffers not wrapped anymore as XHR is superseded by FPD and
	array buffers break other APIs.
* New experimental level added that is based on original level 3.
* Better and much longer description of built-in levels.
* Added support for device rotation. Accelerometer, LinearAccelerationSensor, GravitySensor, and Magnetometer now adjust the gravity vector by the rotation matrix.
* AmbientLightSensor, Gyroscope, AbsoluteOrientationSensor, and RelativeOrientationSensor wrappers added.
* Accessibility improvements in pop up.
* New colour scheme based on the logo and JShelter.org web site for both light and dark theme.
* Load FPD settings from advanced options correctly.
* Some inconsistences in update mechanism of hardware and  enumerateDevices found and fixed.
* Level settings are not backward-comptible, backup 0.6.x configuration if you plan to downgrade.

## 0.6.5

* Update NSCL to work around a change in Chrome permissions:
 * Use HTTPS endpoint for Chromium (works around lack of file access by default on packed extensions), see
    also https://forums.informaction.com/viewtopic.php?p=104921#p104921
 * Also includes a work-around for object element initialization inconsistencies on Firefox

## 0.6.4

* Fix wrapping of `navigator.plugins` in Firefox. This regression appeared in 0.6 in the generated code restricted by `apply_if` condition.

## 0.6.3

* Make sure that dynamically created iframes are not vulnerable to leaking unwrapped APIs (Update NSCL)
* Fix FPD when run in a limited environment
* Do not interfere with time explicitly given to Date object
* Fix Network Boundary Shield name in the popup

## 0.6.2

* Fix required permissions for Chromium-based browsers - webNavigation is not needed

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
* Do not display NBS notifications when accessing 0.0.0.0 and :: (workaround
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
	wrappers support provisioning of little lies that differ between origins and sessions (the
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
* Do not freeze wrappers to prevent fingerprintability of the users of JShelter. We wrap the correct function
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
*  Network Boundary Shield prevents web pages to use the browser as a proxy between local network and the public Internet. See the [Force Point report](https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf) for an example of the attack. The protection encapsulates the WebRequest API, so it captures all outgoing requests.
* Allow multiple custom levels
* Do not modify DOM of displayed pages (the modifications were detectable by the page scripts and may
	reveal that the user is running JShelter)
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
