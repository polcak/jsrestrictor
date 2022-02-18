/** \file
 * \brief Wrappers for SharedArrayBuffer
 *
 *  \author Copyright (C) 2020  Peter Hornak
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

/** \file
 * \ingroup wrappers
 *
 * This wrapper aims on prevention of misusing `SharedArrayBuffer` to create perfect timers and to
 * perfrom microarchitectural attacks. This code was originally a part of [ChromeZero](https://github.com/IAIK/ChromeZero).
 *
 * \see https://www.fit.vut.cz/study/thesis/22374/?year=0&sup=Pol%C4%8D%C3%A1k, especially Sect. 5.1
 *
 * \see Schwarz M., Maurice C., Gruss D., Mangard S. (2017) Fantastic Timers and Where to Find Them: High-Resolution Microarchitectural Attacks in JavaScript. In: Kiayias A. (eds) Financial Cryptography and Data Security. FC 2017. Lecture Notes in Computer Science, vol 10322. Springer, Cham. https://doi.org/10.1007/978-3-319-70972-7_13
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

/*
 * Create private namespace
 */

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
