//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
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
//  along with this program.  If not, see <https://www.gnu.org/licenses/>
//
// SPDX-FileCopyrightText: 2021 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "MediaDevices.prototype",
			parent_object_property: "enumerateDevices",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_args: "",
			wrapping_function_body: `
				return new Promise((resolve) => resolve([]));
				`,
		},
	]
	add_wrappers(wrappers);
})()
