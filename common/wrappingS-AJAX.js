//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "XMLHttpRequest",
			wrapped_objects: [
				{
					original_name: "XMLHttpRequest",
					wrapped_name: "originalXMLHttpRequest",
				},
			],
			helping_code: "var blockEveryXMLHttpRequest = args[0]; var confirmEveryXMLHttpRequest = args[1];",
			wrapping_function_args: "",
			wrapping_function_body: `
					var currentXMLHttpRequestObject = new originalXMLHttpRequest();
					var originalXMLHttpRequestOpenFunction = currentXMLHttpRequestObject.open;
					currentXMLHttpRequestObject.open = function(...args) {
						if (blockEveryXMLHttpRequest || (confirmEveryXMLHttpRequest && !confirm('There is a XMLHttpRequest on URL ' + args[1] + '. Do you want to continue?'))) {
							currentXMLHttpRequestObject.send = function () {}; // Prevents throwing an exception
							return undefined;
						}
						else {
							return originalXMLHttpRequestOpenFunction.call(this, ...args);
						}
					};
					return currentXMLHttpRequestObject;
				`,
		},
	]
	add_wrappers(wrappers);
})()
