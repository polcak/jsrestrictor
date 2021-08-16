Title: Media devices
Filename: ../common/wrappingS-MCS.js

This file contains wrapper for MediaDevices.enumerateDevices https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices

The goal is to prevent fingerprinting by modifying return value of enumerateDevices.

This wrapper operates with three levels of protection:
*	(0) - return promise with suffled array
*	(1) - return promise with shuffled array with additional 0-4 fake devices
*	(2) - return empty promise


Shuffling approach is inspired by the algorithms created by Brave Software <https://brave.com>
available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/mediastream/media_devices.cc


