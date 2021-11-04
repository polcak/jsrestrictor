/** \file
 * \brief This file contains wrappers for the current Virtual/Augmented Reality API (WebXR)
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
 * \see https://immersive-web.github.io/webxr/
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
 * navigator.xr allows any page script to learn the VR displays attached
 * to the computer and more.
 *
 * U. Iqbal, S. Englehardt and Z. Shafiq, "Fingerprinting the
 * Fingerprinters: Learning to Detect Browser Fingerprinting Behaviors,"
 * in 2021 2021 IEEE Symposium on Security and Privacy (SP), San Francisco,
 * CA, US, 2021 pp. 283-301 observed
 * (https://github.com/uiowa-irl/FP-Inspector/blob/master/Data/potential_fingerprinting_APIs.md)
 * that the orginal WebVR API is used in the wild to fingerprint users. As it is
 * likely that only a minority of users have a VR display connected and the API
 * provides additional information on the HW, it is likely that users with
 * a VR display connected are easily fingerprintable.
 *
 * As all the API calls are accessible through the navigator.xr API, we provide
 * a single mitigation. We disable the API completely. This might need to be
 * revised once this API is commonly enabled in browsers.
 */

(function() {
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "xr",
			wrapped_objects: [],
			helping_code: "",
			post_wrapping_code: [
					{
						code_type: "delete_properties",
						parent_object: "Navigator.prototype",
						delete_properties: ["xr"],
					}
				],
		},
	]
	add_wrappers(wrappers);
})()
