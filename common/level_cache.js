/** \file
 * \brief Handle domain-specific levels
 *
 * \author Copyright (C) 2020  Libor Polcak
 * \author Copyright (C) 2021  Giorgio Maone
 *
 * \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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
 * Returns the a Promise which resolves to the configuration
 * for the current level to be used by the content script for injection
 * @param {url} string
 * @param isPrivate bool specifying incognito mode
 */


function getContentConfiguration(url, isPrivate) {
	return new Promise(resolve => {
		function resolve_promise() {
			var page_level = getCurrentLevelJSON(url);
			let {domainHash, domainHashIncognito} = Hashes.getFor(url);
			resolve({
				code: page_level[1],
				wrappers: page_level[0].wrappers,
				ffbug1267027: domains_bug1267027[url],
				domainHash,
				domainHashIncognito
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

/**
 * Messaging with content script.
 *
 * @message The message from content script.
 *
 * Returns the promise with the message returned to the content script.
 */
function contentScriptLevelSetter(message) {
	switch (message.message) {
	  case "get wrapping for URL":
			return getContentConfiguration(message.url)
		case "ffbug1267027":
			domains_bug1267027[message.url] = message.present;
			break;
	}
}
browser.runtime.onMessage.addListener(contentScriptLevelSetter);


/**
 * Register a dynamic content script to be ran for early configuration and
 * injection of the wrapper, hopefully before of the asynchronous
 * message listener above
 * \see Depends on /nscl/service/DocStartInjection.js
 */
DocStartInjection.register(async ({url, frameId, tabId}) => {
	let configuration = await getContentConfiguration(url);
	if (configuration) {
		return `
		window.configuration = ${JSON.stringify(configuration)};
		if (typeof configureInjection === "function") configureInjection(configuration);
		console.debug("DocStartInjection while doc", document.readyState);
		`;
	}
});
