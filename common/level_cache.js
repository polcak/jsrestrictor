/** \file
 * \brief Handle domain-specific levels
 *
 * \author Copyright (C) 2020  Libor Polcak
 * \author Copyright (C) 2021  Giorgio Maone
 * \author Copyright (C) 2022  Marek Salon
 * \author Copyright (C) 2023  Martin Zmitko
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
 * Returns the a Promise which resolves to the configuration
 * for the current level to be used by the content script for injection
 * @param {url} string
 * @param isPrivate bool specifying incognito mode
 */
function getContentConfiguration(url, frameId, tabId) {
	return new Promise(resolve => {
		function resolve_promise() {
			let level = getCurrentLevelJSON(url);
			if (level.is_default && frameId !== 0) {
				/**
				 * \bug iframes nested within an iframe with user-specific level do not get this level
				 *
				 * Suppose that there is an iframe from domain C nested in an iframe from
				 * domain B that is iself nested in a visited domain A.
				 *
				 * +------------------------------------------------------------+
				 * | visited domain a.example                                   |
				 * |                                                            |
				 * | +--------------------------------------------------------+ |
				 * | | iframe from domain b.example                           | |
				 * | |                                                        | |
				 * | | +----------------------------------------------------+ | |
				 * | | | iframe from domain c.example                       | | |
				 * | | |                                                    | | |
				 * | | +----------------------------------------------------+ | |
				 * | |                                                        | |
				 * | +--------------------------------------------------------+ |
				 * +------------------------------------------------------------+
				 *
				 * Suppose that B has a user-defined specific level settings, and C does
				 * not have a user-defined specific level settings. The iframe of domain B
				 * gets the user-defined settings for domain B but the iframe from domain C
				 * is set with the level of domain A.
				 */
				level = getCurrentLevelJSON(TabCache.get(tabId).url);
			}
			let {domainHash} = Hashes.getFor(url);
			resolve({
				currentLevel: level,
				fpdWrappers: isFpdOn(tabId) ? fp_levels.page_wrappers[fpdSettings.detection] : [],
				domainHash
			});
		}
		if (levels_initialised && fp_levels_initialised) {
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
function contentScriptLevelSetter(message, {frameId, tab}) {
	switch (message.message) {
	  case "get wrapping for URL":
			return getContentConfiguration(message.url, frameId, tab.id)
	}
}
browser.runtime.onSyncMessage.addListener(contentScriptLevelSetter);


/**
 * Register a dynamic content script to be ran for early configuration and
 * injection of the wrapper, hopefully before of the asynchronous
 * message listener above
 * \see Depends on /nscl/service/DocStartInjection.js, /nscl/service/TabCache.js
 */

DocStartInjection.register(async ({url, frameId, tabId}) => {
	let configuration = await getContentConfiguration(url, frameId, tabId);
	return `
		window.configuration = ${JSON.stringify(configuration)};
		if (typeof configureInjection === "function") configureInjection(configuration);
		console.debug("DocStartInjection while doc", document.readyState);
		`;
});

/**
 * We need to process both previous and the next URL. See
 * https://pagure.io/JShelter/webextension/issue/46 and
 * https://pagure.io/JShelter/webextension/issue/58 for more details.
 * So far only window.name wrapper needs such information so we did not created any general
 * mechanism.
 * Beware that this mechanism is triggered even when the user clicks the back button while content
 * scripts do not run again.
 */
NavCache.onUrlChanged.addListener(({tabId, frameId, previousUrl, url}) => {
	if (getSiteForURL(previousUrl) === getSiteForURL(url)) return;
	(async () => {
		let configuration = await getContentConfiguration(url, frameId, tabId);
		if (configuration.currentLevel.windowname) {
			browser.tabs.executeScript(tabId, {
				code: `window.name = "";`,
				frameId,
				runAt: "document_start",
				matchAboutBlank: true,
			});
		}
	})();
});
