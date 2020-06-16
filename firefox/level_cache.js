//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020  Libor Polcak
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
		domains_bug1267027[message.url] = message.affected;
	}
}
browser.runtime.onMessage.addListener(contentScriptLevelSetter);
