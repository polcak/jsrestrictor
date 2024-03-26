Title: Cooperation with the JShelter project, rebranding, and latest features
Date: 2022-03-17 15:00
Series: JShelter background

This project started as JavaScript Restrictor at [Brno University of
Technology](https://www.fit.vut.cz). As announced in [a previous post](/support), we got funding
from NLNet [NGI0 PET Fund](https://nlnet.nl/project/JSRestrictor/). Furthermore, NLNet allowed us to cooperate with another NGI0 PET Fund project - [JShelter project (formerly known as
JavaScript Shield project) run by Free Software
Foundation](https://nlnet.nl/project/JavascriptShield/).

What did the cooperation bring to the users? More experience, more developers, new ideas. Let us go
through the list.

## 1. Open development

We created [mailing list](https://lists.nongnu.org/archive/html/js-shield/) where we discussed the
core issues of the development of the extension. We held weekly meetings with the minutes available
in the mailing list archives.

## 2. Integration of NoScript Common Library

Giorgio Maone, the developer of NoScript Suite, is a part of the JShelter project. His
recent efforts were in developing NoScript Common Library (NSCL). The library aims at
simplifying the development of privacy and security-oriented web extensions with cross-browser
support.

Giorgio refactored the defence mechanism code injection and cross-browser support. Both now depend
on NSCL.

The improved code injection solved several long-term issues of the previous mechanism like (1) the
uncertainty that the defences are inserted in time before page scripts have access to the
environment and (2) the vulnerability to [Firefox
bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1267027) that did not allow to insert (full)
defenses for pages relying on [CSP headers](https://content-security-policy.com/).

Improved cross-browser support should make the future lives of developers easier. Should there be a
change like the switch to Manifest3, we will benefit from the effort put into NSCL.

## 3. Development of a new site

[Manufactura Independente](https://manufacturaindependente.org/), another participant of JShelter,
created a new website for the extension, see [https://jshelter.org/](https://jshelter.org/). Besides the polished structure
and look, the new website allows generating documentation for the Javascript Shield wrappers directly from the
comments in the source code. We do not have automatic updates, yet. But we are working on that.

## 4. Improved user interface

The original method of assigning JavaScript Shield levels of protection to each domain is nice to explain and should
be easy to understand for users. However, as the number of protected APIs grew, it became clear that we needed to fine-tune the protection for each page for power users. For example, allow Geolocation API
for maps or allow Media Devices on a video call application.

The user often had to create a new level for each misbehaving domain. With time, the amount of
levels becomes overwhelming, and the user needs to keep them in sync with the addition of the new
APIs. Each version of the extension that adds new wrappers tries to guess how to
modify user-defined levels to ease this task. But these modifications are not perfect.

0.7 brought a redesigned UI and backend that allows fine-tuning JavaScript Shield protection for
each domain. The new UI is a result of the effort of most of the developers of the extension.

![You can see the number of calls for each wrapping group and fine-tune the protection for the
visited page]({attach}/images/cooperation/fine-tuning.png)

0.6 introduced Fingerprint Detector that was improved in 0.8. The pop up shows the number of potentially suspicious calls and the likelihood of fingerprinting behaviour. The fingerprint report provides an explanation about the fingerprinting activities. Marek Saloň is the main author of the Fingerprint Detector.

![FPD report shows the reasoning to claim that a page is fingerprinting the browser]({attach}/images/cooperation/fpd-report.png)

Marek also improved notifications so that the user cannot be overwhelmed by many similar
notifications during a very short period. Starting from 0.8, it is also possible to use the
extension for passive monitoring of page activities without active modifications to the JavaScript
environment. Network Boundary Shield cannot be turned into notify mode, but it is very rare to find a
page accessing a local network. This configuration should not break any page, the user is not
protected from fingerprinting, but the extension notifies about suspicious activities.

![Almost passive configuration of the extension]({attach}/images/cooperation/almost-passive.png)


## 5. Publicity

At the beginning of 2021, we only had a handful of users. When FSF [announced the
project](https://www.fsf.org/news/fsf-announces-jshelter-browser-add-on-to-combat-threats-from-nonfree-javascript)
the number of users raised. We managed to retain about 75% of the peek of Firefox and Chrome users. See graphs below.

The number of daily users with Firefox browser:

![You can see a steep rise of Firefox daily users after the announcement on September
30th, some users left afterwards]({attach}/images/cooperation/firefox-daily-2022-03-17.png)

The number of weekly users with Chrome browser:

![We managed to keep most of the Chrome users]({attach}/images/cooperation/chrome-weekly-2022-03-17.png)

The more users we have, the more bugs are found and the more likely we receive
contributions from other parties. Also, keep in mind that some defences against fingerprinting
work best when many users employ the
defences. So it is beneficial for everyone to have as many users as possible.

## 6. New name, rebranding

The cooperation initially started between JavaScript Restrictor and JavaScript Shield project.
We thought about several rebranding options for the project to give
users a warm feeling of safety. Starting from 0.7 the extension is called JShelter,
uses a more privacy-friendly repository, and we already had a new crab icon in the late 0.5 releases.

We intend to keep the current infrastructure like the Github repository intact. All Github pages links
should work and are redirected to the new website.
