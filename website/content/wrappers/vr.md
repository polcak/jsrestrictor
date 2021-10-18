Title: vr
Filename: ../common/wrappingS-VR.js


navigator.activeVRDisplays() allows any page script to learn the VR
displays attached to the computer.

U. Iqbal, S. Englehardt and Z. Shafiq, "Fingerprinting the
Fingerprinters: Learning to Detect Browser Fingerprinting Behaviors,"
in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
CA, US, 2021 pp. 283-301 observed
(https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
that the interface is used in the wild to fingerprint users. As it is
likely that only a minority of users have a VR display connected and the API
provides additional information on the HW, it is likely that users with
a VR display connected are easily fingerprintable.

As we expect that the majority of the users does not have a VR display
connected, we provide only a single mitigation - the wrapped APIs returns
an empty list.

\bug The standard provides events *vrdisplayconnect*,  *vrdisplaydisconnect*
*vrdisplayactivate* and *vrdisplaydeactivate* that fires at least on the
window object. We do not mitigate the event to fire and consequently, it is
possible that an adversary can learn that a VR display was (dis)connected but
there was no change in the result of the navigator.activeVRDisplays() API.

The VRFrameData object carries a timestamp. As we allow wrapping of several
ways to obtain timestamps, we need to provide the same precision for the
VRFrameData object.

