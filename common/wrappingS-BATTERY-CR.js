//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: Copyright (C) 2020  Peter Hornak
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "navigator",
			parent_object_property: "getBattery",
			wrapped_objects: [],
			helping_code: `
				if (navigator.getBattery === undefined) {
					return;
				}
			`,
			original_function: "navigator.getBattery",
			wrapping_function_body: `
					return undefined; 
				`,
			post_replacement_code: `
				delete BatteryManager;
			`
		},
	];
	add_wrappers(wrappers);
})();
