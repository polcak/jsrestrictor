//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later

//

/**
 * Keep list of domains that are known (not) to be affected by the
 * Firefox bug 1267027.
 */
var domains_bug1267027 = {};

/**
 * Messaging with content script.
 *
 * @message The message from consent script.
 *
 * Returns the promise with the message returned to the content script.
 */
function contentScriptLevelSetter(message) {
	if (message.message === "get wrapping for URL") {
		return new Promise(function(resolve) {
			function resolve_promise() {
				var page_level = getCurrentLevelJSON(message.url);
				resolve({
					code: page_level[1],
					wrappers: page_level[0].wrappers,
					ffbug1267027: domains_bug1267027[message.url]
				});
			}
			if (levels_initialised === true) {
				resolve_promise();
			}
			else {
				levels_updated_callbacks.push(resolve_promise);
			}
		});
	}
	else if (message.message === "ffbug1267027") {
		domains_bug1267027[message.url] = message.present;
	}
}
browser.runtime.onMessage.addListener(contentScriptLevelSetter);
