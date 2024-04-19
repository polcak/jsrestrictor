---
title: First step towards MV3
date: 2024-04-19 17:00
Series: Manifest v3
---

We have been working on migration to Manifest v3 (MV3) for some time and today we are shipping a
JShelter version 0.18 that implements stateless replacement for background pages which is a first step towards MV3.

MV2 extensions were allowed to create background pages. These pages allow running JavaScript code
and keep state like variables for the whole browser session. Essentially, all background pages
started with the browser and lasted until the user closed the browser. Hence, we could utilize
background pages to safe all information needed to be kept in memory. For instance, JShelter needs
to store:

* hashes used as a seed for JavaScript shield anti-fingerprinting protection,
* number of API calls needed for Fingerprint detector, which the user can see in the pop up and
  fingerprinting report,
* information needed to keep pop up icon dynamic,
* etc.

We needed to solve issues related to the migration of all these information from regular JavaScript
variables to Web Storage. As we expect that other extensions need to solve the same problem, we created
a [stateless NSCL branch](https://github.com/hackademix/nscl/tree/stateless). Among others, we
needed to solve the issue of writing to the storage too frequently. As the core of JShelter is
heavily stateful, we needed to rewrite important parts that were in the code base for years and were
proven to work.

JShelter has repeatable tests and we run additional testing, especially under circumstances like
this change. Everything should run the same as it used to work in 0.17. However, please be cautious
and report back any odd behavior that you encounter with 0.18 and later versions.

Migration to stateless or non-persistent background pages is needed for MV3 but it is still not a
final step. Expect other major changes in JShelter core code including removal of Network Boundary
Shield for Chromium-based browsers soon. Hence, keep cautious also in the following months and
report back any issues that you encounter. Have a look at our [Release page](/versions/) for more
information about the changes in JShelter.
