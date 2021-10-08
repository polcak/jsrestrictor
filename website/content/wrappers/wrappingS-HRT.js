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
