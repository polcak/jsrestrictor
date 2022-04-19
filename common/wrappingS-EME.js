/** \file
 * \brief This file contains wrappers for the EME standard
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/requestMediaKeySystemAccess
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
 * `Navigator.requestMediaKeySystemAccess()` provides access to `MediaKeySystemAccess` object that
 * allows to query supported encryption mechanisms and other information about the system.
 *
 * For example, visit https://www.fit.vutbr.cz/~polcak/jsr/hdcp/ and try a different browser or
 * computer.
 *
 * \see https://w3c.github.io/encrypted-media/
 * \see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/requestMediaKeySystemAccess
 * \see https://developer.mozilla.org/en-US/docs/Web/API/MediaKeySystemAccess
 * \see https://developer.mozilla.org/en-US/docs/Web/API/MediaKeySystemAccess/getConfiguration 
 *
 * We provide two modes of protection:
 *
 * 1. Strict approach prevents accessing the API.
 * 2. Farbling approach changes the output to a non-existing key system with 12.5% probability.
 */

/*
 * Create private namespace
 */
(function() {
	var helping_code = `var approach = args[0];`;
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "requestMediaKeySystemAccess",
			wrapped_objects: [{
				original_name: "Navigator.prototype.requestMediaKeySystemAccess",
				wrapped_name: "origMKSA",
			}],
			helping_code: helping_code,
			wrapping_function_args: "keySystem, queriedConfigs, ...args",
			wrapping_function_body: `
					if (approach == 2) { 
						return new Promise(() => {}); // Never resolves
					}
					else if (approach == 1) { 
						keySystem = "org.jshelter";
						return origMKSA.call(this, keySystem, queriedConfigs, ...args);
					}
					else {
						var eme_prng = alea(domainHash, "requestMediaKeySystemAccess", keySystem);
						var rnd = eme_prng.get_bits(3);
						if (rnd == 0) {
							keySystem = "org.jshelter";
							return origMKSA.call(this, keySystem, queriedConfigs, ...args);
						}
						else {
							return origMKSA.call(this, keySystem, queriedConfigs, ...args);
						}
					}
				`,
		},
	]
	add_wrappers(wrappers);
})()
