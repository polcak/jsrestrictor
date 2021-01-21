//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2021 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "MediaDevices.prototype",
			parent_object_property: "enumerateDevices",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_args: "",
			wrapping_function_body: `
				return new Promise((resolve) => resolve([]));
				`,
		},
	]
	add_wrappers(wrappers);
})()
