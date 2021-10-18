Title: Battery level
Filename: ../common/wrappingS-BATTERY-CR.js


The `navigator.getBattery()` reports the state of the battery and can be
misused to fingerprint users for a short term. The API was removed from
Firefox.

\see https://lukaszolejnik.com/battery

The API is still supported in browsers derived from Chromium. The wrapper
mimics Firefox behaviour.

\bug Because we mimic Firefox behaviour, a Chromium derived browser
becomes more easily fingerprintable. This can be fixed by properly
wrapping `BatteryManager.prototype` getters and setters.

