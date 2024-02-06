Title: Browser fingerprinting and JShelter
Date: 2022-01-14 13:00
Modified: 2023-04-14 14:00
Series: Browser fingerprinting
series_index: 1

This post introduces [browser fingerprinting](https://arxiv.org/pdf/1905.01051.pdf) and anti-fingerprinting mechanisms. We explain what JShelter implements and the strengths and downsides of the anti-fingerprinting mechanisms.

In short, browser fingerprinting is a stateless tracking method vastly prevalent on the web in recent years. Similarly to a human *fingerprint*, browser fingerprinting tries to find a set of features that make (almost) every fingerprint unique and the browser uniquely identifiable. 

The fingerprinting features contain various sources, mostly accessible through browser application interfaces, APIs. The APIs provide essential functionality for modern websites; however, they leak sensitive information about the browser, operating system, or device itself. Many different devices are connected to the internet — most of them with a very specific configuration. Leaking hardware and software properties may result in a sufficiently identifiable browser fingerprint. Furthermore, do not forget about the possibility of leaking information that may uncover vulnerabilities of your system for the sake of potential attackers.

At first glance, browser fingerprinting seems to be a great evil in the world full of privacy concerns. However, we should be aware of two distinct purposes for using browser fingerprinting.

Firstly, there is *a negative or destructive use case* during which websites profile cross-domain user activities without user consent. Trackers use the fingerprint as a cross-domain identifier.

Secondly, there is *a positive or constructive use case*, where websites tend to collect information about your system to improve the usability or security of their application. For example, applications can recommend installing critical security updates based on your system properties. Some websites collect browser fingerprints to verify known devices of their users to prevent fraud. The JShelter.org website offers the download link in the extension store based on the user agent.

Many browser vendors have already introduced changes to the cookie policy. Browsers such as Firefox, Safari, and Brave block third-party cookies, often abused for stateful tracking. Chrome developers [recently announced](https://blog.google/products/chrome/updated-timeline-privacy-sandbox-milestones/) that they will jump on the bandwagon too. The counter-measures against stateful tracking techniques result in a substantial increase in the usage of browser fingerprinting. 

## Counter-measures to browser fingerprinting

Unlike cookies, browser fingerprinting does not require storing an identifier on the device. Instead, the identifier is recomputed with each visited page. Once the fingerprint is obtained, it can be sent to a tracking server in a subsequent request. Moreover, the whole process of fingerprint extraction is invisible to a user. There are many sources of potentially identifiable information from which a fingerprint can be constructed. A fingerprint is considered *passive* when it contains natively accessible information from HTTP headers or network traffic. On the other hand, *active* fingerprint runs JavaScript code to retrieve data from browser APIs. JShelter focuses on detecting and preventing active fingerprinting.

Nowadays, there are many solutions to mitigate the effects of browser fingerprinting to improve internet privacy.

[Modifying the content of fingerprints](/farbling/) is a valid choice to resist a fingerprinting attempt. However, each modification may create an inconsistency that may improve the fingerprintability of the browser. Many protection tools use predefined or real fingerprints instead of the user's one to counter this issue.

Another approach is to create homogeneous fingerprints. If every fingerprint is the same, there is no way to tell the users behind the browsers apart. The leading representative of this approach is the [Tor browser](https://www.torproject.org/). Level 3 of JShelter aims to create a homogenous fingerprint. Unfortunately, homogeneous fingerprints have an inherent downside of following specific rules to be effective. Most importantly, the effectiveness of the approach depends on the broad coverage of the blocked APIs and the size of the population employing the counter-measures. All browsers with the same fingerprint form an anonymity set. An observer cannot distinguish between browsers in the anonymity set. With every missed fingerprintable attribute, the anonymity set breaks into smaller sets. For example, the Tor browser strongly recommends using a specific window size. Suppose you use a window size different from all other Tor browser users. In that case, a fingerprinter can identify you solely by this attribute. Also, keep in mind that Tor browser hides your IP address, which JShelter does not do. Hence we see Level 3 protections more as leak prevention than an anti-fingerprinting measure. If you like the idea of homogeneous fingerprints, install Tor browser.

[Brave browser](https://brave.com/) modifies the readings from APIs misused to create fingerprints. Nevertheless, the goal is to [create a unique fingerprint for each domain and session](/farbling/). As the fingerprint changes for every visited domain, its use for linking cross-domain activities is smaller. JShelter already [implements the farbling protection of Brave](/farbling/) and uses them as the default anti-fingerprinting approach.

Recently, we added [Fingerprint detector (FPD)](/fpdetection/) to JShelter. FPD does not modify the fingerprint. Instead, FPD monitors APIs that are often misused by fingerprinters. When FPD detects a fingerprinting attempt, it warns the user. You can also allow FPD to block all subsequent transmissions of the page and remove stored data to prevent storing the fingerprint and loading it after a page reload. Hence, FPD allows the page to compute the fingerprint but (if allowed) blocks the page from uploading the fingerprint away from your computer.

Other approaches include blocking JavaScript code from suspicious sources or decreasing the surface of browser APIs with explicit permission control. Extensions like [NoScript Suite](https://noscript.net/) are perfect complementary measures to JShelter.

Despite all the efforts, there is no ultimate approach that can prevent fingerprinting while keeping a high level of usability in mind. Every approach has its strengths and weaknesses, so the challenge is to find a balance between privacy and usability.
