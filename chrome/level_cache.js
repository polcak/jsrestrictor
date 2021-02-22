//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
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
//  along with this program.  If not, see <https://www.gnu.org/licenses/>
//
// SPDX-FileCopyrightText: 2020  Libor Polcak
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
