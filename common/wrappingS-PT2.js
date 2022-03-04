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
