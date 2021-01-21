//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Pavel Pohner
// SPDX-License-Identifier: GPL-3.0-or-later
//

/**
 * Messaging with content script.
 *
 * @message The message from consent script.
 *
 * Sends back the wrapping code.
 */
function contentScriptLevelSetter(message, sender, sendResponse) {
	if (message.message === "get wrapping for URL") {
		function get_level() {
			var page_level = getCurrentLevelJSON(message.url);
			sendResponse({
				code: page_level[1],
			});
		}
		if (levels_initialised === true) {
			get_level();
		}
		else {
			levels_updated_callbacks.push(page_level);
			return true;
		}
	}
}
browser.runtime.onMessage.addListener(contentScriptLevelSetter);
