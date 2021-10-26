Title: xr
Filename: ../common/wrappingS-XR.js


navigator.xr allows any page script to learn the VR displays attached
to the computer and more.

U. Iqbal, S. Englehardt and Z. Shafiq, "Fingerprinting the
Fingerprinters: Learning to Detect Browser Fingerprinting Behaviors,"
in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
CA, US, 2021 pp. 283-301 observed
(https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
that the orginal WebVR API is used in the wild to fingerprint users. As it is
likely that only a minority of users have a VR display connected and the API
provides additional information on the HW, it is likely that users with
a VR display connected are easily fingerprintable.

As all the API calls are accessible through the navigator.xr API, we provide
a single mitigation. We disable the API completely. This might need to be
revised once this API is commonly enabled in browsers.

