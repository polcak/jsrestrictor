//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2026 Libor Polčák
//
// SPDX-License-Identifier: GPL-3.0-or-later
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

/// <reference path="../../common/update.js">


describe("update", function() {

	describe("Function make_configuration_compatible_with_update", function() {
		it("should upgrade from the 2.1 configuration (Firefox).",function() {
			set_global_variable("level_2", {});
			let item = {
				__default__: 2,
				version: 2.1,
				custom_levels: {},
				domains: {},
			};
			make_configuration_compatible_with_update(item);
			expect(item.version).toBeGreaterThanOrEqual(7);
		});
		it("should upgrade from the 2.1 configuration (Chromium).",function() {
			set_global_variable("level_2", {"windowname": 1});
			let item = {
				__default__: 2,
				version: 2.1,
				custom_levels: {},
				domains: {},
			};
			make_configuration_compatible_with_update(item);
			expect(item.version).toBeGreaterThanOrEqual(7);
		});
		it("should normalize domain names to reflect changes in 6633973.",function() {
			set_global_variable("level_2", {}); // Firefox
			let item = {
				"__default__": "2",
				"custom_levels": {},
				"domains": {
					"jshelter.org.": {
						"level_id": "2",
						"tweaks": {
							"time_precision": 2
						}
					},
					"vut.cz": {
						"level_id": "3"
					},
					"fit.vut.cz": {
						"level_id": "1"
					},
					"fit.vut.cz.": {
						"level_id": "0"
					}
				},
				"fpDetectionOn": true,
				"fpdSettings": {
					"behavior": 0,
					"detection": 0,
					"notifications": 1
				},
				"fpdWhitelist": {},
				"nbsSettings": {
					"blocking": 1,
					"notifications": 1
				},
				"nbsWhitelist": {},
				"requestShieldOn": true,
				"version": 7
			}
			make_configuration_compatible_with_update(item);
			expect(item.version).toBeGreaterThanOrEqual(7.1);
			expect(item.domains.hasOwnProperty("jshelter.org.")).toBeFalse();
			expect(item.domains.hasOwnProperty("jshelter.org")).toBeTrue();
			expect(item.domains["jshelter.org"].level_id).toBe("2");
			expect(item.domains["jshelter.org"].hasOwnProperty("tweaks")).toBeTrue();
			expect(item.domains["jshelter.org"].tweaks.time_precision).toBe(2);
			expect(item.domains.hasOwnProperty("vut.cz")).toBeTrue();
			expect(item.domains["vut.cz"].level_id).toBe("3");
			expect(item.domains.hasOwnProperty("fit.vut.cz")).toBeTrue();
			expect(item.domains["fit.vut.cz"].level_id).toBe("1");
			expect(item.domains.hasOwnProperty("fit.vut.cz.")).toBeTrue();
			expect(item.domains["fit.vut.cz."].level_id).toBe("0");
		});
	});

});

