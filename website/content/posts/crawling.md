Title: Measurement of JavaScript API usage on the web
Date: 2021-03-30 14:00
Series: JavaScript API usage

The world wide web is a complex environment. Web pages can access many APIs ranging from text formatting to access to nearby Bluetooth devices. While many APIs are used for legitimate purposes, some are misused to track and identify their users without their knowledge. In this paper, we propose a methodology to measure the usage of JavaScript APIs on the public web. The methodology consists of an automated visit of several thousand websites and intercepting JavaScript calls performed by the pages. We also provide a design and architecture of a measurement platform that can be used for an automated visit of a list of websites. The proposed platform is based on OpenWPM. The browser is instrumented by OpenWPM and a customized Web API Manager extension is responsible for capturing JavaScript API calls.

### Introduction

Web browsers offer a wide range of possibilities. on the surface
they _just_ display web pages, but under the hood, web
browsers provide a bridge between a viewed page and the host
operating system. A web browser allows a web page to access information
like values from sensors, information about battery status, installed
fonts, and much more. The advertisement industry often takes advantage of
the wide range of information provided by web browsers to create a web browser
[fingerprint](https://amiunique.org/links). Most commonly, the fingeprinters misuse Web APIs (also
called JavaScript APIs).

This blog post is mainly concerned
with user tracking and fingerprinting.
For example Battery Status API implementation on Mozilla Firefox
revealed very precise value allowing the trackers to identify the user
for a [period of time](https://petsymposium.org/2017/papers/hotpets/batterystatus-not-included.pdf).
As the Battery Status API was used heavily for fingerprinting, it
has been removed from Mozilla Firefox in 2017. Other examples of
JavaScript APIs that are used often for fingerprinting are [Canvas API](http://cseweb.ucsd.edu/~hovav/papers/ms12.html), [Audio API](https://senglehardt.com/papers/princeton_phd_dissertation_englehardt.pdf),
[Permissions API](https://arxiv.org/abs/2008.04480) or [APIs for device sensors](https://dl.acm.org/doi/10.1145/3243734.3243860).

In our work, we aim to measure the JavaScript APIs usage by popular
websites. In this article, we present core technologies to accomplish
these measurements. The stack of technologies is based on [OpenWPM](https://github.com/mozilla/OpenWPM)
enriched by a browser extension, that allows us to intercept JavaScript
calls of different APIs. This browser extension is based on Proxy
objects.

Our work is based on work of [Peter Snyders et al.](https://www3.cs.uic.edu/pub/Bits/PeterSnyder/Browser_Feature_Usage_on_the_Modern_Web.pdf)
carried in 2016. Since then many new
APIs were specified and implemented in web browsers, see the figure below
(based on data from [Can I Use? website](https://caniuse.com/)).

![Progress of Web APIs amount implemented in distinct browsers in time.]({attach}/images/crawling-apis.png)

### Methodology proposal

This section describes the methodology that we plan to use.
This methodology is based on
As it is based on the work of Peter Snyders, it is already validated.
Moreover, using a methodology that is very close to the
original one should show us a difference in the usage of the JavaScript
APIs in 2016 and 2021.

The main idea of the measurement is to visit several thousands of the
most [popular pages](https://tranco-list.eu/#aboutus) on the internet and intercept as many JavaScript calls
as possible.

Visiting websites will be performed through Mozilla Firefox with
an extension that intercepts and logs the JavaScript calls.
We will visit not
only the landing page but also the subset of subpages of each website.
From the landing page, we will extract three links that point to
a subpage of a given page. From each of these three subpages, we will
get another three subpage links resulting in up to 13 pages of a given
website being visited. This amount of pages should be high enough to
catch the most of JavaScript calls.
We will wait and intercept JavaScript
calls for 30 seconds on each page to wait of API calls performed during the page load.

Results of our measurements should also provide information about the
JavaScript APIs, that were probably used in a manner, that is not
necessary for a page to be working and is very likely used in a way,
that the user would not find useful. To achieve this,

We will run our
measurements on every page in two different modes. Firstly, we will
visit the page using the a browser withou adblocker. Later, we will also employ an adblocker.
Hence, the study will show the difference API usage of regular pages and trackers.

#### The original study

The Snyders' study suggests that some of the JavaScript APIs are
extremely popular and they are used on more than 90% of measured pages
(e.g. a well known `Document.createElement` method from DOM API). On the
other hand, there are many APIs that are used by a minority of measured
pages. That being said, almost 50% of JavaScript APIs implemented in the
browser at the time were not used by any of the measured pages.

The study also suggests that there is no direct connection between the
implementation date of a given JavaScript API in the browser (or by its
specification date by some of the specifications vendors) and its
popularity in using by websites. Concretely, there are some old
JavaScript APIs, such as `XMLHttpRequest` that are still very popular.
However, there are also quite new
JavaScript APIs, that are used very frequently (i.e., `Selectors API
Level 1`).

The conducted study also measured the pages in two ways - with the ad
blocker and without any ad blocking extension. Results of measurements
showed that the blocking of different JavaScript APIs is not uniform and
some APIs are blocked more often than others. Specifically, 10% of
JavaScript APIs were blocked in 90% of cases resulting in a fact that
83% of APIs were used on less than 1% of websites when the page was
visited with active blocking extension.

#### Web API Manager

Web API Manager is a browser extension, that aims to block explicitly
defined JavaScript APIs. It has been developed by Snyders in 2016 and
used in several studies conducted by [Snyders et al.](https://www.peteresnyder.com/https://www.peteresnyder.com/).

The original purpose of the Web API Manager is to block explicitly
defined JavaScript APIs. However, in our measurements, we just need to
intercept the API calls, log these calls and delegate the calls to
original receivers.

The main principle of Web API Manager is based on Proxy objects. This
metaprogramming technique allows intercepting calls performed on
objects. While the main goal of the Web API Manager extension is to
block the calls performed on objects that belong to particular
JavaScript APIs, our goal is only to intercept these operations and
delegate them to their original receivers. We will use the Log Aggregator interface to log the API
calls.

To provide a Web API Manager the list of JavaScript APIs members we need
a list of supported APIs. The APIs implemented in Mozilla Firefox are available as [IDL files](https://searchfox.org/mozilla-central/source/dom/webidl).

#### Measurement tools

The figure below shows a simplified
illustration of the measurement platform. There is OpenWPM in the middle of the
architecture. OpenWPM orchestrates
Selenium and Mozilla Firefox with the proxy-based intercepting Web API Manager.

![image]({attach}/images/crawling-architecture.png)

### The impact on JShelter

Once we have data from our crawling study, we will compare the data with [another recent study](https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md). As already mentioned, we want to develop a fingerprinting detection based on  counting the number of different
APIs employed by a page, especially APIs that are not frequently used for benign purposes. When
a fingerprinting attempt is identified, we want to (1) inform the user, (2) prevent uploading of the
fingerprint to the server, (3) prevent storing the fingerprint for later usage.
