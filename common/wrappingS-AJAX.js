/** \file
 * \brief Wrappers for XMLHttpRequest standard
 *
 * \see https://xhr.spec.whatwg.org/
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2021  Giorgio Maone
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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
 * XHR may be misused to exfiltrate data from the browser to the server.
 * We provide a wrapper that either blocks all XHR requests or lets the
 * user decide.
 *
 * \bug There are two flaws in the current implementation:
 *
 *  * There are many ways (see e.g. https://github.com/cure53/HTTPLeaks) to replace
 *    XHR and consequently evade the wrapper. This can be mitigating by monitoring
 *    the requests using Web Request API.
 *  * The confirm method puts a lot of responsibility on the user who needs to
 *    have a good knowledge about the requests on each visited page.
 *
 * \note We expect to remove the wrapper once we release JShelter
 * with Fingerprint Detector (FPD). FPD should solve both issues above.
 */


/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "XMLHttpRequest.prototype",
			parent_object_property: "open",
			wrapped_objects: [
				{
					original_name: "XMLHttpRequest.prototype.open",
					wrapped_name: "originalOpen",
				},
			],
			helping_code: "var blockEveryXMLHttpRequest = args[0]; var confirmEveryXMLHttpRequest = args[1];",
			wrapping_function_args: "...args",
			wrapping_function_body: `
					let {XHR_blocked} = WrapHelper.shared;
					if (blockEveryXMLHttpRequest || (confirmEveryXMLHttpRequest && !confirm('There is a XMLHttpRequest on URL ' + args[1] + '. Do you want to continue?'))) {
						XHR_blocked.add(this);
						return [];
					}
					XHR_blocked.delete(this);
					return originalOpen.call(this, ...args);
				`,
		},
		{
			parent_object: "XMLHttpRequest.prototype",
			parent_object_property: "send",
			wrapped_objects: [
				{
					original_name: "XMLHttpRequest.prototype.send",
					wrapped_name: "originalSend",
				},
			],

			helping_code: "WrapHelper.shared.XHR_blocked = new WeakSet();",
			wrapping_function_args: "...args",
			wrapping_function_body: `
					if (!WrapHelper.shared.XHR_blocked.has(this)) return originalSend.call(this, ...args);
				`,
		},
	]
	add_wrappers(wrappers);
})()
