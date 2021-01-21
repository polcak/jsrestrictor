//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: Copyright (C) 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-FileCopyrightText: Copyright (C) 2019  Martin Timko
// SPDX-License-Identifier: GPL-3.0-or-later
//

//Chrome compatibility
if ((typeof browser) === "undefined") {
	var browser = chrome;
}

function installUpdate() {
	/**
	 * 0.3 storage
	 *  {
	 *    __default__: 2, // Default protection level
	 *    version: 2.2,     // The version of this storage
	 *    custom_levels: {}, // associative array of custom level (key, its id => object)
	 *      {level_id: short string used for example on the badge
	 *       level_text: Short level description
	 *       level_description: Full level description
	 *       ...
	 *       wrapping_params (key-value pairs), see wrapping_groups for the list of params and
	 *                       supported values
	 *      }
	 *    domains: {}, // associative array of levels associated with specific domains (key, the domain => object)
	 *      {level_id: short string of the level in use
	 *      }
	 *	  whitelistedHosts: {} // associative array of hosts that are removed from http protection control (hostname => boolean)
	 *	  requestShieldOn: {} // Boolean, if it's TRUE or undefined, the http request protection is turned on,  if it's FALSE, the protection si turned off
	 */
	browser.storage.sync.get(null, function (item) {
		if (!item.hasOwnProperty("version") || (item.version < 2.1)) {
			browser.storage.sync.clear();
			console.log("All JavaScript Restrictor data cleared! Unfortunately, we do not migrate settings from versions bellow 0.3.");
			item = {
				__default__: 2,
				version: 2.1,
				custom_levels: {},
				domains: {},
			};
		}
		if (item.version == 2.1) {
			// No Geolocation below 2.2
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.time_precision) {
					l.geolocation = true;
					if (l.time_precision_randomize) {
						l.geolocation_locationObfuscationType = 5;
					}
					else if (l.time_precision_precision == 2) {
						l.geolocation_locationObfuscationType = 2;
					}
					else if (l.time_precision_precision == 1) {
						l.geolocation_locationObfuscationType = 3;
					}
					else if (l.time_precision_precision == 0) {
						l.geolocation_locationObfuscationType = 4;
					}
					else {
						l.geolocation_locationObfuscationType = -1;
					}
					// note that the obfuscation type might be redefined below
				}
				if (l.shared_array || l.webworker || l.xhr || l.arrays) {
					l.geolocation = true;
					l.geolocation_locationObfuscationType = 0;
				}
				if (l.geolocation_locationObfuscationType === undefined && l.htmlcanvaselement) {
					l.geolocation = true;
					l.geolocation_locationObfuscationType = 3;
				}
			}
			item.version = 2.2;
		}
		if (item.version == 2.2) {
			// No window.name wrapping below 2.2
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				let count = 0;
				count += Number(Boolean(l.time_precision)) +
				         Number(Boolean(l.hardware)) +
				         Number(Boolean(l.battery)) +
				         Number(Boolean(l.geolocation)) +
				         Number(Boolean(l.shared_array)) +
				         Number(Boolean(l.webworker)) +
				         Number(Boolean(l.xhr)) +
				         Number(Boolean(l.arrays)) +
				         Number(Boolean(l.htmlcanvaselement));
				if (count >= 3) {
					l.windowname = true;
				}
			}
			item.version = 2.3;
		}
		if (item.version == 2.3) {
			// No enumerateDevices wrapping below 2.4
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				let count = 0;
				count += Number(Boolean(l.time_precision)) +
				         Number(Boolean(l.hardware)) +
				         Number(Boolean(l.battery)) +
				         Number(Boolean(l.geolocation)) +
				         Number(Boolean(l.shared_array)) +
				         Number(Boolean(l.webworker)) +
				         Number(Boolean(l.xhr)) +
				         Number(Boolean(l.arrays)) +
				         100*Number(Boolean(l.htmlcanvaselement));
				if (count >= 102) {
					l.enumerateDevices = true;
				}
			}
			item.version = 2.4;
		}
		browser.storage.sync.set(item);
	});
}
browser.runtime.onInstalled.addListener(installUpdate);


