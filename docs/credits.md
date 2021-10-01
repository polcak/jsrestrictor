Title: Credits

### Developers

**[Libor Polčák](https://www.fit.vutbr.cz/~polcak)** was behind an idea to implement a webextension that works as a firewall for JavaScript APIs. He is the current main maintainer. He received support for this project through the <a href="https://nlnet.nl/project/JSRestrictor/">JavaScript Restrictor</a> project of NGI0 PET Fund, a fund established by NLnet with financial support from the European Commission's Next Generation Internet programme, under the aegis of DG Communications Networks, Content and Technology under grant agreement No 825310. He supervised/supervises diploma theses that improve the web extension.

**Martin Bednář** is working on developing and testing the extension as a part of his Ph.D. research.

**Giorgio Maone** is working on the extension as a part of the [JS Shield project](https://nlnet.nl/project/JavascriptShield/), for example, he is working on cross-browser support, improvements on code injection and the compatibility between the global JS environment, Workers, and iframes.

**Zbyněk Červinka** developed a [proof-of-concept version](https://github.com/cervinka-zbynek/masters-thesis) of this extension as a part of his [master's thesis](https://www.fit.vut.cz/study/thesis/21274/) (in Czech).

**Martin Timko** developed first public versions upto [0.2.1](https://github.com/polcak/jsrestrictor/releases/tag/0.2.1) as a part of his [master's thesis](https://www.fit.vut.cz/study/thesis/21824/). He also ported the extension to Chrome and Opera.

**Pavel Pohner** developed the Network Boundary Scanner as a part of his master's thesis.

**Pater Horňák** ported functionality from [Chrome Zero](https://github.com/IAIK/ChromeZero) as a part of his bachelor thesis. He also provided several small fixes to the code base.

**Matúš Švancár** ported Farbling anti-fingerprinting measures from the Brave browser as a part of his [master's thesis](https://www.fit.vut.cz/study/thesis/23310/).

We thank all other minor contributors of the project that are not listed in this section.

### Key ideas

The development of this extension is influenced by the paper [JavaScript Zero: Real JavaScript and Zero Side-Channel Attacks](https://graz.pure.elsevier.com/de/publications/javascript-zero-real-javascript-and-zero-side-channel-attacks). It appeared during the work of Zbyněk Červinka and provided basically the same approach to restrict APIs as was at the time developed by Zbyněk Červinka.

The [Force Point report](https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf) was a key inspiration for the development of the Network Boundary Shield.

Some of the fingerprinting counter-measures are inspired by [Farbling of the Brave browser](blogarticles/farbling.md).

### Borrowed code

We borrowed code from other free software projects:

* [Chrome Zero](https://github.com/IAIK/ChromeZero)
* [Brave Farbling](https://github.com/brave/brave-browser/issues/8787)
* [NoScript Common Library](https://github.com/hackademix/nscl/)
* [Typed array polyfill](https://github.com/inexorabletash/polyfill/blob/master/typedarray.js),
	Copyright (c) 2010, Linden Research, Inc., Copyright (c) 2014, Joshua Bell
* [PRNG Alea](https://github.com/nquinlan/better-random-numbers-for-javascript-mirror) by (C) 2010 Johannes Baagøe
