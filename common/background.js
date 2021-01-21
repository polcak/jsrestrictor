//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: Copyright (C) 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-FileCopyrightText: Copyright (C) 2019  Martin Timko
// SPDX-License-Identifier: GPL-3.0-or-later


//Chrome compatibility
if ((typeof browser) === "undefined") {
	var browser = chrome;
}

var tab_levels = {};
var tab_urls = {};
var current_level = {level_id: "?"};

function updateBadge(level) {
	browser.browserAction.setBadgeText({text: "" + level["level_id"]});
}

// get active tab and pass it 
var queryInfo = {
	active: true,
	currentWindow: true
};

// get level for updated tab
function tabUpdate(tabid, changeInfo) {
	var url = changeInfo["url"] || tab_urls[tabid];
	if (url === undefined) {
		return;
	}
	current_level = getCurrentLevelJSON(url)[0];
	tab_levels[tabid] = current_level;
	tab_urls[tabid] = url;
	updateBadge(current_level);
}
// get level for activated tab
function tabActivate(activeInfo) {
	current_level = tab_levels[activeInfo.tabId] || {level_id: "?"};
	updateBadge(current_level);
}
// on tab reload or tab change, update badge
browser.tabs.onUpdated.addListener(tabUpdate);     // reload tab
browser.tabs.onActivated.addListener(tabActivate); // change tab

// Communication channels

/**
 * Create a port to popup window
 *
 * The communication cannels are mostly used  because
 * browser.runtime.getBackgroundPage() does not work as expected. See
 * also https://bugzilla.mozilla.org/show_bug.cgi?id=1329304.
 */
function connected(port) {
	if (port.name === "port_from_popup") {
		/// We always send back current level
		port.postMessage(current_level);
		port.onMessage.addListener(function(msg) {
			port.postMessage(current_level);
		});
	}
}
browser.runtime.onConnect.addListener(connected);
