/** \file
 * \brief Main background script
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
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
