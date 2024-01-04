Title: Recent improvements in JShelter performance
Date: 2023-09-21 15:00

You might have noticed that [recent versions](/versions/#015/) improved JShelter performance. This
blog post explains the improvements in more detail and contains graphs. The improvements are based on the [bachelor thesis of Martin Zmitko](https://www.vut.cz/en/students/final-thesis/detail/147218). If you are interested in this topic, you will find more information in the thesis. We thank Martin for his work and his proposals.

[TOC]

## 1. The code inserted into each page

Archaic versions of JShelter (at that time JavaScript Restrictor) generated the wrapping code during
each page load (in so-called content scripts). However, we still needed to solve the
reliable code injection at that time. We wanted the lowest amount of work in content script. So, JShelter
started to generate the code in the background and send the generated code to the content script.

Starting from [0.5](/versions/#015/), NSCL solved the reliable code injection. The preferred and fast
solution is to inject the configuration in the `BeforeNavigate` event handler. However, there is a race
condition between the `BeforeNavigate` event and `document_start` phase of the page load. If the
script detects that the configuration is not available during the `document_start`, it initiates a
synchronous request to retrieve the configuration before page scripts start running.

However, Martin realized that a synchronous request takes a long time. Moreover, he confirmed [our
old observations](https://pagure.io/JShelter/webextension/issue/46#comment-793783) that the
synchronous request is needed very often. The time needed to process the configuration increases
linearly with the size of the configuration. JShelter used to inject 572kB of code in the default
configuration. By shifting the code generation process back to content scripts, we decreased the configuration size to 21.2kB.

During the work, we also optimized the code-generating process and eliminated duplicates in the code
as well as Firefox-specific code in Chromium-based browsers.

## 2. Improvements to little-lies

As you probably know, the [anti-fingerprinting code](/farbling/) modifies the results of some APIs with
little lies. However, that approach is performance-heavy for some APIs. The most critical are APIs
that read from canvas (`readPixels` and `toDataURL`) and `AudioBuffer.getChannelData`. For example,
the original `getChannelData` passes a reference to the underlying buffer, so the browser does not
need to do any computation. But JShelter needs to copy each item, determine how to apply the lies
(ensuring consistent lies to the same data) and modify selected items.

Martin discovered that the JShelter modifications to `readPixels`, `toDataURL`, and `getChannelData`
can benefit from a different iterator. More importantly, Martin proposed to translate the code to
WebAssembly, which runs much faster.

## 3. Improvements to FPD

[Fingerprint detector](/fpd/) collects information on each call of the APIs that are often misused
for fingerprinting. Martin discovered that some serializations performed during its operations are
not really needed.

## 4. Other optimizations

Martin also implemented several other performance improvements, some aiming at NSCL and not only
JShelter. For example, NSCL included a JavaScript library to compute SHA-256, while native
`SubtleCrypto` implementation is faster.

## 5. Results

First, let us have a look at Firefox and the improvements in 2D Canvas in `getImageData()` (note
that the y-axis is logarithmic):

![Performance of getImageData in Firefox]({attach}/images/optimizations/firefox_canvas_recommended.png)

As expected, the optimized implementation is slower than the original because it needs much
more work. Even so, the performance hit is several magnitudes lower than the hit in 0.12.2.

Now, let us have a look the improvements in 3D Canvas in `readPixels()` (this time, we show the
graph with the linear y-axis, the shape of the points depicting the performance is similar for
2D and 3D canvas):

![Performance of readPixels in Firefox]({attach}/images/optimizations/firefox_canvas3d_recommended.png)

See that the original implementation quickly leaves the plotted range. Its performance hit was
more significant than the 2D version while starting from 0.14, the performance hit of 2D and 3D canvases are
comparable.

Firefox implementation of `getChannelData` has a negligible running time (almost 0). The following figure shows that the little lies are computed much quicker (about two orders of magnitude), but the impact is still significant. Note that the y-axis is again logarithmic.

![Performance of getChannelData in Firefox]({attach}/images/optimizations/firefox_audio_recommended.png)

Martin also developed [performance
tests](https://pagure.io/JShelter/webextension/blob/1c86c45f565a36a6234c210392a89e3e20f32027/f/tests/performance_tests)
based on [Google Lighthouse](https://developer.chrome.com/docs/lighthouse/) that run in Chrome. We
tested on 46 pages from the 100 of [Tranco](https://tranco-list.eu/) and give the [performance
score](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/) below. The
performance score approximates how users perceive the loading speed of the visited page. The 25th percentile of all pages should receive a
score of 50.

The average performance score of all tested pages was 66 without JShelter. When tested with JShelter
0.12.2, the score dropped to 62.5. The average of all tested pages raised to 64 with JShelter 0.15.1.
The performance score was the same or better in JShelter 0.15.1 compared to 0.12.2 on 33 pages. It
increased on 18 pages.
