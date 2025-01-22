Title: Frequently Asked Questions

[TOC]

### Project information

#### How can I get active and participate?

Start using JShelter and tell your friends. You can fill an issue on our
[bug tracker](https://pagure.io/JShelter/webextension/issues)
([alternative](https://github.com/polcak/jsrestrictor/issues)) or pick up an
issue and start working on JShelter. You can track the development in our
[repository](https://pagure.io/JShelter/webextension)
([alternative](https://github.com/polcak/jsrestrictor)). Please let us know
before you start implementing, preferably directly in the issue. You can
contact us by [e-mail](mailto:jshelter@gnu.org) to privately report issues or
if you do not have a forge account. Join our
[mailing list](https://lists.nongnu.org/archive/html/js-shield/) to follow
updates and join in our discussions.

#### Can I translate the extension to a new language?

Yes. Please see [instructions](/i18n/), go to
[Weblate](https://hosted.weblate.org/projects/jshelter/), or translate the
extension in the JSON files. If you want to start translating a new language,
let us know. For example, you can open an issue in the
[issue tracker](https://pagure.io/JShelter/webextension/issues) or send us
[e-mail](mailto:jshelter@gnu.org). If you are in doubt about how to translate a
string or do not understand its meaning, let us know in an
[issue](https://pagure.io/JShelter/webextension/issues) or send us
[e-mail](mailto:jshelter@gnu.org).

#### What is the current JShelter status? Is it ready, or is it still a work in progress?

We think that JShelter is ready to be used for everyday browsing. We believe that JShelter
in the current state fulfills the goal of giving you control over your browser and the APIs available for the web page.

We believe that the `Recommended` level changes your fingerprint, so typical fingerprinting scripts will fail to correlate your cross-origin activities and activities on the same origin during
different browser sessions. See the [threat model](/threatmodel/), the questions in the [browser
fingerprinting section](#browser-fingerprinting), and [the section on interaction with other
tools](#interactions-between-jshelter-and-other-similar-tools) for possible caveats.

Test your browser on common fingerprinting testers. Then, use the `Strict` level
and test again to see that it considerably lowers the information about your computer:

* [EFF Cover your tracks](https://coveryourtracks.eff.org/)
* [Am I unique?](https://amiunique.org/)
* [Audio and font fingerprinting](https://audiofingerprint.openwpm.com/)
* [Device info](https://www.deviceinfo.me/)
* [Bromite](https://www.bromite.org/detect)
* [Browser leaks](https://browserleaks.com/)
* [JShelter test page](https://polcak.github.io/jsrestrictor/test/test.html)

At the same time, we are aware of several JShelter
[bugs and issues](https://pagure.io/JShelter/webextension/issues/).
We are working on making JShelter bug-free. We do not want to break benign
pages. Fixing some issues takes time. Other issues need balancing between several options. JShelter is meant to be used with (ad)blockers like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin). Using a blocker will make your online
activities considerably safer. At the same time, it will make JShelter break fewer sites.

Right now, JShelter will need more interaction from you than we would prefer. Some
protection needs improvements. Some functionality needs to be included. When we achieve the state of fixing
the bugs and making JShelter easy to manage, we will release version 1.0. If you are unwilling to
tweak JShelter occasionally, consider returning once we release version 1.0. Otherwise, try
[other options](/fingerprinting/).

#### What is the best source of information about JShelter?

The best sources for JShelter information can be found on
[our website](https://jshelter.org/) and our
[paper](https://arxiv.org/abs/2204.01392).

#### What is the threat model?

We created a [dedicated page describing the threat model](/threatmodel/) of JShelter.
You should read the page before you install the extension. Make sure that JShelter aligns with the threats you see on the web.

### JShelter broke a page, what should I do?

This happens from time to time. We want to eliminate such pages, but [JShelter is not there yet](#what-is-the-current-jshelter-status-is-it-ready-or-is-it-still-a-work-in-progress).

Your page might be broken because [Network Boundary Shield](/nbs/) (NBS) or [fingerprint
Detector](/fpd/) (FPD) detected a problem. You should have seen a notification in such cases unless
you turned notifications off. We do not recommend turning notifications off (see [the questions on notifications](#why-do-i-see-so-many-notifications-from-jshelter)). Whenever NBS or FPD detect
a possible problem on the site, it is up to you to decide if you believe the owner of the visited page or are tempted
to view the content so much that you turn the protection off.

##### Fingerprint Detector (FPD)

If you see a notification like:

![Fingerprint Detector notification]({attach}/images/fpdetection/notifications.png)

In this case, FPD evaluated that the page tries to fingerprint you. FPD can be optionally configured
to prevent uploading the fingerprint to the server. In that case, FPD blocks all further requests of
the visited page and removes the storages available to the page. Some web pages employ browser
fingerprinting for security purposes. You might want to allow the page to fingerprint
you in such a case. Open the popup by clicking on the JShelter logo badge icon and turn off the FPD for
the visited site.

![Turn FPD off](/images/faq/fpd_off.png)

The depicted setting will turn FPD off for all pages of the visited origin. If you want to disable FPD for
all pages, change the `Global settings`.

##### Network Boundary Shield (NBS)

If you see a notification like:

![JShelter blocks the scan]({attach}/images/portscan-2_request_blocked.png)

Then, it was NBS that blocked some requests. Rarely can some pages be broken because they require interaction between the public Internet and the local network. For example, the Network Boundary Shield might break some intranet information systems. JShelter users also reported an increased number of false positives when using DNS-based filtering programs. If you use one, make sure that DNS returns 0.0.0.0 for the blocked domains.

![Turn NBS off](/images/faq/nbs_off.png)

The depicted setting will turn NBS off for all pages of the visited origin. If you want to disable NBS for
all pages, change the `Global settings`.

##### JavaScript Shield (JSS)

If you have not seen any notifications (and didn't disable notifications manually), it is JavaScript
Shield (JSS) that might have broken the page. See questions on [broken videos](#how-can-i-fix-videos-if-they-fail-to-play-or-retrieve-data-in-time) and [web workers](#i-want-to-use-a-website-that-uses-web-workers-but-it-is-broken-how-can-i-fix-the-site) for specific JSS tweaks that might solve your problem.

In other cases, depending on your courage, try:

###### Disable JSS for this domain

You can disable JSS for all pages on the visited domain by turning JSS off:

![Turn JSS off](/images/faq/jss_off.png)

###### Disable JSS for this domain

Advanced users can change JSS level:

1. Spoofing API call results takes some resources. If you see that the page does not try to fingerprint you, you might want to disable all fingerprinting protection.
2. Click the `Modify` button next to the JavaScript Shield label.
3. Select `Turn fingerprinting protection off level`. This will keep security-related [wrappers](#what-is-a-wrapper), but all fingerprinting protection will be disabled.

![Turn JSS fingerprinting protection off](/images/faq/jss_low.png)

You can create your own JSS protection levels on the `Global settings` page.

###### Tweak JSS for this domain

Sometimes you will want to tweak JSS a little bit. For example, you generally do not need audio. Still, you might want to make a call on some pages. Or, you generally do not want to reveal your location, but you
want to use a map page to navigate. Occasionally, a JSS can modify an API in a way that breaks a page.
In that case, you might want to tweak your protection level.

1. Click the `Modify` button next to the JavaScript Shield label.
2. Click the `Detail tweaks of JS Shield for this site` button.

![Go to tweaking JSS mode](/images/faq/jss_tweak_start.png)

The JSS section will expand. The applied protection groups are sorted depending on the number of calls of
each API group. Typically, you will want to tweak the settings of one of the groups with the most
calls. See the highlighted column:

![Tweaking JSS mode](/images/faq/jss_tweak_sorting.png)

1. Before you tweak any wrapping group, see the description.
2. Tweak the protection according to your needs.

![Tweaking JSS mode](/images/faq/jss_tweaking.png)


#### How can I fix videos if they fail to play or retrieve data in time?

JShelter reimplements more than 100 JavaScript APIs. However, pages can use several ways to access the
same API. Unfortunately, browsers do not allow patching every possibility consistently through a simple call. Web Workers are one of the possibilities to access the APIs (see further [threats](#what-are-web-workers-and-what-are-the-threats-that-i-face)). Our ultimate goal is to patch APIs consistently. However, patching Web Worker is tricky, and we have yet to find a way to patch Workers seamlessly. Our ultimate goal was to replace Workers with synchronous code. However, so far, we offer only policies that either disable Workers or make them inoperable.

We are [working](https://pagure.io/JShelter/webextension/issue/43) on [improvements](https://pagure.io/JShelter/webextension/issue/80). Currently, we patch Web Workers in the `Recommended` level (`Remove` policy). Nevertheless, the method breaks Web Workers, and they cannot be used for benign purposes. The page also cannot detect breakage to limit the fingerprintability of the browsers.

JShelter users reported that video streaming servers are often affected. We encountered pages that
detect the presence of Web Worker support in browsers and provide polyfills if they do not detect
Web Worker support. The `Remove` WebWorker policy is ideal for such servers. The page can easily
detect missing Web Worker support. Suppose a page provides its own alternatives like polyfills. The alternatives do
not have the powers of Web Workers, so you can make the page work at the cost of increased
fingerprintability. Use FPD to evaluate that threat.

If you believe the server
operator and their partners not to misuse Web Workers to access original APIs and [other ways](#what-are-web-workers-and-what-are-the-threats-that-i-face), or if you
do not mind, change the `WebWorker` policy from `Remove` to `Low` (in Chrome) or deactivate it completely
([in Firefox](https://pagure.io/JShelter/webextension/issue/80)). Videos and other functionality
requiring Web Workers should
work. To change the policy, follow these steps:

1. Navigate to a page with a video you want to watch.
1. Click on the JShelter badge icon (typically in the toolbar next to your navigation bar; if you cannot locate
   the icon, see [this question](#can-i-see-a-jshelter-badge-icon-next-to-my-navigation-bar-i-want-to-interact-with-the-extension-easily-and-avoid-going-through-settings)).
1. Click on the `Modify` button.
1. Click on the `Detail tweaks of JS shield for this site` button.
1. Click and drag the `WebWorker` slider to the left until `Remove` is replaced
   by the `Low` value (Chromium-based browser) or `Unprotected` (Firefox).
1. Click on the `Refresh page` button at the top.
1. Watch the video.

#### I want to use a website that uses Web Workers, but it is broken. How can I fix the site?

First, see the explanation of [Web Workers](#what-are-web-workers-and-what-are-the-threats-that-i-face).

See the [answer to the video question](#how-can-i-fix-videos-if-they-fail-to-play-or-retrieve-data-in-time).

If you find a website that needs WebWorker protection set to `Strict` and does not work with `Remove` or vice-versa, please let us know in the [issue tracker](https://pagure.io/JShelter/webextension/issues) or send us
[e-mail](mailto:jshelter@gnu.org).

### User interface issues

#### Can I see a JShelter (badge) icon next to my navigation bar? I want to interact with the extension easily and avoid going through settings.

JShelter has a badge icon in the toolbar that allows you to open the popup. However, browsers tend
to hide the icon. If you cannot see a JShelter icon to the right of the bar where you enter URLs.
Try to:

1. Click on the extension icon (typically looks like a puzzle tile).
2. Pin JShelter to the toolbar.

The figure below shows how to accomplish these two steps in Firefox and a Chromium-based browser.

![Pin JShelter to Firefox toolbar]({attach}/images/faq/firefox_pintoolbar.png)
![Pin JShelter to a Chromium-based browser toolbar]({attach}/images/faq/chromium_pintoolbar.png)

#### A site opened a popup window, I want to tweak settings for that window, but I do not see a badge JShelter icon there. How can I tweak JShelter settings?

If you are using Firefox:

1. Open `about:config`, click to `Accept the Risk and Continue`,
1. set `browser.link.open_newwindow` to `3`,
1. set `browser.link.open_newwindow.restriction` to `0`.

This will force all popup windows to open in a new tab, meaning the JShelter settings could be adjusted easily everywhere.

#### Why do I see so many notifications from JShelter?

Generally speaking, you should see only a few notifications by JShelter. The default settings are
tailored to give the user critical information about JShelter behavior and its possible changes to
the page's ability to make network requests that often break the page's behavior.

We suggest installing a tracker blocker like uBlock Origin. The blocker will eliminate the most
common security and privacy threats.

Also, see [the question on NBS notifications](#i-am-seeing-too-many-nbs-notifications).

##### I am seeing too many NBS notifications

NBS protects from attacks that occur very rarely. JShelter users often complain about too many
notifications when they employ DNS-based blocking. DNS-blocking resolver resolves predefined domains
to a fake IP address, usually `0.0.0.0` or `127.0.0.1` (IPv4) and `::` or `::1` (IPv6). If your
DNS-blocking resolver returns `127.0.0.1` and `::1`. Please reconfigure the resolver to return `0.0.0.0` or `::`.

1. Depending on your OS, you will consume fewer resources. For example, Windows machines do not create any TCP stream when a website connects to `0.0.0.0` or `::`, but it creates a TCP stream to `127.0.0.1` and `::1`. Hence, a remote web page can access a web server if it is running on the local machine. Note that Linux hosts try to establish a connection to a localhost port on all these addresses.
2. If your DNS-based filtering returns `0.0.0.0` or `::`, it will give JShelter a report on the
	 intentions. If it returns `127.0.0.1` or `::1`, JShelter has no way to differentiate between such
	 DNS blocker and an attack like the one in the [blog](/localportscanning/).

### Browser fingerprinting

#### What is the little lies approach to protect from fingerprinters?

Please see [the blog post](/farbling/).

#### What is the difference between the little lies and white lies approach to protect from fingerprinters and farbling?

None. All refer to the same technique [that is explained in another question](#what-is-the-little-lies-approach-to-protect-from-fingerprinters).

#### What JShelter configuration should I pick?

First, see our [blog post](/fingerprinting/). Consult also other [blog posts](/blog/) and other
questions in this FAQ.

1. If you want to have the same fingerprint as many users, We suggest going for Tor Browser (do not install JShelter in Tor Browser).
1. If you want to make cross-site fingerprinting linkage hard, go for the `Recommended` JShelter level. If you want better protection for the real data at the cost of having the same fingerprint on different sites, go for the `Strict` JShelter level.
1. Keep NBS active.
1. If you want to detect and prevent fingerprinting attempts, use FPD.

#### Should I create my own level for JavaScript Shield?

The problem with browser fingerprinting is that the more you change your configuration, the more
unique you fingerprint can be. Hence, we suggest that you do not tweak built-in levels at all, or do
it only when needed to tweak the configuration for a specific site.

#### I changed my configuration. What should I expect after future updates of the extension, will I lose the settings?

We change the configuration so that updates keep the user settings from previous version. So far, we
managed to transfer almost all configuration with an exception of a [bug](/versions/#0113). We plan
to continue this practise so if you configure something now, it should work also in the future.

Nevertheless, from time to time, we modify new APIs. Typically, we insert a simple logic to the
update that tries to estimate your preference. Keep in mind that it is just an estimation. If you
modify a built-in level a little bit, the estimation would likely be OK. If you design a level that
should modify only a fraction of APIs, it is likely that the update process would add additional
protection to that level in the future.

We do not guarantee backwards compatibility. Typically, the configuration should work. Big changes
in configuration format appear in [update information](/versions/).

In summary, read [update information](/versions/). Additionally, you should check your configuration from time to time. The frequency should depend on the changes that you make. The more your configuration differs from the built-in configuration, the more frequently you should validate your configuration.

#### I have a unique fingerprint? Some properties wrapped by JShelter return random values.

First, see our [blog post](/fingerprinting/).

JShelter indeed modifies some properties like WebGL strings (`renderer`, `vendor`) to random
strings in the `Recommended` level. JShelter also does not modify random identifiers of microphones and
cameras. All these properties contain random strings that uniquely identify your browser session.

JShelter provides different lies on different domains, so cross-domain linking is hard.
But remember that a single domain can link all your activities during a browser session.
If you do not want JShelter to generate the random strings, use `Strict` protection (but see [other FAQ entries](#browser-fingerprinting)).

We are [considering](https://pagure.io/JShelter/webextension/issue/68) adding better control for the little lies approach.

We are also [considering](https://pagure.io/JShelter/webextension/issue/69) replacing the random strings of the Web GL API with real-world strings. However, we do not have such a database. We are also worried about creating inconsistencies if we apply invalid combinations of real-world strings. As creating the real-world database would take a lot of time, and a dedicated fingerprinter might reveal the inconsistencies anyway, we do not actively work on the issue.

#### Is browser fingerprinting a real threat?

More than 100 advertisement companies reveal in the [adtech transparency a consent
framework](https://www.fit.vutbr.cz/~polcak/tcf/tcf2.html) that they actually actively scan device
characteristics for identification: devices can be identified based on a scan of the device's unique
combination of characteristics. Vendors can create an identifier using data collected via actively
scanning a device for specific characteristics, e.g., installed fonts or screen resolution, use such
an identifier to re-identify a device.

![TCF participants actively scanning devices to create a fingerprint](https://www.fit.vutbr.cz/~polcak/tcf/graphs/v2sf2.svg)

See papers like [Browser Fingerprinting: A survey](https://arxiv.org/pdf/1905.01051.pdf), [Fingerprinting the Fingerprinters](https://uiowa-irl.github.io/FP-Inspector/) or [The Elephant in the Background](https://fpmon.github.io/fingerprinting-monitor/files/FPMON.pdf).

#### Does FPD collect a list of pages/origins that fingerprinted me?

No, FPD does not store any information. Each page load starts a new detection that is not dependent
on previous interactions between the browser and the site.

#### When FPD detects that an origin tried to fingerprint me, does it mean that the extension will apply stronger protection like switching to the `Strict` JSS level or applying the blocking of HTTP requests initiated by the domain?

No.

First of all, the `Strict` JSS level does not mean stronger protection from fingerprinting. In fact, it makes your
fingerprint stable. We do not recommend using `Strict` level as an anti-fingerprinting mechanism.

Secondly, fingerprinting is quite common on login pages. If one page fingerprints you, it does
not mean that all pages are going to fingerprint you.

Thirdly, the fingerprinting script may be loaded into the page irregularly. We want to prevent blocking the site when no fingerprinting is detected.

If you want to switch to a different level for the website, you can do so manually. We do not
recommend such action.

#### My bank (or another trusted site) fingerprinted me during a login attempt. Should I worry?

Browser fingerprinting is a common part of multi-factor authentication. The provider tries to
protect your account. So you should not worry, but you might be forced to deactivate FPD for that site.
However, we suggest that you do not turn off JavaScript Shield and its anti-fingerprinting
protections.

From the European perspective, [WP29 clarified](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2014/wp224_en.pdf) (use case 7.5) that user-centric security can be viewed as strictly necessary to provide
a web service. So it seems likely that browser fingerprinting for security reasons does
trigger the ePrivacy exception, and user consent is not necessary.
Depending on the circumstances, a fingerprint can be personal data. GDPR might also apply.
GDPR lists security as a possible legitimate interest of a data controller, see
recital 49. Nevertheless, whether all fingerprinting is proportionate is an open question.

We understand that our users do not want to give information about their devices. Hence, we
suggest having JavaScript Shield active on fingerprinting sites. It is up to you if you want to
provide as little information as possible (`Strict` level), want to have a different fingerprint every
visit (`Recommended` level, keep in mind that you are providing your login, so your actions are
linkable), or you want to create your own level.

#### Do you protect against font enumeration fingerprinting?

No. We currently do not have a consistent method that spoofs fonts reliably. If you are concerned about font enumeration, you can track the relevant JShelter [issue](https://pagure.io/JShelter/webextension/issue/60).

If you are using Firefox and want your fonts hidden consistently, activate resistFingerprinting.
However, cosider [the interaction between JShelter and resistFingerprinting](#i-am-using-firefox-fingerprinting-protection-resistfingerprinting-should-i-continue-should-i-turn-firefox-fingerprinting-protection-on).

#### Does JShelter completely prevent browser fingerprinting?

No. See the [threat model](/threatmodel/). As explained there, JShelter applies reasonable
precautions but:

1. There is no clear boundary between fingerprinting and benign behavior.
1. A fingerprinter might deploy focused attacks. While we try to deploy undetectable and reasonable
   countermeasures, expect that a focused and motivated attacker will be able to detect JShelter
   users.
1. We expect that users will run FPD and JSS in parallel. As both protect from fingerprinting
   differently, they complement each other.

Also, read [the other questions in the browser fingerprinting section](#browser-fingerprinting).

### Other protections by JShelter

#### What are Web Workers, and what are the threats that I face?

In essence, Web Workers are a threat to JShelter users for two reasons:

1. They allow access to some of the modified APIs. There is no simple call that JShelter can issue
   to apply the modifications to Web Workers. So, if you do not apply WebWorker protection, you risk
   that Web Workers can remove other protections.
2. They increase the capabilities of attackers. For example, malicious actors can install long-lived
   proxies to the browser.

For more details, see [Web Worker
documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), the [explanation of using Web Workers as Man-In-The-Middle proxy](https://betterprogramming.pub/man-in-the-middle-attacks-via-javascript-service-workers-52647ac929a2), papers like [Assessing the threat of web worker distributed attacks](https://www.researchgate.net/publication/313953354_Assessing_the_threat_of_web_worker_distributed_attacks), and other [works](http://www.diva-portal.se/smash/get/diva2:1218197/FULLTEXT01.pdf).

#### What is Network Boundary Shield (NBS)?

Your browser can be instructed by the creators of the visited page (or malicious actors that
successfully inserted their code into the visited page) to act as an intermediary device that
creates connections to other devices in the network. NBS detects and prevents such attacks, see its
[dedicated page](/nbs/) and our [blog post](/localportscanning/) for more information.

#### My device has a lot of sensors. Are these accessible by web pages? Does JShelter help me?

Depending on your browser and your settings, web pages can read sensors leading to various attacks
that include revealing hidden information, and fingerprinting. JShelter [deals with
sensors](/sensorapi/).

#### Does JShelter help me against attacks exploiting hardware faults?

Yes, JShelter modifies all timestamps, which limits the precision of time measurements. JShelter
rounds the timestamps and adds random number of milliseconds to the rounded value, preserving the
monotony of the timestamps. The modifications also remove the possibility of [detecting clock
skew](https://www.jucs.org/jucs_21_9/clock_skew_based_computer/jucs_21_09_1210_1233_polcak.pdf)
of your device quickly. See [our paper](#what-is-the-proper-way-to-cite-jshelter-in-a-paper) for
more details.

#### Does JShelter protect my IP address?

No, and it never will. You need to find a VPN, Tor, or a similar technique to hide your IP address.

#### Does JShelter replace a tracker blocker?

No, many extensions specialize in list-based tracking. We consider list-based
tracking out-of-scope of the JShelter mission. You should keep using a tracker blocker like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin) in parallel with JShelter.

#### Does JShelter modify identifiers in cookies, web storage or other tracking IDs?

Not directly. Use other tools to block such trackers. Firefox's built-in protection mechanisms and tracker blockers are excellent tools that complement JShelter well.

Nevertheless, some IDs might be derived based on fingerprinting scripts. In that case, JShelter
will modify such ID, and depending on the implementation and your JShelter settings, your identity
might change for each visited origin and each session.

### Interactions between JShelter and other similar tools

#### What other extension do you recommend to run along JShelter?

We consider a tracker blocker like [uBlock Origin](https://github.com/gorhill/uBlock#ublock-origin)
as a must. It will make your browsing faster, make your pages clean, and improve your privacy.
Nevertheless, it is easy to evade blockers. The malicious web server needs to change the URL of the
script. JShelter developers encountered several malicious scripts that evaded common lists. Hence,
blocklist-based filtering is beneficial as a first-line defense. However, blockers are not enough
as niche cases evade the blockers.

Web extensions like [NoScript Security Suite](https://noscript.net/) or
[uMatrix](https://github.com/gorhill/uMatrix) allow users to block JavaScript or other content,
either completely or per domain. However, the user needs to evaluate which domains to allow scripts.
[HTTP Archive reports](https://httparchive.org/reports/page-weight?start=earliest&end=latest&view=list#reqJs)
that an average page includes (at the time of writing this text) 22 external requests (21 requests for
mobile devices). Many pages depend on JavaScript. Users must select what content to trust. A typical
page contains resources from many external sources, so such a user requires excellent knowledge.
Moreover, malicious code may be only a part of a resource; the rest of the resource can be
necessary for correct page functionality. We believe that web extensions like NoScript Security
Suite and uMatrix origin are good but do not protect the user from accidentally allowing malicious
code. The NoScript Suite main developer is a part of the JShelter team, and JShelter shares a lot of
code with NoScript.

We suggest that you use other extensions like [Cookie
AutoDelete](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete),
[Decentraleyes](https://decentraleyes.org), [ClearURLs](https://docs.clearurls.xyz). All these
extensions are important in making your browser leak as little data as possible, and all
these protections are out-of-scope of JShelter.

Also consider that [web extensions cannot hide your IP address](#does-jshelter-protect-my-ip-address).

#### I already have a blocking extension installed. Do I need JShelter?

Blocking extensions are typically based on a list of commonly known malicious URLs. Hence, someone
needs to discover such a URL first. Some malicious URLs are never added to blocking lists because they were not discovered. Others might be
added to a small or specialized list only. JShelter protects you from some threats
not yet added to the lists.

Some login pages fingerprint you during the login process. But you might want to keep your
specific device configuration private from such a page. JShelter can limit (`Strict` level) or fake
(`Recommended` level) information commonly used for browser fingerprinting.

#### I am using Firefox Fingerprinting Protection (resistFingerprinting). Should I continue? Should I turn Firefox Fingerprinting Protection on?

Mozilla is working on integrating fingerprinting resisting techniques [from
Torbrowser](https://bugzilla.mozilla.org/show_bug.cgi?id=1329996) to Firefox (Firefox Fingerprinting
Protection, also known as resist fingerprinting). However, the work is not done. Firefox
Fingerprinting Protection tries to confuse simple fingerprinters with random data. Sophisticated fingerprinters will create a [homogeneous fingerprint](/fingerprinting/). It is a research
question if the homogeneous fingerprint strategy makes sense before it is adopted by all users.

Moreover, inconsistencies arise. For example, Torbrowser does not implement WebGL. As Firefox adopts
fingerprinting protections from Torbrowser, Firefox modifies readings from 2D canvas and does not
modify WebGL canvas. That creates a false sense of protection. JShelter modifies 2D and WebGL canvas
consistently.

Firefox Fingerprinting Protection may be useful for cases like having an ordinary laptop with default
settings that changes IP addresses a lot. But if you like to have the same fingerprint as many other
users, we suggest that you use Tor Browser.

You cannot tweak Firefox Fingerprinting Protection. You must activate all or nothing. JShelter
provides options to modify behavior per domain.

#### Should I install JShelter if I am using Brave browser?

Many JShelter protections come from Brave. While JShelter offers some additional protections, the
key parts are shared with Brave. You should not use JavaScript Shield, or you should tweak its levels to remove duplicates. You
should use the Network Boundary Shield and Fingerprint Detector. While we keep a close eye on Brave
protection, we do not offer any protection specifically tailored for Brave. If you have one, please
let us know.

#### I am using some other anti-fingerprinting extension. Should I continue? Should I combine such extensions?

You should consider (at least) the following. But first, see our blog
post on [fingerprinting](/fingerprinting/).

JSS modifies your fingerprint while FPD detects or prevents (if allowed) fingerprinting. If you
combine more approaches to modify the fingerprint, the results are not predictable.
All extensions might modify the same or similar data, or they might modify different APIs.
If you use multiple approaches that focus on different APIs, you
might be less fingerprintable. However, you might as well use a unique combination and be easily
fingerprintable by a focused or advanced fingerprinter.

Let us see an example. Suppose that you install an extension A that modifies the content of the
canvas element. As JShelter modifies only data during reading from canvas, it will apply its
countermeasures after the countermeasures of A. In `Strict` level, it will override all
modifications by A. The little lies approach would slightly modify the modifications of A. That would
likely be pointless or even counterproductive.

Now, consider another extension B that modifies the read data as well. Both extensions try to change the same APIs, which likely creates a race condition on which defense mechanism wins. If it is indeed the race condition, you may be fingerprintable better as the one who uses both B and JShelter or less because the fingerprinter sees different fingerprints. Which one is correct depends on how smart and focused the fingerprinter is.

Jshelter tries to apply consistent modifications. However, if B modifies only a subset of APIs that
JShelter modifies, and an advanced fingerprinter can misuse that information to improve the fingerprint.

If you use more approaches similar to FPD, they will likely not interact badly with each other.

You can tweak JShelter to apply only some protections. For example, by creating your own JSS levels.
You can also use the "Turn fingerprinting protection off" built-in level to keep the
non-fingerprinting countermeasures. You can also turn JSS off and benefit from FPD and NBS.

JShelter includes advanced techniques through [NSCL](https://noscript.net/commons-library) to inject
API [wrappers](#what-is-a-wrapper) in time and reliably. Other extensions might not apply their protection reliably. See
also [the question](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027) on [Firefox bug 1267027](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027).

Most other tools focus on [homogeneous fingerprints](/fingerprinting/). By running the `Recommended`
JShelter JSS level, you will modify the fingerprint and create a very small group, likely consisting
only of you. Nevertheless, some fingerprinters can be confused even in that case, so you might be less identifiable
by such dumb fingerprinters.

Suppose a dumb fingerprinter that creates a single number by combining all fingerprintable data. As
JShelter modifies the APIs differently in each session and on each domain. There is no point in
installing other fingerprint-modifying extensions.

Suppose a more clever fingerprinter that somehow analyses the fingerprintable data. It might detect
that you use JShelter or a similar approach. However, it is possible that the analysis fails in case
of unexpected behavior of multiple extensions, so multiple extensions might help you confuse the fingerprinter.

An even more clever fingerprinter can focus on unique traits of your extensions (that modify the
page, including page decorators or extensions that include buttons to the page, like downloaders or
password managers. As the JShelter's [threat model](/threatmodel/) does not protect from such
fingerprinters, you will be better off if you do not let JShelter modify the fingerprint.

#### I saw several extensions that claim that it is not possible to modify the JavaScript environment reliably. Are you aware of the [Firefox bug 1267027](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027)

Yes, we are aware of the issues concerning reliable script injections before page scripts can
permanently access original API calls. In fact, JShelter (then JavaScript Restrictor)
[suffered from the bug](https://github.com/polcak/jsrestrictor/issues/25) for several versions.
JShelter integrates [NSCL](https://noscript.net/commons-library) that allows JShelter to insert its
scripts reliably before page scripts start running. Hence, the APIs are guaranteed to be
protected. NSCL provides a cross-browser layer that aims at modifying all ways to obtain API functions
like iframes, pages protected by CSP, and others. See our
[paper](https://arxiv.org/pdf/1905.01051.pdf) for more details on the integration of NSCL to JShelter.

#### How does NBS interact with proxies? Do my DNS requests leak through NBS?

If you are using a proxy, the attacks, which the NBS tries to prevent, go through the proxy to the local network of the
proxy (but keep in mind that this might not be true for more complex configurations).

NBS in Chromium-based browsers works the same way as it would work without the proxy. NBS
protects the local network of the proxy in that case. Depending on the deployment and exact
configuration, it may also protect your local network.

NBS in Firefox employs the DNS API that initiates DNS requests. Contextual identities allow users
to go through a proxy in some tabs and not in others. We decided not to perform DNS resolution in
NBS for proxied
requests. See <a href="https://pagure.io/JShelter/webextension/issue/41">issue 41</a> and <a
href="https://pagure.io/JShelter/webextension/issue/85">issue 85</a> for more details. We might
decide to reimplement NBS in Firefox similarly to the Chromium version in the future for proxied requests.
Another possible option, we might consider in the future, is adding a configuration option to
allow users to opt-in to perform DNS resolution in NBS, which would be useful for users running
an HTTP proxy in their local network.
If you have good arguments for changing the behavior, please share them with us.

### Limitations of supported browsers

#### Why does JShelter/NSCL initiate web requests to ff00::?

First, see [question on reliable JavaScript environment modifications](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027).

NSCL needs a synchronous way to transfer data between different scripts of the extension. Web
Extension APIs only allow asynchronous communication. But do not worry. The request is canceled in
the [code](https://github.com/hackademix/nscl/blob/40e765f0d66a10b25a27a375bc62ea141a73734f/common/SyncMessage.js#L106).

Additionally [ff00::]

* is a [reserved multicast IPV6 address](https://www.iana.org/assignments/ipv6-multicast-addresses/ipv6-multicast-addresses.xhtml#ipv6-scope),
* hence, it is not a valid HTTP endpoint (if you try to navigate http://[ff00::] the browser will always tell you that the resource is unreachable),
* the [SyncMessage back-end cancels the webRequest](https://github.com/hackademix/nscl/blob/40e765f0d66a10b25a27a375bc62ea141a73734f/common/SyncMessage.js#L106).

Some tools can see such a request, but it will never leave your browser.

#### Does NBS work the same way in Firefox and Chromium-based browsers?

No. Firefox allows webextensions to perform DNS resolution of the domain name that the browser is
about to get information from. The resolution of the DNS name to an IP address is crucial for
FPD. As Firefox allows to perform the resolution before any request leaves the browser, JShelter can
prevent each attempt to cross the network boundary.

Chromium-based browsers do not offer the DNS resolution APIs. JShelter collects resolution results in
a cache that is filled during the processing of each request (after the browser makes the request).
That means that the first request for each domain name goes through. JShleter blocks all subsequent
requests only.

Keep in mind that an adversary can change the domain with each request. For example, the attacker
can use a.attacker.com, b.a.attacker.com, c.b.a.attacker.com in sequence for its requests to go
through. So it is easy for an attacker to bypass NBS. In practice, we know about attackers that do
not change domain names (for example, see [our blog](/localportscanning/)). So we keep the NBS in
Chromium-based browsers, even though it is not perfect.

#### Do you support Firefox for Android?

We tested JShelter in Firefox for Android in the past and it worked as expected. We do not test
JShelter in Firefox for Android regularly but a volunteer that tracks the status of JShelter in
Firefox for Android is welcomed.

##### I cannot see JShelter listed in the addons supported by Firefox for Android.

For whatever reason, Mozilla decided to only present [a small number of curated extensions](https://support.mozilla.org/en-US/kb/find-and-install-add-ons-firefox-android) in their mobile application by default. There are some great extensions there like uBlock Origin, NoScript, and DarkReader, but JShelter was not one of them.

You should be able to workaround the limitations by creating a [collection with JShelter](https://www.androidpolice.com/install-add-on-extension-mozilla-firefox-android/).

A change in the policy of the default extensions listed by Addons Mozilla.org is out of our control.

### Other questions

#### What is a wrapper?

Wrapper is typically a small block of code that JShelter attach to some of the APIs offered by the
browser. These code typically reads the original value to modify that before returning to the
caller. Page scripts cannot side-step the wrappers to get direct access to the original API.
Nevertheless, see the [question on reliable JavaScript environment modifications](#i-saw-several-extensions-that-claim-that-it-is-not-possible-to-modify-the-javascript-environment-reliably-are-you-aware-of-the-firefox-bug-1267027).

#### What is WebAssembly speed-up?

In 2023, we improved the speed of some code inside JShelter. Some of the
[wrappers](#what-is-a-wrapper) were reimplemented in WebAssembly with the focus on providing the
same results as the original JavaScript-only wrappers.

Unless hit by Chrome-bug that
prevents injecting WebAssembly wrappers to some pages, WebAssembly wrappers are enabled by default.
We suggest that you keep WebAssembly wrappers activated. However, you can turn off WebAssembly
speed-up and return to JavaScript-only wrappers.

#### I am a web developer, can JShelter help me?

Possibly yes.

First of all, you can use [FPD and its reports](/fpd/) to learn the APIs that your page calls. Of
course, FPD focuses on APIs that are often misused during browser fingerprinting, so that you learn
only some APIs.

You can create JSS levels that remove some functionality like geolocation, workers, or access to
sensor API to test that your page handles such browsers.

#### I am a data protection officer or I work for a data protection agency. Can JShelter help me?

Yes. Change JShelter configuration to passive mode:

1. *Turn JavaScript Shield off*,
2. disable blocking behaviour of [NBS](/nbs/) but keep the notifications,
3. set [FPD](/fpd/) to passive, keep the notifications on, and depending on your use case, set the
   detection mode to *default* or *strict*.

Compare the information provided by NBS and FPD in notifications and [FPD report](/fpd/) to the
information in the privacy policy of the tested website.

[Let us know](mailto:jshelter@gnu.org) about any question or experience.

#### What is the proper way to cite JShelter in a paper?

Please cite *POLČÁK Libor, SALOŇ Marek, MAONE Giorgio, HRANICKÝ Radek and McMAHON Michael. JShelter: Give Me My Browser Back. In: Proceedings of the 20th International Conference on Security and Cryptography. Rome: SciTePress - Science and Technology Publications, 2023, pp. 287-294. ISBN 978-989-758-666-8.*

```
@INPROCEEDINGS{JShelter,
   author = "Libor Pol\v{c}\'{a}k and Marek Salo\v{n} and Giorgio Maone and Radek Hranick\'{y} and Michael McMahon",
   title = "JShelter: Give Me My Browser Back",
   pages = "287--294",
   booktitle = "Proceedings of the 20th International Conference on Security and Cryptography",
   year = 2023,
   location = "Rome, IT",
   publisher = "SciTePress - Science and Technology Publications",
   ISBN = "978-989-758-666-8",
   doi = "10.5220/0011965600003555",
   language = "english",
   url = "https://www.fit.vut.cz/research/publication/12716"
}
```

That paper has an extended version at [ArXiv paper](https://arxiv.org/abs/2204.01392).
Please cite the published version if possible. We are working on other publications. We will update this answer
in the future.
