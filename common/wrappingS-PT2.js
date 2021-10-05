/** \file
 * \brief Wrappers for Performance Timeline (Level 2) standard
 *
 * \see https://w3c.github.io/performance-timeline
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2020  Peter Hornak
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
 * This wrapper aims on prevention of microarchitectural attacks, clock-skew attacks, and other time
 * related attacks. The goal is to limit the precision of the time returned by the Performance Timeline API.
 *
 * \see https://www.fit.vut.cz/study/thesis/22308/?year=0&sup=Pol%C4%8D%C3%A1k, especially Sect.
 * 7.2.
 *
 * \see Tom Van Goethem, Wouter Joosen, Nick Nikiforakis. The Clock is Still Ticking:
Timing Attacks in the Modern Web. CCS'15. DOI: http://dx.doi.org/10.1145/2810103.2813632.
https://lirias.kuleuven.be/retrieve/389086
 *
 * \see Schwarz, M., Lipp, M. a Gruss, D. JavaScript Zero: Real JavaScript and Zero
 *      Side-Channel Attacks. NDSS'18.
 *
 * \see Schwarz M., Maurice C., Gruss D., Mangard S. (2017) Fantastic Timers and Where to Find Them: High-Resolution Microarchitectural Attacks in JavaScript. In: Kiayias A. (eds) Financial Cryptography and Data Security. FC 2017. Lecture Notes in Computer Science, vol 10322. Springer, Cham. https://doi.org/10.1007/978-3-319-70972-7_13 
 *
 * The wrappers support the following behaviour:
 *
 * * Round timestamp: Limit the precision by removing (a part of) the decimal part of the timestamp.
 * * Randomize after rounding: Create a fake decimal part to confuse attackers and to create
 *   timestamps that look similar to expected timestamps.
 */


/*
 * Create private namespace
 */
(function() {
	var helping_code = `var precision = args[0];
	var doNoise = args[1];
	var pastValues = {};
	${rounding_function}
	${noise_function}
				var func = rounding_function;
				if (doNoise === true){
					func = function(value, precision) {
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
			parent_object: "PerformanceEntry",
			parent_object_property: "prototype",
			wrapped_objects: [],
			helping_code: helping_code,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "PerformanceEntry.prototype",
					parent_object_property: "startTime",
					wrapped_objects: [
						{
							original_name: "Object.getOwnPropertyDescriptor(PerformanceEntry.prototype, 'startTime')['get']",
							wrapped_name: "originalST",
						},
					],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									let originalVal = originalST.call(this, ...arguments);
									return func(originalVal, precision);
								}`,
						},
					],
				},
				{
					code_type: "object_properties",
					parent_object: "PerformanceEntry.prototype",
					parent_object_property: "duration",
					wrapped_objects: [
						{
							original_name: "Object.getOwnPropertyDescriptor(PerformanceEntry.prototype, 'duration')['get']",
							wrapped_name: "originalD",
						},
					],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									let originalVal = originalD.call(this, ...arguments);
									return func(this.startTime + originalVal, precision) - this.startTime;
								}`,
						},
					],
				},
				{
					code_type: "object_properties",
					parent_object: "PerformanceEntry.prototype",
					parent_object_property: "toJSON",
					wrapped_objects: [],
					wrapped_properties: [
						{
							property_name: "value",
							property_value: `
								function() {
									let res = {
										entryType: this.entryType,
										name: this.name,
										startTime: this.startTime,
										duration: this.duration,
										toJSON: function() {return this},
									};
									return res.toJSON();
								}`,
						},
					],
				},
			],
		},
	]
	add_wrappers(wrappers);
})();
