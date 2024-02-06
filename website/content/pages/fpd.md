Title: Fingerprint Detector

Fingerprint Detector (FPD) provides heuristic analysis of fingerprinting
behaviour. FPD monitors APIs that are commonly used by fingerprinters and
applies a heuristic approach to detect fingerprinting behaviour in real-time.
When a fingerprinting attempt is detected, FPD notifies the user. The user can
configure JShelter to reactively block subsequent asynchronous HTTP requests
initiated by the fingerprinting page and clear the storage facilities where the
page could have stored a (partial) fingerprint. However, this behaviour may
break the page. The goal of the aggressive mode is to prevent the page from
uploading the full fingerprint to a server. However, the fingerprinter can
gradually upload detected values and a partial fingerprint can leak from the
browser.

The heuristic approach was chosen as many prior studies proved it to be a
viable approach with a very low false-positive rate. The most challenging part
of this approach is a careful selection of detection conditions. The heuristics
contain two basic types of entries:

1. JavaScript API endpoints, which are relevant for fingerprinting detection
and
2. a hierarchy of groups of related endpoints.

For example, FPD groups endpoints according to their semantic properties.
Imagine that there are two different endpoints. Both provide hardware
information about the device. FPD can assign both endpoints to a group that
covers access to the same hardware properties. The heuristics allow clustering
groups to other groups and creating a hierarchy of groups. Ultimately, the
heuristics are a tree-like structure that computes the threat that a webpage
tried to obtain enough information to compute a unique fingerprint.

The whole evaluation process dynamically observes the API calls performed by a
web page. FPD analyses the calls themselves. Hence, the dynamic analysis
overcomes any obfuscation of fingerprinting scripts.

FPD provides a report that explains why FPD evaluated a visited page as a
fingerprinter. The report aims to educate users about fingerprinting and report
why FPD notified the user and optionally blocked the page. Additionally, the
report can be generated from passive observation of web page calls without any
JShelter interaction with the page (no API blocking).

![FPD report shows the reasoning to claim that a page is fingerprinting the browser]({attach}/images/cooperation/fpd-report.png)
