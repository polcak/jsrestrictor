/** \file
 * \brief Wrappers for the Date object
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
 * related attacks. The goal is to limit the precision of the time returned by the Date object.
 *
 * \see <https://www.fit.vut.cz/study/thesis/22308/?year=0&sup=Pol%C4%8D%C3%A1k>, especially Sect.
 * 7.2.
 *
 * \see Tom Van Goethem, Wouter Joosen, Nick Nikiforakis. The Clock is Still Ticking:
 * Timing Attacks in the Modern Web. CCS'15. [Link](https://lirias.kuleuven.be/retrieve/389086),
 * [DOI](http://dx.doi.org/10.1145/2810103.2813632)
 *
 * \see Schwarz, M., Lipp, M. a Gruss, D. JavaScript Zero: Real JavaScript and Zero
Side-Channel Attacks. NDSS'18.
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
	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "Date",
			wrapped_objects: [
				{
					original_name: "Date",
					wrapped_name: "originalDateConstructor",
				},
			],
			helping_code: rounding_function + noise_function +
				`
				var precision = args[0];
				var doNoise = args[1];
				var func = rounding_function;
				if (doNoise) {
					func = noise_function;
				}
				`,
			wrapping_function_args: "",
			wrapping_function_body: `
				var wrapped = new originalDateConstructor(...arguments);
				if (arguments[0] === undefined) {
					// Don't change value if custom arguments are passed
					var changedValue = func(wrapped.getTime(), precision);
					wrapped.setTime(changedValue);
				}
				return wrapped;
				`,
			wrapper_prototype: "originalDateConstructor",
			post_wrapping_code: [
				{
					code_type: "function_define",
					original_function: "originalDateConstructor.now",
					parent_object: "window.Date",
					parent_object_property: "now",
					wrapping_function_args: "",
					wrapping_function_body: "return func(originalF.call(Date), precision);",
				},
				{
					code_type: "function_export",
					parent_object: "window.Date",
					parent_object_property: "parse",
					export_function_name: "originalDateConstructor.parse",
				},
				{
					code_type: "function_export",
					parent_object: "window.Date",
					parent_object_property: "UTC",
					export_function_name: "originalDateConstructor.UTC",
				},
				{
					code_type: "assign",
					parent_object: "window.Date",
					parent_object_property: "prototype",
					value: "originalDateConstructor.prototype",
				},
				{
					code_type: "assign",
					parent_object: "window.Date.prototype",
					parent_object_property: "constructor",
					value: "window.Date",
				},
			]
		},
	]
	add_wrappers(wrappers);
})()
