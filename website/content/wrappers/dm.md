Title: Device memory
Filename: ../common/wrappingS-DM.js

This file contains wrapper for navigator.deviceMemory https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory

The goal is to prevent fingerprinting by modifying return value of navigator.deviceMemory parameter.

This wrapper operates with three levels of protection:
*	(0) - return random valid value from range [0.25 - real value]
*	(1) - return random valid value from range [0.25 - 8]
*	(2) - return 4

These approaches are inspired by the algorithms created by Brave Software <https://brave.com>
available at <https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/frame/navigator_device_memory.cc>


