//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Libor Polcak
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
 * \brief This file contains wrapper that disables the Beacon API.
 * \ingroup wrappers
 *
 * The navigator.sendBeacon() method asynchronously sends a small
 * amount of data over HTTP to a web server. It is intended to be
 * used for sending analytics data to a web server. For more details
 * see https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API and
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
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
			parent_object: "navigator",
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
