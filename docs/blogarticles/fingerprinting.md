---
title: Browser fingerprinting and JShelter
---

The aim of this post is to introduce [browser fingerprinting](https://arxiv.org/pdf/1905.01051.pdf) and anti-fingerprinting mechanisms. We explain what JSR implements and explain the strengths and downsides of the anti-fingerprinting mechanisms.

 In short, browser fingerprinting is a stateless tracking method vastly prevalent on the internet in recent years. As the word *fingerprint* suggests, it contains a combination of features that make (almost) every fingerprint unique and identifiable, similar to a human fingerprint. 

These features consist of available data from various sources, mostly accessible through browser application interfaces, APIs. Although APIs provide essential functionality for modern websites, they may leak sensitive information about your browser, operating system or even device itself. Many different devices are connected to the internet, and each uses a very specific configuration. Leaking hardware and software properties may result in a sufficiently identifiable fingerprint of your browser. Furthermore, do not forget about the possibility of leaking information that may uncover vulnerabilities of your system for the sake of potential attackers.

At first glance, browser fingerprinting seems to be a great evil in the world full of privacy concerns. However, we should be aware of two distinct purposes of using browser fingerprinting.

Firstly, there is *a negative or destructive use case* during which websites share and profile cross-browser activities of a user based on browser fingerprints without user consent. This procedure allows websites and third parties to share fingerprints as browser/device identifiers to track users across different domains or sessions.

Secondly, there is *a positive or constructive use case*, where websites tend to collect information about your system to improve the usability or security of their application. For example, applications can recommend installing critical security updates based on your system properties. Some websites collect browser fingerprints to verify known devices of their users to prevent fraud.

Many browser vendors have already introduced changes to the cookie policy. Browsers such as Firefox, Safari, and Brave block third-party cookies, often abused for stateful tracking. Chrome developers [recently annouced](https://blog.google/products/chrome/updated-timeline-privacy-sandbox-milestones/) that they will jump on the bandwagon too. The counter-measures against stateful tracking techniques result in a substantial increase in usage of browser fingerprinting. 

## Counter-measures to browser fingerprinting

Unlike cookies, browser fingerprinting does not require storing an identifier on the device. Instead, the identifier is recomputed with each visited page. Once the fingerprint is obtained, it can be sent to a tracking server in a subsequent request. Moreover, the whole process of the fingerprint extraction is invisible to a user. There are many sources of potentially identifiable information from which a fingerprinting can be constructed. A fingerprint is considered *passive* when it contains natively accessible information from HTTP headers or network traffic. On the other hand, *active* fingerprint needs to run JavaScript code to retrieve any information from browser APIs. FPD focuses on the detection and prevention of active fingerprinting.

Nowadays, there are many solutions to mitigate the effects of browser fingerprinting to improve internet privacy.

[Modifying the content of fingerprints](farbling.md) is a valid choice to resist a fingerprinting attempt. However, each modification may create an inconsistency that may improve the fingerprintability of the browser. Many protection tools use predefined or real fingerprints instead of the user's one to counter this issue.

Another approach is to create homogeneous fingerprints. If every fingerprint is the same, there is no way to tell the users behind the browsers apart. The leading representative of this approach is the [Tor browser](https://www.torproject.org/). Level 3 of JSR aims to create a homogenous fingerprint. Unfortunately, homogeneous fingerprints have an inherent downside of following specific rules to be effective. Most importantly, the effectiveness of the approach depends on the broad coverage of the blocked APIs and the size of the population employing the counter-measures. All browsers with the same fingerprint form an anonymity set. An observer cannot distinguish between browsers in the anonymity set. With every missed fingerprintable attribute, the anonymity set breaks into smaller sets. For example, the Tor browser strongly recommends using a specific window size. Suppose you are using a window size different to all other JSR users. In that case, a fingerprinter can identify you solely by this attribute. Also, keep in mind that Tor browser hides your IP address, which JSR does not do. Hence we see Level 3 protections more as leak prevention than an anti fingerprinting measure. If you like the idea of homogeneous fingerprints, install Tor browser.

[Brave browser](https://brave.com/) also modifies the fingerprinting. But the goal is to [create a unique fingerprint](./farbling.md). As the fingerprint changes for every visited domain, its use for linking cross-domain activities is smaller. JSR already [implements the farbling protection of Brave](./farbling.md) and uses them as the default anti-fingerprinting approach.
 
Other approaches include blocking JavaScript code from suspicious sources or decreasing the surface of browser APIs with explicit permission control. Extensions like [NoScript Suite](https://noscript.net/) are perfect complementary measures to JSR. Recently, we added [Fingerprint detector (FPD)](./fpdetection.md) to JSR. FPD does not aim at preventing fingerprinting. Instead, when FPD detects the fingerprinting attempt, it blocks all subsequent calls of the page and removes its storage abilities to prevent storing the fingerprint and loading it after a page reload.

Despite all the efforts, there is no ultimate approach that can prevent fingerprinting while keeping a high level of usability in mind. Every approach has its strengths and weaknesses, so the challenge is to find a balance between privacy and usability.
