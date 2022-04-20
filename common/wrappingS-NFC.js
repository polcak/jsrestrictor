/** \file
 * \brief Wrappers for Web NFC API
 *
 * \see https://w3c.github.io/web-nfc/
 *
 *  \author Copyright (C) 2022  Libor Polcak
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 *  \license SPDX-License-Identifier: MPL-2.0
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
//  Alternatively, the contents of this file may be used under the terms
//  of the Mozilla Public License, v. 2.0, as described below:
//
//  This Source Code Form is subject to the terms of the Mozilla Public
//  License, v. 2.0. If a copy of the MPL was not distributed with this file,
//  You can obtain one at http://mozilla.org/MPL/2.0/.
//
//  \copyright Copyright (c) 2020 The Brave Authors.

/** \file
 * This file contains a wrapper for [Web NFC API](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API).
 * \ingroup wrappers
 *
 * This API is not broadly supported and we just disable all objects.
*/

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "NDEFMessage",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["NDEFMessage"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "NDEFReader",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["NDEFReader"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "NDEFRecord",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					delete_properties: ["NDEFRecord"],
				}
			],
		},
	];
	add_wrappers(wrappers);
})();
