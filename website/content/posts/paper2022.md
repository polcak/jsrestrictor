Title: Paper about JShelter
Date: 2022-04-05 00:00
Series: JShelter background

We recently submitted a position paper about JShelter for [CNIL Privacy Research Day 2022](https://www.cnil.fr/en/privacy-research-day-2022) and posted the paper on [arXive](https://arxiv.org/abs/2204.01392). If you are interested in the project or if you are already using JShelter, we recommend reading the paper as it explains the project, its historical decisions, the thread model, design decision, experiments, and provides more information that you should know if you want to use JShelter correctly, or, you might decide that JShelter is not the correct tool for you and you might pick one of the alternative tools referenced in the paper.

The Web is used daily by billions. Even so, users are not protected from many
threats by default. Jshelter builds on previous web privacy and
security research and fights to return
the browser to users. The paper introduces [NSCL](https://noscript.net/commons-library),
a library helping with common webextension development tasks and fixing
loopholes misused by previous research. JShelter
focuses on fingerprinting prevention, limitations of rich web APIs,
prevention of attacks connected to timing, and learning information about
the computer, the browser, the user, and surrounding physical environment and
location. We discovered a loophole in the sensor timestamps that lets any
page observe the device boot time if sensor APIs are enabled in Chromium-based
browsers. JShelter provides a fingerprinting report and other feedback
that can be used by future security research and data protection
authorities. Thousands of users around the world use the webextension every day.

Previous research established that browser security, privacy, and customizability are
important
topics.
The imminent danger of third-party cookies' removal forces
trackers to employ even more privacy-invading techniques. Real-time bidding
leaves users easy targets for various attacks, including gaining information
about other applications running on the local computer.
Moreover, continuous additions of new JavaScript APIs open new ways for fingerprinting
the browsers and gaining additional knowledge about the browser or user preferences
and physical environment.
One of the
major concerns is a lack of effective tools that everyday user wants to use. Current
methods to tackle web threats are list-based blockers that might be evaded with
a change of URL, specialised browsers, or research-only projects that are
quickly abandoned.

In contrast, JShelter is a webextension that can be installed on major
browsers and consequently does not require the user to change the browser and
routines. We integrate several previous research projects like [Chrome
Zero](https://github.com/IAIK/ChromeZero), [little-lies-based fingerprinting prevention](https://brave.com/privacy-updates/3-fingerprint-randomization/), and ideas of limiting APIs brought by [Web API
Manager](https://github.com/pes10k/web-api-manager). JShelter comes with [a heuristic-based fingerprint detector](/fpdetection/)
and prevents webpages from [misusing the browser as a proxy to access the local network
and computer](/localportscanning/).
We needed to solve issues with reliable environment modifications that stem
from webextension API that opens many loopholes that previous research
exploited. In addition to JShelter, we introduce [NSCL](https://noscript.net/commons-library).
Both NoScript Security Suite and JShelter include NSCL. Moreover, NSCL is available for other privacy-
and security-related webextensions.

In cooperation with the Free Software Foundation, we
aim for long-term JShelter development; thus, users' privacy and security
should be improved in the future. We explain fingerprinting vectors introduced
by Sensor API in mobile browsers.
Data protection
specialists should detect browser fingerprinting and other information leaks
with JShelter. We
integrated [fingerprint report](/cooperation/) and notifications to facilitate the task. We discussed considerations and issues connected with
deployment. The webextension is under development. Future work will include
fixing problems breaking pages, improved heuristics of FPD, and research
fingerprinting on login pages. We want to revisit
and evaluate the little-lies-based anti-fingerprinting technique; are the little changes
enough to stop a determined fingerprinter that can, for example, approximate
colour
values of several pixels or repeat an effect multiple times?
JShelter should not be considered a single bullet-proof solution.
We anticipate that everyday users will install JShelter together with other
webextensions like
list-based blockers or JavaScript blockers.
