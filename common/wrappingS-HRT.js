/** \file
 * \brief Wrappers for High Resolution Time (Level 2) standard
 *
 * \see https://w3c.github.io/hr-time/
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
 * related attacks. The goal is to limit the precision of the time returned by the Performance API.
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
	var wrappers = [
		{
			parent_object: "Performance.prototype",
			parent_object_property: "now",
			wrapped_objects: [
				{
					original_name: "Performance.prototype.now",
					wrapped_name: "origNow",
				}
			],
			helping_code: rounding_function + noise_function + `
				let precision = args[0];
				let doNoise = args[1];
			`,
			wrapping_function_args: "",
			wrapping_function_body: `
					var originalPerformanceValue = origNow.call(window.performance);
					var limit_precision = doNoise ? noise_function : rounding_function;
					return limit_precision(originalPerformanceValue, precision);
			`,
		},
	];
	add_wrappers(wrappers);
})();
