Title: Final remarks on the JSR project
Date: 2022-05-10 18:00
Series: JShelter background

The [JavaScript Restrictor](https://nlnet.nl/project/JSRestrictor/) ([JSR](/support/)) project (supported by [NGI0 PET
Fund](https://nlnet.nl/PET), a fund established by [NLnet](https://nlnet.nl/) with financial support
from the European Commission's [Next Generation Internet](https://ngi.eu/) programme, under the
aegis of DG Communications Networks, Content and Technology under grant agreement No 825310) is
heading towards its end, and we summarize what the project gave JShelter and reiterate the chosen
approaches.

### What are the steps that JShelter takes to protect users?

During the NGI0 PET Fund JSR project, we investigated fingerprinting scripts and prepared wrappers,
developed Fingerprint Detector, ported anti-fingerprinting mechanisms from Brave, and improved the
reliability of the code-injection mechanisms (the credit for the relaible injection goes to [the
parallel NGI0 PET project](https://nlnet.nl/project/JShelter/)). Let us go
through the list in more detail:

We reviewed literature focusing on the fingerprinting scripts and studied APIs [declined by
Apple](https://github.com/polcak/jsrestrictor/issues/66). During the project, we added or improved wrappers to JavaScript Shield for:

* All API calls providing timestamps,
* `window.name`,
* `MediaDevices.prototype.enumerateDevices`
* Beacon API,
* Canvas API and Web GL API,
* Audio API,
* `Navigator.prototype.hardwareConcurrency`
* `Navigator.prototype.deviceMemory`
* `Navigator.prototype.getGamepads`
* `Navigator.prototype.activeVRDisplays`
* `Navigator.prototype.plugins`
* Sensor API: Magnetometer, Accelerometer, LinearAccelerationSensor, GravitySensor, Gyroscope,
* AbsoluteOrientationSensor, RelativeOrientationSensor, and AmbientLightSensor
* BigInt typed arrays
* `Navigator.prototype.requestMediaKeySystemAccess`
* `MediaCapabilities.prototype.encodingInfo`
* `MediaCapabilities.prototype.decodingInfo`
* `HTMLMediaElement.prototype.canPlayType`
* Network Information API
* Web NFC API
* Cooperative Scheduling of Background Tasks API
* User idle detection

Note that JShelter modifies APIs depending on the selected JavaScript Shield level and the tweaks for the visited domain.

Previous literature modifies outputs of some APIs differently during repeated
calls. JShelter [adopted the model of Brave](/farbling/). Hence, different origins read different values from the same APIs. One origin reads the same values for each repeated
reading in the same browser session. Therefore, a fingerprint computed from these values is
different for each origin and session, making cross-site correlation harder. Note that some identifiers like an IP address
are outside of JShelter reach. JShelter provides different readings to the same origin in a new
browser session.

[FP-Random](https://github.com/plaperdr/fprandom)  modifies data inserted into the canvas. For example, if the page wants to draw with orange colour,
FP-Random draws with a different shade of orange. We do not think that this is a good strategy for JShelter:

* JShelter currently does not modify what users see in canvases (i.e. the browser does not modify
  the visual representation). JShelter only modifies read data - so each script sees different
	values than users. In other words, while FP-Random breaks both visual representation and export
	functions, JShelter breaks only export functions.
* Web GL offers visual effects produced by lighting, textures and other techniques. Identifying all
  mechanisms that need to be wrapped and modified seem to be too complex and out of the reach of
	this project.

JShelter provides [Fingerprint Detector](/fpdetection/) (FPD), a module that heuristically detects fingerprinting and
notifies users with an option to block future communications. This anti-fingerprinting mechanism is
orthogonal to the little lies anti-fingerprinting mechanisms in JavaScript Shield, and we advise using both mechanisms.
Little lies help if the fingerprinting scripts upload some readings before FPD detects the attempt
or the user deactivates FPD for a website. FPD provides an additional safety net for fingerprinters
trying to nullify the little lies. FPD also provides a report page that can educate users about the
APIs misused for fingerprinting. We developed code for crawling websites and detecting APIs often blocked
by uBlock Origin with the goal of gradually improving heuristics. We do not have an automatic
generation of heuristics, and manual oversight is needed.

The badge icon does not show level ID anymore. It shows the number of wrapping groups accessed by the current page as a number; the colour informs the user about the likelihood that the current page tries to fingerprint the user. The user can see more details about the activated wrappers and FPD findings in the popup window.

JShelter depends on [NSCL](https://github.com/hackademix/nscl/) (developed outside JSR project) that provides reliable
cross-browser support to inject scripts before page scripts can access original APIs. That solved
several long-standing bugs and allowed the extension to be used with confidence. However, NSCL does
not implement reliable code injections into WebWorkers, so we apply Strict WebWorker protection by
default. The protection disables WebWorkers and replaces them with a polyfill.

### Issues

During the final stages of the NGI0 PET Fund project JSR project, we investigated the consistency of the
mechanisms and their real-world deployment. We closed [6 issues on Pagure](https://pagure.io/JShelter/webextension/issues?status=Closed&milestone=NLNet+evaluation) and [13 issues on Github](https://github.com/polcak/jsrestrictor/issues?q=is%3Aissue+label%3A%22NLNet+project+evaluation+phase%22+is%3Aclosed).

5 investigated issues remain open on [Github](https://github.com/polcak/jsrestrictor/issues?q=is%3Aissue+label%3A%22NLNet+project+evaluation+phase%22+is%3Aopen). For three we need more details or cannot reproduce the issue, two refer to bugs that we are trying to fix (the issues were delegated to other JShelter developer outside the JSR project).

We opened [8 issues](https://pagure.io/JShelter/webextension/issues?status=Open&tags=enhancement&milestone=NLNet+evaluation&close_status=) that cover possible enhancement of the JShelter, future directions, and possible ideas for future projects. We have additional [5 opened issues on Pagure](https://pagure.io/JShelter/webextension/issues?status=Open&milestone=NLNet+evaluation&close_status=) that we investigated during the evaluation phase. [One](https://pagure.io/JShelter/webextension/issue/55) is a duplicate of the issue opened at Github, [another](https://pagure.io/JShelter/webextension/issue/37) is almost closed. We are working on all 5 issues outside the JSR project.

### Conclusion

JShelter is not perfect, but we believe that we are heading in the right direction. We want to
continue to work on this project. However, be patient with some issues that need time and a lot of
work to be solved. The JSR project and the [parallel NGI0 PET Fund project](https://nlnet.nl/project/JShelter/) transformed the original JavaScript Restrictor extension to JShelter, suitable for everyday protection.

If you have not noticed yet, we created a [FAQ section](/faq/) and the page describing [JShelter
threat model](/threatmodel/) during the final stages of the JSR project.
