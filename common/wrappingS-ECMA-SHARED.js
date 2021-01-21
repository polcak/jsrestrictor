//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Peter Hornak
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */

var proxyHandler = `{
	get(target, key, receiver) {
		let j;
		let slow = Math.floor(Math.random() * 10000)
		for (let i = 0; i < slow;) {
			j = i;
			i = j + 1;
		}
		let value = target[key];
		return typeof value == 'function' ? value.bind(target) : value;
	},
	set(target, key, value) {
		let j;
		let slow = Math.floor(Math.random() * 10000);
		for (let i = 0; i < slow;) {
			j = i;
			i = j + 1;
		}
		return Reflect.set(...arguments);
	}
}`;

(function () {
	var wrappingFunctionBody = `
	let _target = target;
	let _data = new originalF(target);
	var proxy = new Proxy(_data, ${proxyHandler});
	return proxy;
	`;

	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "SharedArrayBuffer",
			original_function: "window.SharedArrayBuffer",
			wrapped_objects: [],
			helping_code: `
				if (window.SharedArrayBuffer === undefined) {
					return;
				}
				let forbid = args[0];
			`,
			wrapping_function_args: `target`,
			wrapping_function_body: wrappingFunctionBody,
			post_replacement_code: `
				if (forbid) {
					delete(window.SharedArrayBuffer);
				}
			`,
		}
	];

	add_wrappers(wrappers);
})();
