/** \file
 * \brief Main background script
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2023  Martin Zmitko
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

var tab_status = {};
var tab_urls = {};

function updateBadge(text, tabid) {
	browser.browserAction.setBadgeText({text: text, tabId: tabid});
}

// get active tab and pass it
var queryInfo = {
	active: true,
	currentWindow: true
};

// get level for updated tab
function tabUpdate(tabid, changeInfo) {
	if (changeInfo.status === "loading") {
		delete tab_status[tabid];
	}
	var url = changeInfo["url"] || tab_urls[tabid];
	if (url === undefined) {
		return wrapping_groups.empty_level;
	}
	let current_level = getCurrentLevelJSON(url);
	tab_urls[tabid] = url;
	return current_level;
}
// on tab reload or tab change, update metadata
browser.tabs.onUpdated.addListener(tabUpdate);     // reload tab

// Modify CSP headers to allow WASM execution in page context
function cspRequestProcessor(details) {
	let modified = false;
	let headers = details.responseHeaders;
	for (let header of headers) {
		let name = header.name.toLowerCase();
		if (name !== "content-security-policy" &&
			name !== "content-security-policy-report-only" &&
			name !== "x-webkit-csp") {
			continue;
		}
		let origCSP = header.value;
		header.value = header.value.replace("script-src", "script-src 'wasm-unsafe-eval'");
		if (origCSP !== header.value) {
			modified = true;
		}
	}
	return modified ? {responseHeaders: headers} : {};
}
// Attach listener only in chromium where the WASM module is instantiated directly in
// page context, subject to the page's CSP. Code inserted as script tags isn't subject
// to script-src origins, it is, however, subject to the 'unsafe' group of script evaluation rules.
if (typeof browser_polyfill_used !== "undefined" && browser_polyfill_used) {
	browser.webRequest.onHeadersReceived.addListener(cspRequestProcessor,
		{urls: ["<all_urls>"],
		types: ["main_frame", "sub_frame"]},
		["blocking", "responseHeaders"]
	);
}

// Communication channels

/**
 * Create a port to popup window
 *
 * The communication cannels are mostly used  because
 * browser.runtime.getBackgroundPage() does not work as expected. See
 * also https://bugzilla.mozilla.org/show_bug.cgi?id=1329304.
 */
async function connected(port) {
	if (port.name === "port_from_popup") {
		let current_level = wrapping_groups.empty_level;
		try {
			// We always send back current level
			let [tab] = await browser.tabs.query(queryInfo);
			current_level = getCurrentLevelJSON(tab.url);
		} catch (e) {
			// Stick to the empty_level and ignore the exception
			console.debug("Could not get current level for popup", e);
		}
		port.postMessage(current_level);
		port.onMessage.addListener(function(msg) {
			port.postMessage(current_level);
		});
	}
}
browser.runtime.onConnect.addListener(connected);

/**
 * Listen to detected API calls and update badge accordingly
 */
fpDb.add_observer({
	notify: function(api, tabid, type, count) {
		let group_name = wrapping_groups.wrapper_map[api];
		if (!group_name) {
			return; // The API does not belong to any group
		}
		let tab_stats = get_or_create(tab_status, tabid, {});
		tab_stats[group_name] = true;
		updateBadge(String(Object.keys(tab_stats).length), tabid);
	}
});
browser.tabs.onRemoved.addListener(tabid => delete tab_status[tabid]);
