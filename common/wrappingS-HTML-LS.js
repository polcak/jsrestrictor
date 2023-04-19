/** \file
 * \brief Wrappers for Workers
 *
 *  \author Copyright (C) 2019-2022  Libor Polcak
 *  \author Copyright (C) 2020  Peter Hornak
 *  \author Copyright (C) 2021  Matus Svancar
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
 * This wrapper aims on prevention of microarchitectural attacks. This
 * code was originally a part of [ChromeZero](https://github.com/IAIK/ChromeZero).
 *
 * The wrappers support the following behaviour:
 *
 * * Polyfill: Completely eliminates the paralelism.
 * * Randomly slow messages: Add noise to the `postMessage` method execution.
 *
 * \see Lipp, M., Gruss, D., Schwarz, M., Bidner, D., Maurice, C. et al. Practical
Keystroke Timing Attacks in Sandboxed JavaScript. In:. August 2017, s. 191–209.
ISBN 978-3-319-66398-2.
 *
 * \see Schwarz, M., Lipp, M. a Gruss, D. JavaScript Zero: Real JavaScript and Zero
 *      Side-Channel Attacks. NDSS'18.
 *
 * \see <https://www.fit.vut.cz/study/thesis/22374/?year=0&sup=Pol%C4%8D%C3%A1k>
 */



/*
 * Create private namespace
 */
(function() {
	var strictWorkerWrapperBody = `
		// We create a Worker to limit fingerprinting but we intentionally use a non-existing URL.
		return new originalF("https://[ff00::]/worker.js");
	`;

	var slowBody = `
		let _data = new originalF(path, ...args);
		let _old = _data.postMessage;
		_data.postMessage = function(message) {
			let delay = Math.floor(Math.random() * 10**9)
			let j;
			for (let i = 0; i < delay;) {
				j = i;
				i = j + 1;
			}
			return _old.call(_data, message);
		}
		return _data;
	`;

	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "hardwareConcurrency",
			wrapped_objects: [],
			helping_code: `
				var hw_prng = alea(domainHash, "Navigator.prototype.hardwareConcurrency");
				var ret = 2;
				if(args[0]==0){
					var realValue = navigator.hardwareConcurrency;
					ret = Math.floor(2+hw_prng()*(realValue-2));
				}
				else if(args[0]==1){
					ret = Math.floor(2+(hw_prng()*6));
				}
			`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					wrapped_name: "origConcurrency",
					wrapped_objects: [],
					parent_object: "Navigator.prototype",
					parent_object_property: "hardwareConcurrency",
					/**  \brief replaces navigator.hardwareConcurrency getter
					 *
					 * Depending on level chosen this property returns:
					 *	* (0) - random valid value from range [2 - real value]
					 *	* (1) - random valid value from range [2 - 8]
					 *	* (2) - 2
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return ret;
								}`,
						},
					],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "Worker",
			original_function: "window.Worker",
			wrapped_objects: [],
			helping_code: `
				let strictWrappers = args[0];
				let removeWorkers = args[1];
			`,
			wrapping_function_args: `path, ...args`,
			wrapping_function_body: `
			if (!removeWorkers && strictWrappers) {
				${strictWorkerWrapperBody}
			} else {
				${slowBody}
			}
			`,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					apply_if: "removeWorkers",
					delete_properties: ["Worker"],
				}
			],
		}
	]
	add_wrappers(wrappers);
})();
