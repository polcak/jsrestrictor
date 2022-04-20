/** \file
 * \brief Wrappers for Cooperative Scheduling of Background Tasks API
 *
 * \see https://w3c.github.io/requestidlecallback/#the-requestidlecallback-method
 *
 *  \author Copyright (C) 2022  Libor Polcak
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
 * The `window.requestIdleCallback()` API can schedule background tasks
 * such that they do not introduce delays to other high priority tasks
 * that share the same event loop, such as input processing, animations
 * and frame compositing.
 *
 * But the API leaks information about the other tasks running in the
 * browser as it leaks information on currently scheduled tasks, vsync
 * deadlines, user-interaction and so on.
 *
 * JShelter modifies the return call to:
 *
 * 1. Never leak the information that the call was triggered by an
 * expired timeout.
 * 2. Fake the information on remaining time in synchronization with the
 * `Date.now()` wrapper. Returns up to 50% more time compared to the
 * original value.
 */

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "IdleDeadline.prototype",
			parent_object_property: "didTimeout",
			wrapped_objects: [],
			helping_code: ``,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "IdleDeadline.prototype",
					parent_object_property: "didTimeout",
					wrapped_objects: [],
					/**  \brief replaces IdleDeadline.prototype.didTimeout getter
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return false;
								}`,
						},
					],
				}
			],
		},
		{
			parent_object: "IdleDeadline.prototype",
			parent_object_property: "timeRemaining",
			wrapped_objects: [
				{
					original_name: "IdleDeadline.prototype.timeRemaining",
					wrapped_name: "originalF",
				},
			],
			helping_code: "var lastEnd = 0;",
			wrapping_function_args: "",
			wrapping_function_body: `
					let ret;
					let now = Date.now();
					if (now > lastEnd) {
						let originalTimeR = originalF.call(this);
						ret = prng() * originalTimeR * 1.5;
						lastEnd = now + ret;
					}
					else {
						ret = lastEnd - now;
					}
					return ret;
				`,
		},
	]
	add_wrappers(wrappers);
})();
