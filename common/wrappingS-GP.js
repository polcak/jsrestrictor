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
 * navigator.getGamepads() allows any page script to learn the gamepads
 * connected to the computer if the feature is not blocked by the
 * Feature-Policy.
 *
 * The "Fingerprinting the Fingerprinters" paper (see reference below) observed
 * that the interface is used in the wild to fingerprint users. As it is likely
 * that only a minority of users have a gamepad connected and the API
 * provides additional information on the HW, it is likely that users with
 * a gamepad connected are easily fingerprintable.
 *
 * As we expect that the majority of the users does not have a gamepad
 * connected, we provide only a single mitigation - the wrapped APIs return
 * an empty list.
 *
 * \bug The standard provides an event `gamepadconnected` and
 * `gamepaddisconnected` that fires at least on the window object. We do not
 * mitigate the event to fire and consequently, it is possible that an
 * adversary can learn that a gamepad was (dis)connected but there was no
 * change in the result of the `navigator.getGamepads()` API.
 *
 * The gamepad representing object carries a timestamp of the last change of
 * the gamepad. As we allow wrapping of several ways to obtain timestamps,
 * we need to provide the same precision for the Gamepad object.
 *
 * \see U. Iqbal, S. Englehardt and Z. Shafiq, [Fingerprinting the
 * Fingerprinters: Learning to Detect Browser Fingerprinting
 * Behaviors](https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
 * in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
 * CA, US, 2021 pp. 283-301
 */

(function() {
	var remember_past_ts_values = `var precision = args[0];
				var doNoise = args[1];
				var pastValues = {};
				${rounding_function}
				${noise_function}
				var mitigationF = rounding_function;
				if (doNoise === true){
					mitigationF = function(value, precision) {
						let params = [value, precision];
						if (params in pastValues) {
							return pastValues[params];
						}
						let result = noise_function(...params);
						pastValues[params] = result;
						return result;
					}
				}
			`;
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "getGamepads",
			wrapped_objects: [{
				original_name: "Navigator.prototype.getGamepads",
				wrapped_name: "origGamepads",
			}],
			helping_code: "",
			wrapping_function_body: `
					origGamepadsRes = origGamepads.call(navigator);
					if (Array.isArray(origGamepadsRes)) {
						// e.g. Gecko
						return new window.Array();
					}
					else {
						// e.g. Chromium based
						var l = new window.Object();
						// Based on our experiments and web search results like
						// https://stackoverflow.com/questions/41251051/is-the-html5-gamepad-api-limited-to-only-4-controllers
						// https://stackoverflow.com/questions/32619456/navigator-getgamepads-return-an-array-of-undefineds
						// we try to mimic common value of the property
						l[0] = null;
						l[1] = null;
						l[2] = null;
						l[3] = null;
						l.length = 4;
						window.Object.setPrototypeOf(l, origGamepadsRes.__proto__);
						return l;
					}
				`,
		},
		{
			/**
			 * \see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/timestamp
			 * \note that at the time of the writing of the prototype, the timestamp
			 * property was not supported by any browser.
			 */
			parent_object: "Gamepad.prototype",
			parent_object_property: "timestamp",
			wrapped_objects: [],
			helping_code: remember_past_ts_values + `let origGet = Object.getOwnPropertyDescriptor(Gamepad.prototype, "timestamp").get`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "Gamepad.prototype",
					parent_object_property: "timestamp",
					wrapped_objects: [],
					/**  \brief replaces Gamepad.timestamp getter to create
					 * a timestamp with the desired precision.
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return mitigationF(origGet.call(this), precision);
								}`,
						},
					],
				}
			],
		},
	]
	add_wrappers(wrappers);
})()
