---
title: JShelter Debuts as a Manifest V3 Extension
date: 2024-07-27 19:00
Series: Manifest v3
---

Today, we're happy to announce the release of JShelter 0.19: in spite of the odd decimal version number,
this is the most important milestone in our [migration journey to Manifest v3 (MV3)](/mv3/).

In fact, the JShelter 0.19 package we're shipping to the Chrome Store is the first one officially marked
as MV3-compatible, and it is built from a dedicated
[mv3 source code branch](https://pagure.io/JShelter/webextension/commits/mv3) implementing several changes
to work around the severe limitations imposed by Google's Manifest V3 and affecting all the extensions
installed in recent Chromium-based browsers.

Although we're very proud of this release, which prevents JShelter from getting disabled by Chrome,
we consider it more a start than a finish line. As anticipated in [previous installments of this blog series](/mv3/),
we had to drop some features (more exactly one and a half) from the Chromium version due to currently insurmountable
technical constraints. We still hope to overcome these constraints in the future, if and when [our advocacy efforts](https://jshelter.org/fixing-mv3/)
on behalf of privacy and security extensions developers eventually find a more receptive audience, especially
from Google.

Firefox, on the other hand, should be fine for now, thanks to Mozilla's sensible choice of keeping around, even in
this brave new MV3 world, their powerful
[asynchronous blocking webRequest API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest), which is crucial to implement
any non-trivial content blocking browser extension, and to their more friendly attitude towards privacy and security extensions use cases.

### What does work

__On Firefox__, JShelter 0.19 should be virtually indistinguishable from 0.18.1. In fact, it should work even better,
because we fixed a bug due to the new stateless architecture which sometimes prevented the UI popup from being
properly rendered after long inactivity.

__On Chrome__, the most notable and annoying user-facing change, which JShelter will notify you about as soon as you try to use it,
is that [enabling the Extensions Developer Mode](https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users)
is required for extensions (e.g., GreaseMonkey) to use the `userScripts` API, which JShelter must leverage to build and inject JShelter's anti-fingerprinting wrappers.
Once the Developer Mode is enabled, almost everything should work as expected, except for one feature and a half, i.e., the
[Network Boundary Shield](/nbs/) and
the blocking mode of the [Fingerprinting Detector](/fpd/) (more details below).

However, since the code changes both in JShelter itself and in the NoScript Commons Library have been many and pretty
dramatic, we certainly expect bugs. [Please report your issues here](https://pagure.io/JShelter/webextension/issues) as usual. Thanks!

### What does not work yet

As mentioned above, we had to remove one feature and a half __from the Chrome version only__:

* The [Network Boundary Shield](/nbs/)
* The [Fingerprinting Detector](/fpd/)'s blocking mode

Both of these features rely on the
[blocking webRequest API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest),
which in MV3 is provided only by Firefox.

The Network Boundary Shield also requires either a reliable DNS API or at least [some form of LAN awareness](https://github.com/w3c/webextensions/issues/402).

### What we're still working on

As we said, JShelter on Firefox is in pretty good shape, but we will keep fixing bugs and evolving anti-fingerprinting techniques
aligned with academic research. We also plan to gradually reduce the code path divergences introduced by the MV3 Chromium version,
in order to enhance the maintainability and predictability of our code.

We also still hope to overcome in the future the main disadvantages that Chromium MV3 JShelter
suffers over its Firefox counterpart,
but for this plan to work we really need more cooperation from the
[Web Extensions Community Group](https://www.w3.org/groups/cg/webextensions) (WECG)
(and especially goodwill from Google as the dominant browser vendor represented there)
at [fixing MV3](/fixing-mv3/):

1. __Removing the [developer mode requirement](https://developer.chrome.com/docs/extensions/reference/api/userScripts#developer_mode_for_extension_users)__, e.g., by introducing more [reliable and flexible
  script injection APIs like the ones we proposed here](https://github.com/w3c/webextensions/issues/103).
2. __[Implementing an MV3 version of the removed Network Boundary Shield](/nbs/)__, which requires
  [some kind of LAN awareness](https://github.com/w3c/webextensions/issues/402) from the available content
  blocking APIs.
3. __[Reintroducing Fingerprinting Detector Blocking Mode](https://github.com/w3c/webextensions/issues/110)__, which had to go away because
  complex algorithmic use cases like ours are [not covered by the declarativeNetRequest API](https://github.com/w3c/webextensions/issues/110) (MV3's
  inadequate replacement for [blocking webRequest API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest)).

The road ahead is long, but we've also accomplished a lot so far, and we want
to express our gratitude to you, JShelter users, for your help. Please keep reporting any issues that you encounter
and take a look at our [Release page](/versions/) for more information about
ongoing changes.
