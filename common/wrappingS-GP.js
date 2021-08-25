/** \file
 * \brief This file contains wrappers for the Gamepad API
 *
 * \see https://w3c.github.io/gamepad/
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
 * navigator.getGamepads() allows any page script to learn the gampepads
 * connected to the computer if the feature is not blocked by the
 * Feature-Policy.
 *
 * U. Iqbal, S. Englehardt and Z. Shafiq, "Fingerprinting the
 * Fingerprinters: Learning to Detect Browser Fingerprinting Behaviors,"
 * in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
 * CA, US, 2021 pp. 283-301 observed
 * (https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
 * that the interface is used in the wild to fingerprint users. As it is
 * likely that only a minority of users have a gamepad connected and the API
 * provides additional information on the HW, it is likely that users with
 * a gamepad connected are easily fingerprintable.
 *
 * As we expect that the majority of the users does not have a gamepad
 * connected, we provide only a single mitigation - the wrapped APIs returns
 * an empty list.
 *
 * \bug The standard provides an event *gamepadconnected* and
 * *gamepaddisconnected* that fires at least on the window object. We do not
 * mitigate the event to fire and consequently, it is possible that an
 * adversary can learn that a gamepad was (dis)connected but there was no
 * change in the result of the navigator.getGamepads() API.
 */

(function() {
	var wrappers = [
		{
			parent_object: "navigator",
			parent_object_property: "getGamepads",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_body: `
					return new window.Array();
				`,
		},
	]
	add_wrappers(wrappers);
})()
