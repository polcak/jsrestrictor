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
				let cachedValue;
				if (arguments[0] !== undefined) {
					// Don't change lastValue if custom arguments are passed
					 cachedValue = lastValue;
				}
				var changedValue = func(wrapped.getTime(), precision);
				if (cachedValue) {
					// Don't change lastValue if custom arguments are passed
					 lastValue = cachedValue;
				}
				wrapped.setTime(changedValue);
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
					wrapping_function_body: "return func(originalDateConstructor.now.call(Date), precision);",
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
