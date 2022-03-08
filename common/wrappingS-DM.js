/** \file
 * \brief Wrappers for navigator.deviceMemory property
 *
 * \see https://xhr.spec.whatwg.org/
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 *  \license SPDX-License-Identifier: MPL-2.0
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
//  Alternatively, the contents of this file may be used under the terms
//  of the Mozilla Public License, v. 2.0, as described below:
//
//  This Source Code Form is subject to the terms of the Mozilla Public
//  License, v. 2.0. If a copy of the MPL was not distributed with this file,
//  You can obtain one at http://mozilla.org/MPL/2.0/.
//
//  \copyright Copyright (c) 2020 The Brave Authors.

/** \file
 * This file contains a wrapper for [navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory).
 * \ingroup wrappers
 *
 * The goal is to prevent fingerprinting by modifying the return value of the `navigator.deviceMemory` parameter.
 *
 * This wrapper operates with three levels of protection:
 *
 *	* (0) - return random valid value from range [0.25 - real value]
 *	* (1) - return random valid value from range [0.25 - 8]
 *	* (2) - return 4
 *
 * These approaches are inspired by the algorithms created by [Brave Software](https://brave.com)
 * available [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/frame/navigator_device_memory.cc).
 *
 */

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "deviceMemory",
			wrapped_objects: [],
			helping_code: `
				let dm_prng = alea(domainHash, "navigator.deviceMemory");
				var validValues = [0.25, 0.5, 1.0, 2.0, 4.0, 8.0];
				var ret = 4;
				var realValue = navigator.deviceMemory;
				if(args[0]!=2 && realValue==0.25){
					ret = realValue;
				}
				else if(args[0]==0){
					var maxIndex = validValues.indexOf(realValue);
					if(maxIndex == -1){
						maxIndex = validValues.length-1;
					}
					ret = validValues[Math.floor((dm_prng()*(maxIndex+1)))];
				}
				else if(args[0]==1){
					ret = validValues[Math.floor(dm_prng()*(validValues.length))];
				}
			`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "Navigator.prototype",
					parent_object_property: "deviceMemory",
					wrapped_objects: [],
					/**  \brief replaces navigator.deviceMemory getter
					 *
					 * Depending on level chosen this property returns:
					 *	* (0) - random valid value from range [0.25 - real value]
					 *	* (1) - random valid value from range [0.25 - 8]
					 *	* (2) - 4
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return ret;
								}`,
						},
					],
				}
			],
		},
	]
	add_wrappers(wrappers);
})();
