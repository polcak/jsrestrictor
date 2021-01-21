//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-FileCopyrightText: 2020  Peter Hornak
// SPDX-License-Identifier: GPL-3.0-or-later
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
