//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "navigator",
			parent_object_property: "deviceMemory",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "navigator",
					parent_object_property: "deviceMemory",
					wrapped_objects: [],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return 4;
								}`,
						},
					],
				}
			],
		},
	]
	add_wrappers(wrappers);
})();
