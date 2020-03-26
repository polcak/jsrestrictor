//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2019  Libor Polcak
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

// either way, set browser var as chrome
if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

function installUpdate() {
	/**
	 * 0.3 storage
	 *  {
	 *    __default__: 2, // Default protection level
	 *    version: 2,     // The version of this storage
	 *    custom_levels: {}, // associative array of custom level (key, its id => object)
	 *      {level_id: short string used for example on the badge
	 *       level_text: Short level description
	 *       level_description: Full level description
	 *       wrappers": list of wrappers and their parameters
	 *      }
	 *    domains: {}, // associative array of levels associated with specific domains (key, the domain => object)
	 *      {level_id: short string of the level in use
	 *      }
	 */
	browser.storage.sync.get(null, function (item) {
		if (!item.hasOwnProperty("version")) {
			browser.storage.sync.clear();
			console.log("All JavaScript Restrictor data cleared! Unfortunately, we do not migrate settings from versions bellow 0.3.");
			browser.storage.sync.set({
				__default__: 2,
				version: 2,
				custom_levels: {},
				domains: {},
			});
		}
	});
}
browser.runtime.onInstalled.addListener(installUpdate);


