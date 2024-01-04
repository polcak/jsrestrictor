Title: How JShelter prevents other parties from sniffing on your local applications?
Date: 2021-06-15 09:00

We recently found a [blog post](https://blog.nem.ec/2020/05/24/ebay-port-scanning/) about
ThreatMetrix Inc. (a part of LexisNexis) scanning locally open ports for about 30,000 web
sites, including eBay. The figure below shows that a browser tries to connect to ports commonly used for remote access to the computer (e.g., RDesktop, VNC, TeamViewer) and other applications.

![A screenshot of the browser being used as a proxy to scan locally open ports]({attach}/images/portscan-1_captured_traffic.png)

The obvious question is, what is the reason for such behaviour? The simple answer is security. See
additional links to [Security Boulevard](https://securityboulevard.com/2020/05/is-ebay-port-scanning-your-pc-probably/), [Avast](https://blog.avast.com/why-is-ebay-port-scanning-my-computer-avast), and [The register](https://www.theregister.com/2020/05/26/ebay_port_scans_your_pc/).

One possibility is that ThreatMetrix creates a [fingerprint](https://arxiv.org/pdf/1905.01051.pdf), and locally running
applications are a part of the fingerprint. Consequently, the authentication algorithm stores
attributes about your device(s) and compare them during each log in with the previous values. Seeing
that you are logging in using a previously seen device, the algorithm can let you in with just a
password without additional proves. However, should you use a new device, the algorithm might decide that
additional authentication steps are required and send you an SMS.

Another option is that ThreatMetrix knows that many fraudulent activities occur on
devices with specific ports open. Recall that the ports being checked concern remote desktop
access. Having a remote desktop port open means that the computer may be used by an adversary that does not sit near the computer but is connected remotely. Consequently, the authentication algorithm might decide that additional proves about the user identity should be checked.

We do not know what the real reason behind the scanning is. It might be one of the above, both, or a
similar reason.

### Ethical and legal issues

Although it could be that the underlying intentions are benign and users actually do benefit from
the scanning, the scanning raises some ethical issues.

Very often, security and privacy are interconnected. But sometimes, one might increase security by
revealing something private. In this case, ThreatMetrix learns information about the running device
that is not obvious to the device owner (a user or a company). Typically, the owner of the device
does not even know that such information can leak. If the information
stays with ThreatMetrix, then the benefits could appear to be greater than the disadvantages.
However, adversaries could stole information from ThreatMetrix (see for example the [Ecquifax breach](https://en.wikipedia.org/wiki/2017_Equifax_data_breach)) or the company can start to [sell](https://www.vice.com/en/article/qjdkq7/avast-antivirus-sells-user-browsing-data-investigation) the [information](https://www.pcmag.com/news/the-cost-of-avasts-free-antivirus-companies-can-spy-on-your-clicks) or even [share with others](https://brave.com/rtb-evidence/).

So is the scanning and data collecting legal? As some of our developers and users are based in the EU, we will dig into the EU perspective. You might want to
consult your local laws if you are outside the EU. Moreover, as we are not lawyers, you might want to
consult one even in the EU.

[EU ePrivacy Directive](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32002L0058) applies. However, as [WP29 clarified](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2014/wp224_en.pdf) (use case 7.5), user-centric security can be viewed as strictly necessary to provide
the service. So it seems likely that port scanning for security reasons would
trigger the ePrivacy exception and user consent is not necessary.

As the port scanning is a part of the login mechanism, open ports are personal data
without doubts. So GDPR also applies.
GDPR also list security as a possible legitimate interest of a data controller (e.g. eBay), see
recital 49. Nevertheless, if such a scan is proportionate is an open question; it is possible that the legitimate interests of data controllers (such as eBay) are overriden by the interests or fundamental rights and freedoms of the data subject (you), see Article(6)(1)(f).
The Court of Justice of EU (CJEU) decided several issues that concerned legitimate interests and the necessity of processing, e.g. [C-13/16, point 30 that also points to other related cases](https://curia.europa.eu/juris/liste.jsf?num=C-13/16) or [C-708/18 points 40–45](https://curia.europa.eu/juris/liste.jsf?num=C-708/18). It might be possible that it is strictly necessary for eBay to perform local port scanning.

Nevertheless, Article 12-14 of GDPR lists requirements on the information that a data controller should reveal
to each data subject before the data processing starts or in a reasonable time afterwards. Hence, each controller employing ThreatMetrix should reveal, for example, in the privacy policy, what categories of data it is using and
for which purposes. From the [linked](https://blog.avast.com/why-is-ebay-port-scanning-my-computer-avast) [articles](https://www.theregister.com/2020/05/26/ebay_port_scans_your_pc/), it seems that ThreatMetrix and eBay are secretive about data being collected.

Another GDPR issue might be data transfers to third countries. Data transfers of open ports may not be
compatible with GDPR in the light of the [CJEU C-311/18](https://curia.europa.eu/juris/liste.jsf?num=C-311/18) decision if the information leaves EEA.

### Why is not my browser protecting me from remote servers accessing local information?

OK, so even though the scanning could be legal, one can disagree that others should be allowed to sniff on
local applications. So why does a browser leak the information?

Well, the browser employs so called [same origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) (SOP) that in abstract theory should prevent websites from the scans in question. As your local computer is of a different origin from the remote website, your computer should be protected by SOP. Nevertheless, SOP has its limitations. First of all, some [cross-origin resource sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) is beneficial, so the browser cannot block outgoing requests to other origins. Such behaviour opens possibilities for [side-channels](https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf) to be identified. So even though the web page cannot communicate with applications on your computer (or in your network) without the cooperation of these applications, it can observe the behaviour and make some conclusions based on the observed errors, timing, etc.

An (ad) blocker can prevent you from the activity. As the blockers typically leverage blocklists,
such a port scanning script URL needs to match a rule in a block list. Once information about a
misbehaving script becomes public, a rule can be added to a block list. However, this could take some time. Additional techniques like [DNS de-cloaking](https://blog.lukaszolejnik.com/large-scale-analysis-of-dns-based-tracking-evasion-broad-data-leaks-included/)
need to be applied in this case.

### Network Boundary Shield to the rescue

JShelter contains a Network Boundary Shield (NBS) that blocks outgoing browser requests based on the observed behaviour, i.e. a
page hosted on public internet tries to access local URLs.
NBS just works and cannot be fooled by changes in the URL path, DNS cloaking or other techniques.

![JShelter blocks the scan]({attach}/images/portscan-2_request_blocked.png)

Firefox contains DNS API, so NBS works flawlessly. In Chromium-based browsers, the exact blocking
behaviour depends on how quickly a scanning script can fire the requests and the precise
destination (IP address or a domain name). Depending on the interaction with DNS, NBS can be side-stepped on Chrome. In this case, ThreatMetrix does not try any evasion technique, so
NBS just works in the case of eBay and ThreatMetrix.
