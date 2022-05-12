/** \file
 * \brief Code that updates configuration stored by the user after upgrades
 *
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2019-2021  Libor Polcak
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

function installUpdate() {
	/**
	 * 0.3+ storage
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
	 *	  nbsWhitelist: {} // associative array of hosts that are removed from http protection control (hostname => boolean)
	 *	  requestShieldOn: {} // Boolean, if it's TRUE or undefined, the http request protection is turned on,  if it's FALSE, the protection si turned off
	 *	  fpDetectionOn: {} // Boolean, if it's TRUE, the fingerprint detection is turned on,  if it's FALSE or undefined, the protection si turned off
	 *
	 *
	 */
	browser.storage.sync.get(null).then(function (item) {
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
		if (item.version < 2.6) {
			// No Beacon API (analytics) wrapping below 2.6
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.windowname || l.battery || l.geolocation || l.enumerateDevices || l.time_precision || l.hardware) {
					l.analytics = true;
				}
			}
			item.version = 2.6;
		}
		if (item.version < 2.7) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.htmlcanvaselement) {
					l.htmlcanvaselement_method = 1;
					l.audiobuffer = true;
					l.audiobuffer_method = 0;
					l.webgl = true;
					l.webgl_method = 0;
				}
			}
			item.version = 2.7;
		}
		if (item.version < 2.8) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.htmlcanvaselement) {
					l.plugins = true;
					if (l.htmlcanvaselement_method == 0) {
						l.plugins_method = 0;
					}
					else {
						l.plugins_method = 2;
					}
				}
			}
			item.version = 2.8;
		}
		if (item.version < 2.9) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.analytics) {
					l.gamepads = true;
				}
			}
			item.version = 2.9;
		}
		if (item.version < 3) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.gamepads) {
					l.vr = true;
				}
			}
			item.version = 3;
		}
		if (item.version < 4) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.hardware || l.battery || l.windowname) {
					l.physical_environment = true;
					l.physical_environment_emulateStationaryDevice = true;
				}
			}
			item.version = 4;
		}
		if (item.version < 5) {
			item.fpDetectionOn = false;
			item.version = 5;
		}
		if (item.version < 6) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				// time_precision
				if (l.time_precision) {
					if (l.time_precision_randomize || l.time_precision_precision < 1) {
						l.time_precision = 3;
					}
					else if (l.time_precision_precision == 1) {
						l.time_precision = 2;
					}
					else if (l.time_precision_precision > 1) {
						l.time_precision = 1;
					}
					else {
						delete l.time_precision;
					}
				}
				else {
					delete l.time_precision;
				}
				delete l.time_precision_precision;
				delete l.time_precision_randomize;
				// regular farbling
				for (farblable of ["htmlcanvaselement", "audiobuffer", "webgl", "plugins", "enumerateDevices", "hardware"]) {
					if (l[farblable]) {
						if (l[farblable + "_method"] !== undefined) {
							l[farblable] = l[farblable + "_method"] + 1;
						}
						else {
							l[farblable] = 2;
						}
					}
					else {
						delete l[farblable];
					}
					delete l[farblable + "_method"];
				}
				// xhr
				if (l.xhr) {
					if (l.xhr_behaviour_block && !l.xhr_behaviour_ask) {
						l.xhr = 2;
					}
					else {
						l.xhr = 1;
					}
				}
				else {
					delete l.xhr;
				}
				delete l.xhr_behaviour_block;
				delete l.xhr_behaviour_ask;
				// arrays
				if (l.arrays) {
					if (l.arrays_mapping) {
						l.arrays = 2;
					}
					else {
						l.arrays = 1;
					}
				}
				else {
					delete l.arrays;
				}
				delete l.arrays_mapping;
				//sharred_array
				if (l.shared_array) {
					if (l.shared_array_approach_block) {
						l.shared_array = 2;
					}
					else {
						l.shared_array = 1;
					}
				}
				else {
					delete l.shared_array;
				}
				delete l.shared_array_approach_block;
				delete l.shared_array_approach_polyfill;
				// webworker
				if (l.webworker) {
					if (l.webworker_approach_polyfill) {
						l.webworker = 2;
					}
					else {
						l.webworker = 1;
					}
				}
				else {
					delete l.webworker;
				}
				delete l.webworker_approach_polyfill;
				delete l.webworker_approach_slow;
				// geolocation
				if (l.geolocation) {
					if (l.geolocation_locationObfuscationType == 0) {
						l.geolocation = 6;
					}
					else if (l.geolocation_locationObfuscationType == 2) {
						l.geolocation = 2;
					}
					else if (l.geolocation_locationObfuscationType == 3) {
						l.geolocation = 3;
					}
					else if (l.geolocation_locationObfuscationType == 4) {
						l.geolocation = 4;
					}
					else if (l.geolocation_locationObfuscationType == 5) {
						l.geolocation = 5;
					}
					else if (l.geolocation_locationObfuscationType == -1) {
						l.geolocation = 1;
					}
					else {
						l.geolocation = 3;
					}
				}
				else {
					delete l.geolocation;
				}
				delete l.geolocation_locationObfuscationType;
				// others
				for (wrap of ["physical_environment", "gamepads", "vr", "analytics", "battery", "windowname"]) {
					if (l[wrap]) {
						l[wrap] = 1;
					}
					else {
						delete l[wrap];
					}
				}
				delete l.physical_environment_emulateStationaryDevice;
			}
			item.version = 6;
		}
		if (item.version < 6.1) {
			// We no longer ship level 1 as its content is not defined well, the tweaks allow the user
			// to relax the level conditions specifically to each page
			for (domain in item.domains) {
				let level = item.domains[domain];
				// Select the default level if the default level is not 3 (if level 3 is the default, set
				// level 2)
				if (level.level_id == "1") {
					if ([2, 3, "2", "3"].includes(item.__default__)) {
						level.level_id = "2";
					}
					else {
						level.level_id = String(item.__default__);
					}
				}
			}
			item.version = 6.1;
		}
		if (item.version < 6.2) {
			if (item.fpDetectionOn) {
				item.fpdSettings = {
					behavior: 3
				};
			}
			else {
				item.fpdSettings = {
					behavior: 1
				};
			}
			item.fpDetectionOn = true;
			item.nbsWhitelist = item.whitelistedHosts ? item.whitelistedHosts : {};
			delete item.whitelistedHosts;
			item.nbsSettings = {
				notifications: 1
			};
			item.version = 6.2;
		}
		if (item.version < 6.3) {
			if (level_2.windowname === undefined) { // Firefox
				for (level in item["custom_levels"]) {
					let l = item["custom_levels"][level];
					if (!(l.arrays || l.shared_array)) {
						delete l.windowname;
					}
				}
			}
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				l.webworker = 2;
			}
			item.version = 6.3;
		}
		if (item.version < 6.4) {
			if (item.nbsSettings) {
				item.nbsSettings.blocking = 1;
			}
			if (item.fpdSettings) {
				item.fpdSettings.detection = 0;
			}
			item.version = 6.4;
		}
		if (item.version < 6.5) {
			for (level in item["custom_levels"]) {
				let l = item["custom_levels"][level];
				if (l.time_precision && l.analytics && l.geolocation) {
					l.coopschedule = 1;
					l.net = 1;
					l.nfc = 1;
					l.useridle = 1;
					if (l.htmlcanvaselement || l.audiobuffer || l.enumerateDevices) {
						l.useridle = 2;
						if (l.htmlcanvaselement === 2 || l.audiobuffer === 2 || l.enumerateDevices === 3) {
							l.useridle = 3;
							l.playback = 2;
						}
					}
				}
			}
			item.version = 6.5;
		}
		if (item.version < 6.6) {
			if (item.fpdSettings) {
				switch (item.fpdSettings.behavior) {
					case 0:
						item.fpdSettings.notifications = 0;
						break;
					case 1:
						item.fpdSettings.behavior = 0;
						item.fpdSettings.notifications = 1;
						break;
					case 2:
						item.fpdSettings.behavior = 1;
						item.fpdSettings.notifications = 1;
						break;
					case 3:
						item.fpdSettings.behavior = 2;
						item.fpdSettings.notifications = 1;
				}
			}
			item.version = 6.6;
		}



		browser.storage.sync.set(item).then(() => {
			// origin of update.js must be recognized (background script vs. options page)
			if (typeof fpdLoadConfiguration === "function") {
				fpdLoadConfiguration();
			}
			else {
				browser.runtime.sendMessage({purpose: "fpd-load-config"});
			}
			if (typeof nbsLoadConfiguration === "function") {
				nbsLoadConfiguration();
			}
			else {
				browser.runtime.sendMessage({purpose: "nbs-load-config"})
			}
		});
	});
}
browser.runtime.onInstalled.addListener(installUpdate);
// fallback - populate storage with valid data (if onInstalled won't fire)
browser.storage.sync.get(null).then((item) => {
	checkAndSaveConfig(item);
});

