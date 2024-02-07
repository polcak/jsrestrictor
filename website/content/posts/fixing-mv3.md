---
title: "Fixing" Manifest V3
date: 2024-02-07 12:00
Series: Manifest v3
---


In the previous post of this series, [What is Manifest v3 and how
it affects JShelter](/mv3/), we've stressed the
limitations of the new WebExtensions APIs, along with the challenges and
the threats it poses to privacy and security extensions such as JShelter.

As part of our strategy to mitigate these problems, we mentioned
"actively participating in the ongoing /browser extensions API design
work/ of the [Web Extensions Community Group](https://www.w3.org/groups/cg/webextensions) (WECG), to steer the MV3
specification in the most favorable direction for security and privacy
use cases".

Here, we want to provide some updates about these design participation
activities, and pointers to follow their progress.

Specifically, we prompted the W3C's WECG to resume the discussion of the
two main issues "blocking" JShelter, which we had originally opened more
than 2 years ago:

 1. [Scripting API minimum requirements](https://github.com/w3c/webextensions/issues/103) to enable the
    reliable and pervasive script injection needed to enforce JShelter's
    JavaScript Shield wrappers
 2. [LAN-aware Declarative Net Request filters](https://github.com/w3c/webextensions/issues/402), required for the
    Network Boundary Shield to operate in Chromium-derived browsers and
    Safari on MV3

See [public notes of the meetings of the WECG](https://docs.google.com/document/d/1QkwhEMtMS67JBUkl_WVPZ4lRSKoWcQNlLJSf_GwSXg8/) for more details on the working of the group.

This time, the response has been unanimously positive on #1, and
generally positive on #2, with Google expressing a neutral position
motivated by Chromium developers unsure if the Network Boundary Shield
use case would be better served by a built-in browser UI around their
(not ready for prime time yet and planned for quite a long time now)
Private Network Access.

The discussion continues on the specific follow-up proposals we've
created afterwards, covering all our JavaScript Shield requirements:

 1. Proposal: [RegisteredContentScript.func and
    RegisteredContentScript.args (similar to ScriptInjection)](https://github.com/w3c/webextensions/issues/536)
 2. Proposal: [RegisteredContentScript.workers property to inject
    WorkerScope(s)](https://github.com/w3c/webextensions/issues/538)
 3. Proposal: [Proposal: RegisteredContentScript.tabIds and RegisteredContentScript.excludeTabIds properties to filter injection](https://github.com/w3c/webextensions/issues/539)

Furthermore [MAIN world support in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1736575)
would greatly simplify our cross-browser story,
allowing us to drop a complex and fragile compatibility layer working
around Firefox's XRay vision approach to "safe" DOM / JavaScript
environment manipulation that we currently employ in Jshelter for Firefox.

Browser vendors now signalling adequate understanding of our
requirements and their will to implement our API proposals or equivalent
alternatives before MV2 sunset can finally induce some cautious
optimism about a reasonably better MV3 for privacy and security extensions.
