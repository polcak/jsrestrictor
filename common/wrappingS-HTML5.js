/** \file
 * \brief This file contains wrappers for HTML Audio and Video elements
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType
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
 * Supported codecs (multimedia media types) can be misued for fingerprinting,
 * see for example the [FPMon paper](https://fpmon.github.io/fingerprinting-monitor/files/FPMON.pdf).
 *
 * JShelter provides two modes of protection:
 *
 * 1. Strict approach returns all media types as not supported.
 * 2. Modifies the output of probably/maybe supported codecs.
 */

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "HTMLMediaElement.prototype",
			parent_object_property: "canPlayType",
			wrapped_objects: [{
				original_name: "HTMLMediaElement.prototype.canPlayType",
				wrapped_name: "origF",
			}],
			helping_code: `var approach = args[0];`,
			wrapping_function_args: "media, ...args",
			wrapping_function_body: `
					if ((approach == 2) || (approach == 1)) { 
						return "";
					}
					else {
						var normalized = media.replace(/\s|\\n|\\t|\\r/g, '');
						var origVal = origF.call(this, media);
						if (origVal === "") {
							return origVal;
						}
						else {
							var medcap_prng = alea(domainHash, "MediaCapabilities.prototype.encodingInfo", normalized);
							var rnd = medcap_prng.get_bits(1);
							if (rnd == 0) {
								return "probably";
							}
							else {
								return "maybe";
							}
						}
					}
				`,
		},
	]
	add_wrappers(wrappers);
})()
