/** \file
 * \brief Wrappers for Idle Detection API
 *
 * \see https://wicg.github.io/idle-detection/
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
 * \see https://web.dev/idle-detection/
 * \see https://developer.mozilla.org/en-US/docs/Web/API/IdleDetector
 *
 * The Idle Detection API can detect inactive users and locked screens.
 * JShelter either removes the API (IdleDetector), or disables permission
 * requests and returns user activity and unlocked screen (for previously
 * granted permissions), or just always report user activity and unlocked
 * screen.
 *
 * \bug JShelter does not block events, so the page is notified that
 * something changed but it cannot read what changed.
 */

/*
 * Create private namespace
 */
(function() {
	var setArgs = `
		var deleteapi = (args[0] === 2);
		var disableapi = (args[0] === 1);
		var confuse = (args[0] === 0);
	`;
	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "IdleDetector",
			wrapped_objects: [],
			helping_code: setArgs,
			apply_if: "deleteapi",
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["IdleDetector"],
				}
			],
		},
		{
			parent_object: "IdleDetector",
			parent_object_property: "requestPermission",
			wrapped_objects: [],
			helping_code: setArgs,
			apply_if: "disableapi",
			wrapping_function_args: "",
			wrapping_function_body: `
					return Promise.resolve('denied');
				`,
		},
		{
			parent_object: "IdleDetector.prototype",
			parent_object_property: "screenState",
			helping_code: setArgs + `let originalF = Object.getOwnPropertyDescriptor(IdleDetector.prototype, "screenState").get;`,
			apply_if: "disableapi || confuse",
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "IdleDetector.prototype",
					parent_object_property: "screenState",
					wrapped_objects: [],
					/**  \brief replaces IdleDeadline.prototype.didTimeout getter
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									if (disableapi) {
										return null;
									}
									let orig = originalF.call(this);
									if (orig === null) {
										return orig;
									}
									return 'unlocked';
								}`,
						},
					],
				}
			],
		},
		{
			parent_object: "IdleDetector.prototype",
			parent_object_property: "userState",
			helping_code: setArgs + `let originalF = Object.getOwnPropertyDescriptor(IdleDetector.prototype,"userState").get;`,
			apply_if: "disableapi || confuse",
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "IdleDetector.prototype",
					parent_object_property: "userState",
					wrapped_objects: [],
					/**  \brief replaces IdleDeadline.prototype.didTimeout getter
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									if (disableapi) {
										return null;
									}
									let orig = originalF.call(this);
									if (orig === null) {
										return orig;
									}
									return 'active';
								}`,
						},
					],
				}
			],
		},
	]
	add_wrappers(wrappers);
})();
