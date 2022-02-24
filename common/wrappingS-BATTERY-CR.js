/** \file
 * \brief Wrappers for Battery Status API
 *
 * \see https://www.w3.org/TR/battery-status/
 *
 *  \author Copyright (C) 2021 Libor Polčák
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

/** \file
 * \ingroup wrappers
 *
 * The `navigator.getBattery()` reports the state of the battery and can be
 * misused to fingerprint users for a short term. The API was removed from
 * Firefox, but is still supported in browsers derived from Chromium.
 * The wrapper mimics Firefox behaviour.
 *
 * \see <https://lukaszolejnik.com/battery>
 *
 * \bug Because we mimic Firefox behaviour, a Chromium derived browser
 * becomes more easily fingerprintable. This can be fixed by properly
 * wrapping `BatteryManager.prototype` getters and setters.
 */


/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "getBattery",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "Navigator.prototype",
					delete_properties: ["getBattery"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "BatteryManager",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["BatteryManager"],
				}
			],
		},
	];
	add_wrappers(wrappers);
})();
