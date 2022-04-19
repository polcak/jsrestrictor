/** \file
 * \brief This file contains wrappers for the Media Capabilities APIs
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API
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
 * `` provides access to `MediaKeySystemAccess` object that
 * allows to query supported codecs and other informations about the system.
 *
 * For example, visit https://www.fit.vutbr.cz/~polcak/jsr/hdcp/ and try a different browser or
 * computer.
 *
 * \see https://w3c.github.io/media-capabilities/ 
 *
 * We provide two modes of protection:
 *
 * 1. Strict approach prevents accessing the API.
 * 2. Farbling approach changes the output to a non-existing codec with 12.5% probability.
 */

/*
 * Create private namespace
 */
(function() {
	var helping_code = `var approach = args[0];`;
	function prepareConfig(config) {
		let changed = {
			type: config.type,
		};
		if (config.audio) {
			changed.audio = {
				contentType: prng().toString(),
				channels: config.audio.channels,
				bitrate: config.audio.bitrate,
				samplerate: config.audio.samplerate,
			};
		}
		else {
			changed.video = {
				contentType: prng().toString(),
				width: config.video.width,
				height: config.video.height,
				bitrate: config.video.bitrate,
				framerate: config.video.framerate,
			};
		}
		return forPage(changed);
	}
	var wrappers = [
		{
			parent_object: "MediaCapabilities.prototype",
			parent_object_property: "encodingInfo",
			wrapped_objects: [{
				original_name: "MediaCapabilities.prototype.encodingInfo",
				wrapped_name: "origF",
			}],
			helping_code: helping_code + prepareConfig,
			wrapping_function_args: "config",
			wrapping_function_body: `
					if (approach == 2) { 
						return new Promise(() => {}); // Never resolves
					}
					else if (approach == 1) { 
						return origF.call(this, prepareConfig(config));
					}
					else {
						let media = config.audio || config.video;
						var normalized = media.contentType.replace(/\s|\\n|\\t|\\r/g, '');
						var medcap_prng = alea(domainHash, "MediaCapabilities.prototype.encodingInfo", normalized);
						var rnd = medcap_prng.get_bits(3);
						if (rnd == 0) {
							return  origF.call(this, prepareConfig(config));
						}
						else {
							return origF.call(this, config);
						}
					}
				`,
		},
		{
			parent_object: "MediaCapabilities.prototype",
			parent_object_property: "decodingInfo",
			wrapped_objects: [{
				original_name: "MediaCapabilities.prototype.decodingInfo",
				wrapped_name: "origF",
			}],
			helping_code: helping_code + prepareConfig,
			wrapping_function_args: "config",
			wrapping_function_body: `
					if (approach == 2) { 
						return new Promise(() => {}); // Never resolves
					}
					else if (approach == 1) { 
						return origF.call(this, prepareConfig(config));
					}
					else {
						let media = config.audio || config.video;
						var normalized = media.contentType.replace(/\s|\\n|\\t|\\r/g, '');
						var medcap_prng = alea(domainHash, "MediaCapabilities.prototype.decodingInfo", normalized);
						var rnd = medcap_prng.get_bits(3);
						if (rnd == 0) {
							return  origF.call(this, prepareConfig(config));
						}
						else {
							return origF.call(this, config);
						}
					}
				`,
		},
	]
	add_wrappers(wrappers);
})()
