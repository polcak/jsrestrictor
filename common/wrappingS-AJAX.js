//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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
