/** \file
 * \brief This file contains wrappers for the original Virtual Reality API
 *
 * \see https://immersive-web.github.io/webvr/spec/1.1/
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
 * navigator.activeVRDisplays() allows any page script to learn the VR
 * displays attached to the computer.
 *
 * U. Iqbal, S. Englehardt and Z. Shafiq, "Fingerprinting the
 * Fingerprinters: Learning to Detect Browser Fingerprinting Behaviors,"
 * in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
 * CA, US, 2021 pp. 283-301 observed
 * (https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
 * that the interface is used in the wild to fingerprint users. As it is
 * likely that only a minority of users have a VR display connected and the API
 * provides additional information on the HW, it is likely that users with
 * a VR display connected are easily fingerprintable.
 *
 * As we expect that the majority of the users does not have a VR display
 * connected, we provide only a single mitigation - the wrapped APIs returns
 * an empty list.
 *
 * \bug The standard provides events *vrdisplayconnect*,  *vrdisplaydisconnect*
 * *vrdisplayactivate* and *vrdisplaydeactivate* that fires at least on the
 * window object. We do not mitigate the event to fire and consequently, it is
 * possible that an adversary can learn that a VR display was (dis)connected but
 * there was no change in the result of the navigator.activeVRDisplays() API.
 *
 * The VRFrameData object carries a timestamp. As we allow wrapping of several
 * ways to obtain timestamps, we need to provide the same precision for the
 * VRFrameData object.
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
			parent_object_property: "activeVRDisplays",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_body: `
					return Promise.resolve(new window.Array());
				`,
		},
		{
			/**
			 * \see https://developer.mozilla.org/en-US/docs/Web/API/VRFrameData/timestamp
			 * \note that at the time of the writing of the prototype, we did not have
			 * access to a VR display and this code was not tested.
			 */
			parent_object: "VRFrameData.prototype",
			parent_object_property: "timestamp",
			wrapped_objects: [],
			helping_code: remember_past_ts_values + `let origGet = Object.getOwnPropertyDescriptor(VRFrameData.prototype, "timestamp").get`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "VRFrameData.prototype",
					parent_object_property: "timestamp",
					wrapped_objects: [],
					/**  \brief replaces VRFrameData.timestamp getter to create
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
