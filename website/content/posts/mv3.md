Title: What is Manifest v3 and how it affects JShelter
Date: 2023-11-01 12:00
Series: Manifest v3

Over the years, privacy and security-oriented browser extensions in the same category of JShelter (e.g. uBlock or NoScript, whose code is
partially inherited by JShelter through the NoScript Commons Library),
have been forced into multiple complex refactorings and
modernizations, including complete rewrites such as those [required by
the transition from Mozilla's original flexible XUL/XPCOM technology](https://yoric.github.io/post/why-did-mozilla-remove-xul-addons/) to
the more limiting [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), largely copied from [Google Chrome's Extensions API](https://developer.chrome.com/docs/extensions/reference/).

During the past 2 years, the [Manifest V3 API](https://developer.chrome.com/docs/extensions/mv3/intro/) ("MV3" from
now on) has been aggressively pushed by Google as the successor
of the current semi-unified browser extensions APIs (known as Manifest
V2 or "MV2").

MV3 comes with renewed migration challenges, made worse by
its *incompleteness* and apparent [hostility against privacy and security 
use cases](https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening>).

Let's have a look at some threats that the MV3 specification poses to JShelter and other security and privacy-oriented extensions:

  * The new content script injection APIs are promising on paper, thanks also to [specific](https://bugs.chromium.org/p/chromium/issues/detail?id=1128112) [requests](https://bugs.chromium.org/p/chromium/issues/detail?id=1180659) for [enhancements](https://bugs.chromium.org/p/chromium/issues/detail?id=1180659#c5) [coming](https://bugs.chromium.org/p/chromium/issues/detail?id=1054624#c19) from [us](https://github.com/w3c/webextensions/issues/402), but their
    implementation is still incomplete and buggy.
  * The removal of the blocking capabilities of the `webRequest` API
    excludes any runtime [algorithmic flexibility](https://lists.nongnu.org/archive/html/js-shield/2021-02/msg00009.html) to [analyze and
    manipulate](https://bugs.chromium.org/p/chromium/issues/detail?id=896897#c23) the network traffic.
  * The new `declarativeNetRequest` API should replace the
    `webRequest` API. But it is triggered by a [limited number of basic
    URL-matching rules](https://github.com/w3c/webextensions/issues/394), which are easy to bypass for malicious actors
  * The forced switch of extensions' main logic from a persistent and
    stateful background process (MV2) to an ephemeral and stateless
    service worker (which, by MV3's design, can be killed at any time)
    hampers the ability of security extensions to promptly counter-react
    synchronous events such as the start of a page script execution and
    dramatically impacts any extension of medium complexity, now forced
    to reconstruct its state from slow asynchronous storage every time
    its service worker gets woken up by user interaction or network events.

These and other technical problems are making the transition extremely
painful to privacy and security-oriented browser extensions, and more in
general those aimed to change the browser's default behavior in
restrictive / protective directions or just give back some agency to the
users rather than prioritize the will of web authors, advertisers, and
trackers.

Further factors make any migration route even harder:

 1. *MV2 and MV3 API access is mutually exclusive*, meaning that we
    cannot pick "the best tool for the task" during the transition.
    Therefore, web developers are forced to maintain multiple versions, i.e.
    MV2-based for the general public and MV3-based for early
    adopters/testers willing to bear with bugs and missing features
    until MV3 is good enough.
 2. *MV3 is far from having any finalized shape or roadmap*, despite the
    relentless efforts to make it more viable from extensions
    developers, including myself, convening with browser vendors in
    [W3C's Web Extensions Community Group](https://www.w3.org/groups/cg/webextensions) (WECG).
 3. There's still *no stable, feature-complete and reliable MV3 API
    implementation* for moderately complex extensions to experiment with.
 4. Its actual implementations suffer from *fragmentation and countless
    incompatibilities*, for the better or the worse, across browser
    vendors adopting it, including Mozilla, Microsoft and Apple.

Notwithstanding the aforementioned critical issues, one year ago, Google
announced a bellicose [timeline to extinguish "legacy" MV2 extensions](https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/), starting
with a "soft" deprecation on the 1st of January 2023 but quickly ramping
up to enterprise-only support in June and complete extermination by the
end of the year, except for [backpedalling at the last moment](https://arstechnica.com/gadgets/2022/12/chrome-delays-plan-to-limit-ad-blockers-new-timeline-coming-in-march/), 
putting those dates "under review until March" with the admission that
an API still in such a bad shape prevents too many extensions (even
outside the controversial realm of content blockers) from migrating.

In our project, we're seeking to navigate the uncertainty of Manifest V3
transition towards a successful outcome, trying to stay compatible with
as many browsers as possible, preserving as many features as possible,
through different interventions, some sequential, some parallel:

 1. actively participating in the ongoing *browser extensions API design
    work* of the [Web Extensions Community Group](https://www.w3.org/groups/cg/webextensions), in order to steer the
    MV3 specification in the most favorable direction for security and
    privacy use cases;
 2. publishing a *MV3-compatible JShelter prototype* as much feature
    complete and cross-browser compatible as possible, and
    developed/distributed/tested separately from the MV2 version aimed
    at the general public;
 3. simultaneously advocating for, keeping track of and taking advantage
    of *useful API changes* (even if browser-specific) to improve the
    MV3-based prototype;
 4. *sharing the results with other extension developers* through the
    [NoScript Commons Library](https://noscript.net/commons-library); the
    compatibility layer eases the migration work for other developers.
