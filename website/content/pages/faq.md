Title: Frequently Asked Questions
Slug: faq

This page is currently under construction, please consult <a href="/blog/">blog</a>, our [paper](https://arxiv.org/abs/2204.01392) and other links on this site to get more information.

#### What is the current JShelter status? Is it ready or is it still a work in progress?

We think that JShelter is ready to be used for everyday browsing. We believe that JShelter
in the current state fulfills the goal of giving you the control over your browser and the
APIs that are available for the web page.

We believe that the Recommended level changes you fingerprint so that typical fingerprinting scripts
will fail to correlate your cross-origin activities and activities on the same origin during
different browser sessions. See the answers below for possible caveats.

Test yourself on common fingerprinting testers that the Strict level considerably lowers the
information about your computer.

At the same time, we are aware of several JShelter
[bugs and issues](https://pagure.io/JShelter/webextension/issues/).
We are working on making JShelter bug-free and we are trying not to break benign
pages. Fixing some issues takes time. Other issues need balancing between several options.
JShelter is not perfect, yet. JShelter is meant to be used with (ad)blockers like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin). Using a blocker will make your online
activities considerably safer. At the same time, it will make JShelter break less sites.

Right now, JShelter will need more interaction from your side than we would prefer. Some
protection needs improvements. Some functionality is missing. When we achieve the state of fixing
the bugs, and making JShelter easy to manage, we will release version 1.0. If you are not willing to
tweak JShelter from time to time, consider returning once we release version 1.0. Otherwise, try
other options, see the answers below.

#### What is the best source of information about JShelter?

The best sources for JShelter information can be found on
[our website](https://jshelter.org/) and our
[paper](https://arxiv.org/abs/2204.01392).

#### How can I fix videos if they fail to play?

If you change the `WebWorker` wrapper from `Strict` to `Medium`, videos should
work.  To do this, follow these steps:

1. Navigate to a page with a video that you want to watch.
1. Click on the JShelter icon.
1. Click on the `Modify` button.
1. Click on the `Detail tweaks of JS shield for this site` button.
1. Click and drag the `WebWorker` slider to the left until `Strict` is replaced
   by the `Medium` value.
1. Click on the `Refresh page` button at the top.
1. Watch the video.

#### I visited a page and it is broken because of JShelter, what should I do?

This happens from time to time. We want to eliminate such pages, but JShelter is not there, yet (see
also above).

Your page might be broken because [Network Boundary Shield](/nbs/) (NBS) or [Fingerprint
Detector](/fpd/) (FPD) detected a problem. You should have seen a notification in such cases unless
you turned notifications off. We do not recommend turning notifications off. If NBS or NPD detected
a problem, you it is up to you, if you believe the owner of the visited page or if you are tempted
to view the content so much that you turn the protection off.

![](Figure)

FIXME JavaScript Shield

#### A site opened a popup window, I want to tweak settings for that window but I do not see a badge JShelter icon there. How can I tweak JShelter settings?

If you are using Firefox:

1. Open `about:config`, click to `Accept the Risk and Continue`,
1. set `browser.link.open_newwindow` to `3`,
1. set `browser.link.open_newwindow.restriction` to `0`.

This will force all popup windows to open in a new tab, meaning the JShelter settings could be adjusted easily everywhere.

#### Does JShelter protect my IP address?

No and it never will. You need to find a VPN, Tor, or a similar technique to hide your IP address.

#### Does JShelter replace a tracker blocker?

No, there are many extensions that specialize in list-based tracking. We consider list-based
tracking out-of-scope of the JShelter mission. You should keep using a tracker blocker like [uBlock
Origin](https://github.com/gorhill/uBlock#ublock-origin) in parallel with JShelter.

#### I already have a blocking extension installed. Do I need JShelter?

Blocking extensions are typically based on a list of commonly known malicious URLs. Hence, someone
needs to discover such a URL

#### Does JShelter modifies identifiers in cookies, web storage or other tracking IDs?

Not directly, use other tools to block such trackers. Firefox built-in protection mechanisms and
tracker blockers are very good tools that complement JShelter well.

Nevertheless, some IDs might be derived based on the fingerprinting scripts, in that case, JShelter
will modify such ID and depending on the implementation and your JShelter settings, your identity
might change for each visited origin and each session.

#### What other extension do you recommend to run along JShelter?

We consider a tracker blocker like [uBlock Origin](https://github.com/gorhill/uBlock#ublock-origin)
as a must. It will make your browsing faster, make your pages more clean and improve your privacy.
Nevertheless, it is easy to evade blockers. The malicious web server needs to change the URL of the
script. JShelter developers encountered several malicious scripts that evaded common lists. Hence,
blocklists-based filtering is very useful as a first-line defence. However, blockers are not enough
as the niche cases evade the blockers.

Webextensions like [NoScript Security Suite](https://noscript.net/) or
[uMatrix](https://github.com/gorhill/uMatrix) allow users to block JavaScript or other content
either completely or per domain. However, the user needs to evaluate which domains to allow scripts.
[HTTP Archive reports](https://httparchive.org/reports/page-weight?start=earliest&end=latest&view=list#reqJs)
that an average page includes (at the time of writing this text) 22 external requests (21 requests for
mobile devices). Many pages depend on JavaScript. Users must select what content to trust. A typical
page contains resources from many external sources, so such a user requires excellent knowledge.
Moreover, a malicious code may be only a part of resources; the rest of the resource can be
necessary for correct page functionality. We believe that webextensions like NoScript Security
Suite and uMatrix Origin are good but do not protect the user from accidentally allowing malicious
code. The NoScript Suite main developer is a part of the JShelter team and JShelter shares a lot of
code with JShelter.

We suggest that you use other extensions like [Cookie
AutoDelete](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete),
[Decentraleyes](https://decentraleyes.org), [ClearURLs](https://docs.clearurls.xyz). All these
extensions perform an important step in making your browser leak as few data as possible, and all
these protections are out-of-scope of JShelter.

#### I am using Firefox Fingerprinting Protection (resistFingerprining). Should I continue? Should I turn Firefox Fingerprinting Protection on?

Mozilla is working on integrating fingerprinting resisting techniques [from
Torbrowser](https://bugzilla.mozilla.org/show_bug.cgi?id=1329996) to Firefox (Firefox Fingerprinting
Protection, also known as resist fingerprinting). However, the work is not done. Firefox
Fingerprinting Protection tries to create a [homogeneous fingerprint](/fingerprinting/) (for better
fingerptinters) and tries to confuse simple fingerprinters with random data. It is a research
question if the homogeneous fingerprint strategy makes sense before it is adopted for all users.
Moreover, inconsistencies arise. For example, Torbrowser does not implement WebGL. As Firefox adopts
fingerprinting protections from Torbrowser, Firefox modifies readings from 2D canvas and does not
modify WebGL canvas. That creates a false sense of protection. JShelter modifies 2D and WebGL canvas
consistently.

#### Should I install JShelter if I am using Brave browser?

Many JShelter protections come from Brave. While JShelter offers some additional protections, the
key parts are shared with Brave. You should not use JavaScript Shield or tweak its levels. You
should use Network Boundary Shield and Fingerprint Detector. While we keep a close eyes on Brave
protection, we do not offer any protection specifically tailored for Brave. If you have one, please,
let us know.

#### Is browser fingerpinting a real threat?

More than 100 advertisement companies reveal in the [adtech transparency a consent
framework](https://www.fit.vutbr.cz/~polcak/tcf/tcf2.html) that they actually actively scan device
characteristics for identification: devices can be identified based on a scan of the device's unique
combination of characteristics. Vendors can create an identifier using data collected via actively
scanning a device for specific characteristics, e.g. installed fonts or screen resolution, use such
an identifier to re-identify a device.

![TCF participants actively scanning devices to create a fingerprint](https://www.fit.vutbr.cz/~polcak/tcf/graphs/v2sf2.svg)

See papers like [Browser Fingerprinting: A survey](https://arxiv.org/pdf/1905.01051.pdf), [Fingerprinting the Fingerprinters](https://uiowa-irl.github.io/FP-Inspector/) or [The Elephant in the Background](https://fpmon.github.io/fingerprinting-monitor/files/FPMON.pdf).

#### My bank (or other trusted site) fingerprinted me during a login attempt. Should I worry?


#### Injection techniques. Make Giorgio's effort shine.

#### How can I get active and participate?

#### What is the proper way to cite JShelter in a paper?

For now, cite our [ArXiv paper](https://arxiv.org/abs/2204.01392), for example, by
exporting the citation on ArXiv. We are working on other publications and we will update this answer
in the future.