async function checkAndSaveConfig(conf) {
	let checkSettingRange = (module, setting, range, defValue) => {
		if (!(conf[module][setting] in range)) {
			conf[module][setting] = defValue;
		}
	}
	let checkExistAndType = (name, type, defValue) => {
		if (!(name in conf && typeof(conf[name]) === type)) {
			conf[name] = defValue;
		}
	}
	checkExistAndType("version", "number", 2.1);
	checkExistAndType("requestShieldOn", "boolean", true);
	checkExistAndType("fpDetectionOn", "boolean", false);
	checkExistAndType("custom_levels", "object", {});
	if (!("__default__" in conf) || typeof(conf.__default__) !== "string" ||
			(!(conf.__default__ in [0,1,2,3]) && !(conf.__default__ in conf.custom_levels))) {
		conf.__default__ = "2";
	}
	checkExistAndType("nbsWhitelist", "object", {});
	checkExistAndType("nbsSettings", "object", {});
	checkSettingRange("nbsSettings", "blocking", [0,1], 1);
	checkSettingRange("nbsSettings", "notifications", [0,1], 1);
	checkExistAndType("fpdWhitelist", "object", {});
	checkExistAndType("fpdSettings", "object", {});
	checkSettingRange("fpdSettings", "behavior", [0,1,2,3], 1);
	checkSettingRange("fpdSettings", "notifications", [0,1], 1);
	checkSettingRange("fpdSettings", "detection", [0,1], 0);
	await browser.storage.sync.set(conf);
	installUpdate();
}
