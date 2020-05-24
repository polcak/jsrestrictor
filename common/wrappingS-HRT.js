//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2020  Peter Hornak
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
	function changePropertyPrototype(name) {
		let descriptor = Object.getOwnPropertyDescriptor(PerformanceEntry.prototype, name);
		let originalF = descriptor['get'];
		let replacementF = function() {
			let originalVal = originalF.call(this, ...arguments);
			return func(originalVal, precision);
			// Replace this when injecting, to differ between startTime and duration functions
			'__name__';
		};
		descriptor['get'] = replacementF;
		original_functions[replacementF.toString()] = originalF.toString();
		Object.defineProperty(PerformanceEntry.prototype, name, descriptor);
	}

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
			helping_code: rounding_function + "var precision = args[0];",
			wrapping_function_args: "",
			wrapping_function_body: `
					var originalPerformanceValue = origNow.call(window.performance);
					return rounding_function(originalPerformanceValue, precision);
			helping_code: rounding_function + noise_function + `
				let precision = args[0];
				let doNoise = args[1];
				let lastValue = 0;
			`,
			wrapping_function_args: "",
			wrapping_function_body: `
					var originalPerformanceValue = origNow.call(window.performance);
					var func = rounding_function;
					if (doNoise === true){
						func = noise_function
					}
					return func(originalPerformanceValue, precision);
				`
		},
		{
			parent_object: "window",
			parent_object_property: "PerformanceEntry",
			wrapped_objects: [],
			helping_code: rounding_function + noise_function + `
			let precision = args[0];
			let doNoise = args[1];
			let lastValue = 0;
			var func = rounding_function;
			if (doNoise === true){
				func = noise_function
			}
			(${changePropertyPrototype.toString().split("__name__").join('"startTime"')})('startTime');
			(${changePropertyPrototype.toString().split("__name__").join('"duration"')})('duration');
			`
		}
	];
	add_wrappers(wrappers);
})();
