/** \file
 * \brief Wrappers for Generic Sensor API
 *
 * \see https://www.w3.org/TR/generic-sensor/
 *
 *  \author Copyright (C) 2021  Radek Hranicky
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
 * MOTIVATION
 * The risk of using Generic Sensor API calls for device fingerprinting is
 * mentioned within the W3C Candidate Recommendation Draft, 29 July 2021
 * (https://www.w3.org/TR/2021/CRD-generic-sensor-20210729/#device-fingerprinting)
 * Documented threats include manufacturing imperfections and differences
 * that are unique to the concrete model of the device and can be used
 * for fingerprinting.
 *
 * We discovered another loophole in the `Sensor.timestamp` attribute. The value
 * describes when the last `Sensor.onreading` event occurred, in millisecond precision.
 * We observed the time origin is not the time of browsing context creation
 * but the last boot time of the device. Exposing such information is dangerous
 * as it allows to fingerprint the user easily. It is unlikely that two different
 * devices will boot at exactly the same time.
 *
 * Tested with the Magnetometer sensor on the following devices:
 * - Samsung Galaxy S21 Ultra; Android 11, kernel 5.4.6-215566388-abG99BXXU3AUE1, Build/RP1A.200720.012.G998BXXU3AUE1
 *   Chrome 94.0.4606.71 and Kiwi (Chromium) 94.0.4606.56
 * - Xiaomi Redmi Note 5; Android 9, kernel 4.4.156-perf+, Build/9 PKQ1.180901.001
 *   Chrome 94.0.4606.71
 *
 *
 * WRAPPING
 *
 * The wrapper thus protects device by changing the time origin to the browsing context
 * creation time, whereas the timestamp should still uniquely identify the reading.
 * This is achieved in the following way:
 * - At the first reading, we calculate the difference between the original value
 *   and performance.now(). This gives us the offset between 1) the device boot
 *   and 2) the page context initialization.
 * - On every reading, the offset is subtracted from the original value. The resulting
 *   value then uniquely identifies the reading sample without exposing the boot time.
 * - Like in the other time precision wrappers, the resulting timestamp is processed
 *   by the mitigation function before return. The mitigation may round and (optionally)
 *   add noise to the resulting timestamp.
 *
 *
 * POSSIBLE IMPROVEMENTS
 * in protection level 2, the timestamp origin may be set to a random value based
 * on the session hash. This can serve as a "fake boot time."
 */

 /*
  * Create private namespace
  */
 (function() {

  var remember_past_values = `var precision = args[0];
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
 				var offsetCompStartPageStart = undefined;
 			`;

 	var wrappers = [
 		{
 			/**
 			 * \see https://dom.spec.whatwg.org/#ref-for-dom-event-timestamp%E2%91%A0
 			 */
 			parent_object: "Sensor.prototype",
 			parent_object_property: "timestamp",
 			wrapped_objects: [],
 			helping_code: remember_past_values + `let origGet = Object.getOwnPropertyDescriptor(Sensor.prototype, "timestamp").get`,
 			post_wrapping_code: [
 				{
 					code_type: "object_properties",
 					parent_object: "Sensor.prototype",
 					parent_object_property: "timestamp",
 					wrapped_objects: [],
 					/**  \brief replaces Sensor.prototype.timestamp getter to create
 					 * a timestamp with the desired precision.
 					 */
 					wrapped_properties: [
 						{
 							property_name: "get",
 							property_value: `
                function() {
                  orig_val = origGet.call(this);
                  if (typeof orig_val != 'number') {
                    // Sensor is not available or there is no reading yet.
                    return orig_val;
                  }
									if (offsetCompStartPageStart === undefined) {
                    // The offset has not been set yet so it needs to be calculated.
										offsetCompStartPageStart = orig_val - performance.now();
									}
									return mitigationF(orig_val - offsetCompStartPageStart, precision);
								}`,
 						},
 					],
 				}
 			],
 		},
 	]
 	add_wrappers(wrappers);
 })()
