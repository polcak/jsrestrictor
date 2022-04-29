/** \file
 * \brief Wrappers for NetworkInformation
 *
 * \see https://wicg.github.io/netinfo/#networkinformation-interface
 *
 *  \author Copyright (C) 2022  Libor Polcak
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
 * This file contains a wrapper for [NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation#specifications).
 * \ingroup wrappers
 *
 * NetworkInformation allows sites to learn about local network conditions by querying `navigator.connection`.
 * Fingerprinters can misuse the feature. Long-term observers may learn about traveling patterns
 * through observation of repeated values (for example a network at work, home, travel, etc.).
 *
 * We implement the same protection as Brave: https://github.com/brave/brave-browser/issues/20122.
 *
 * ```
 * navigator.connection === undefined
 * "connection" in window.navigator === false
 * ```
*/

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "connection",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "Navigator.prototype",
					delete_properties: ["connection"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "NetworkInformation",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["NetworkInformation"],
				}
			],
		},
	];
	add_wrappers(wrappers);
})();
