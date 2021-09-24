/** \file
 * \brief This file contains wrappers for the DOM API
 *
 * \see https://dom.spec.whatwg.org/
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
 * The events carry timestamp of their creation. As we allow wrapping of
 * several ways to obtain timestamps, we need to provide the same precision
 * for the Event API.
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
			`;
	var wrappers = [
		{
			/**
			 * \see https://dom.spec.whatwg.org/#ref-for-dom-event-timestamp%E2%91%A0
			 */
			parent_object: "Event.prototype",
			parent_object_property: "timeStamp",
			wrapped_objects: [],
			helping_code: remember_past_values + `let origGet = Object.getOwnPropertyDescriptor(Event.prototype, "timeStamp").get`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "Event.prototype",
					parent_object_property: "timeStamp",
					wrapped_objects: [],
					/**  \brief replaces Event.prototype.timeStamp getter to create
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
