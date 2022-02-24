/** \file
 * \brief Wrappers for that disables the Beacon API.
 *
 * \see https://www.w3.org/TR/beacon/
 *
 *  \author Copyright (C) 2021  Libor Polcak
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
 * The `navigator.sendBeacon()` method asynchronously sends a small
 * amount of data over HTTP to a web server. It is intended to be
 * used for sending analytics data to a web server. For more details
 * see the MDN docs on the [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) and
 * [sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon).
 *
 * `navigator.sendBeacon` is the only method currently defined for the
 * Beacon API.
 */

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "sendBeacon",
			wrapped_objects: [],
			helping_code: "",
			/// Although we should return false, we spoof returning true as ClearURL does
			wrapping_function_body: `
					return true;
				`,
		},
	]
	add_wrappers(wrappers);
})()
