Title: np
Filename: ../common/wrappingS-NP.js

This file contains wrappers for NavigatorPlugins

  * https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/plugins
  * https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/mimeTypes

The goal is to prevent fingerprinting by modifying value returned by getters navigator.plugins and navigator.mimeTypes

This wrapper operates with three levels of protection:

*	 (0) - replace by shuffled edited PluginArray with two added fake plugins, edited MimeTypeArray
*	 (1) - replace by shuffled PluginArray with two fake plugins, empty MimeTypeArray
*	 (2) - replace by empty PluginArray and MimeTypeArray

These approaches are inspired by the algorithms created by Brave Software <https://brave.com>
available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/plugins/dom_plugin_array.cc


