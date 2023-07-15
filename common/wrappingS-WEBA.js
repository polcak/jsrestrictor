/** \file
 * \brief Wrappers for Web Audio API
 *
 * \see https://webaudio.github.io/web-audio-api
 *
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2023  Martin Zmitko
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
 * This file contains wrappers for AudioBuffer and AnalyserNode related calls
 *  * https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 *  * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
 * \ingroup wrappers
 *
 * The goal is to prevent fingerprinting by modifying the values from functions which are reading/copying from AudioBuffer and AnalyserNode.
 * So the audio content of wrapped objects is the same as intended.
 *
 * The modified content can be either a white noise based on domain key or a fake audio data that is modified according to
 * domain key to be different than the original albeit very similar (i.e. the approach
 * inspired by the algorithms created by Brave Software <https://brave.com>
 * available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc.)
 *
 * \note Both approaches are detectable by a fingerprinter that checks if a predetermined audio
 * is the same as the read one. Nevertheless, the aim of the wrappers is
 * to limit the finerprintability.
 *
 * \bug Possibly inconsistant data between AudioBuffer and AnalyserNode wrappers.
 *
 * \bug Inconsistency between AudioBuffer.prototype.copyFromChannel and AudioBuffer.prototype.getChannelData.
 * AudioBuffer.prototype.copyFromChannel should call AudioBuffer.prototype.getChannelData wrapper
 * and then return result of the original call.
 */

/*
 * Create private namespace
 */
(function() {
	/**
	 * \brief Modifies audio data
	 *
	 * \param arr typed array with data - Uint8Array or Float32Array
	 *
	 * Depending on level chosen this function modifies arr content:
	 *	* (0) - multiplies values by fudge factor based on domain key
	 *	* (1) - replace values by white noise based on domain key
	 */
	function audioFarble(array){
		if (wasm.ready && wasm.grow(array.byteLength)) {
			try {
				farbleAudioWASM();
			} catch (e) {
				console.error("WebAssembly optimized farbling failed, falling back to JavaScript implementation", e);
				farbleAudioJS();
			}
		} else {
			farbleAudioJS();
		}
		
		function farbleAudioWASM() {
			const ARRAY_BYTE_LEN = array.byteLength;
			wasm.set(array, 0, true);
			const crc = wasm.crc16Float(ARRAY_BYTE_LEN);
			const mash = new Mash();
			mash.addData(' ');
			mash.addData(domainHash);
			mash.addData("AudioFarbling");
			mash.addData(crc);
			wasm.farbleFloats(ARRAY_BYTE_LEN, mash.n | 0);
			array.set(wasm.get(array.length, 0, true));
		}

		function farbleAudioJS() {
			console.debug(); /* Intentionally one the same line */let start_time = Date.now();
			// PRNG function needs to depend on the original audio, so that the same
			// audio is farbled the same way but different audio is farbled differently
			// See https://pagure.io/JShelter/webextension/issue/23
			const ARRAY_LEN = array.length;
			const MAXUINT32 = 4294967295;
			let crc = new CRC16();
			for (let i = 0; i < ARRAY_LEN; i++) {
				crc.single(array[i] * MAXUINT32);
			}
			console.debug("Timing audioFarble seed init", Date.now() - start_time);
			var thisaudio_prng = alea(domainHash, "AudioFarbling", crc.crc);
			console.debug("Timing audioFarble prng init", Date.now() - start_time);

			for (let i = 0; i < ARRAY_LEN; i++) {
				// Possible improvements:
				// Copy neighbor data (possibly with modifications)
				array[i] *= 0.99 + thisaudio_prng() / 100;
			}
			console.debug("Timing audioFarble farbled", Date.now() - start_time);
		}
	};

	function audioFarbleInt(array) {
		const ARRAY_LEN = array.byteLength;
		if (wasm.ready && wasm.grow(ARRAY_LEN)) {
			try {
				farbleAudioIntWASM();
			} catch (e) {
				console.error("WebAssembly optimized farbling failed, falling back to JavaScript implementation", e);
				farbleAudioIntJS();
			}
		} else {
			farbleAudioIntJS();
		}

		function farbleAudioIntWASM() {
			wasm.set(array);
			const crc = wasm.crc16(ARRAY_LEN);
			const mash = new Mash();
			mash.addData(' ');
			mash.addData(domainHash);
			mash.addData("AudioFarbling");
			mash.addData(crc);
			wasm.farbleBytes(ARRAY_LEN, mash.n | 0, false);
			array.set(wasm.get(ARRAY_LEN));
		}

		function farbleAudioIntJS() {
			console.debug(); /* Intentionally one the same line */let start_time = Date.now();
			// PRNG function needs to depend on the original audio, so that the same
			// audio is farbled the same way but different audio is farbled differently
			// See https://pagure.io/JShelter/webextension/issue/23
			let crc = new CRC16();
			for (let i = 0; i < ARRAY_LEN; i++) {
				crc.single(array[i]);
			}
			console.debug("Timing audioFarbleInt seed init", Date.now() - start_time);
			var thisaudio_prng = alea(domainHash, "AudioFarbling", crc.crc);
			console.debug("Timing audioFarbleInt prng init", Date.now() - start_time);

			for (let i = 0; i < ARRAY_LEN; i++) {
				if (thisaudio_prng.get_bits(1)) { // Modify data with probability of 0.5
					// Possible improvements:
					// Copy neighbor data (possibly with modifications)
					// Make bigger changes than xoring with 1
					array[i] ^= 1;
				}
			}
			console.debug("Timing audioFarbleInt farbled", Date.now() - start_time);
		}
	}
	function whiteNoiseInt(array) {
		noise_prng = alea(Date.now(), prng());
		const ARRAY_LEN = array.length;
		for (let i = 0; i < ARRAY_LEN; i++) {
			array[i] = (noise_prng() * 256) | 0;
		}
	}
	function whiteNoiseFloat(array) {
		const ARRAY_LEN = array.length;
		noise_prng = alea(Date.now(), prng());
		for (let i = 0; i < ARRAY_LEN; i++) {
			array[i] = (noise_prng() * 2) -1;
		}
	}
	/** @var String audioFarbleBody.
	 *
	 * Contains functions for modyfing audio data according to chosen level of protection -
	 * (0) - replace by white noise (range <0,0.1>) based on domain key
	 * (1) - multiply array by fudge factor based on domain key
	 */
	var audioFarbleBody = audioFarble;
	var wrappers = [
		{
			parent_object: "AudioBuffer.prototype",
			parent_object_property: "getChannelData",
			wrapped_objects: [
				{
					original_name: "AudioBuffer.prototype.getChannelData",
					wrapped_name: "origGetChannelData",
				}
			],
			helping_code: "var behaviour = args[0]; WrapHelper.shared['WEBA_gcd_pool'] = new Set(); WrapHelper.shared['WEBA_origGetChannelData'] = origGetChannelData;" + audioFarbleBody + whiteNoiseFloat,
			original_function: "parent.AudioBuffer.prototype.getChannelData",
			wrapping_function_args: "channel",
			/** \fn fake AudioBuffer.prototype.getChannelData
			 * \brief Returns modified channel data.
			 *
			 * Calls original function, which returns array with result, then calls function
			 * audioFarble with returned array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				var floatArr = origGetChannelData.call(this, channel);
				if (WrapHelper.shared['WEBA_gcd_pool'].has(floatArr)) {
					return floatArr;
				}
				if (behaviour == 0) {
					audioFarble(floatArr);
				}
				else if (behaviour == 1) {
					whiteNoiseFloat(floatArr);
				}
				WrapHelper.shared['WEBA_gcd_pool'].add(floatArr);
				setTimeout(function() {
						WrapHelper.shared['WEBA_gcd_pool'].delete(floatArr);
					}, 300000); // Remove the information after 5 minutes, this might need tweaking
				return floatArr;
			`,
		},
		{
			parent_object: "AudioBuffer.prototype",
			parent_object_property: "copyFromChannel",
			wrapped_objects: [
				{
					original_name: "AudioBuffer.prototype.copyFromChannel",
					wrapped_name: "origCopyFromChannel",
				}
			],
			helping_code: "var behaviour = args[0]; WrapHelper.shared['WEBA_gcd_pool'] = new Set();" +  audioFarbleBody + whiteNoiseFloat,
			original_function: "parent.AudioBuffer.prototype.copyFromChannel",
			wrapping_function_args: "destination, channel, start",
			/** \fn fake AudioBuffer.prototype.copyFromChannel
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				if (behaviour == 1) {
					whiteNoiseFloat(destination);
				}
				else if (behaviour == 0) {
					var floatArr = WrapHelper.shared['WEBA_origGetChannelData'].call(this, channel);
					origCopyFromChannel.call(this, destination, channel, start);
					if (WrapHelper.shared['WEBA_gcd_pool'].has(floatArr)) {
						// Already farbled, no additional farbling
					}
					else {
						audioFarble(destination);
					}
				}
			`,
		},
		{
			parent_object: "AnalyserNode.prototype",
			parent_object_property: "getByteTimeDomainData",
			wrapped_objects: [
				{
					original_name: "AnalyserNode.prototype.getByteTimeDomainData",
					wrapped_name: "origGetByteTimeDomainData",
				}
			],
			helping_code: "var behaviour = args[0];" +  audioFarbleInt + whiteNoiseInt,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getByteTimeDomainData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				if (behaviour == 0) {
					origGetByteTimeDomainData.call(this, destination);
					audioFarbleInt(destination);
				}
				else if (behaviour == 1) {
					whiteNoiseInt(destination);
				}
			`,
		},
		{
			parent_object: "AnalyserNode.prototype",
			parent_object_property: "getFloatTimeDomainData",
			wrapped_objects: [
				{
					original_name: "AnalyserNode.prototype.getFloatTimeDomainData",
					wrapped_name: "origGetFloatTimeDomainData",
				}
			],
			helping_code: "var behaviour = args[0];" +  audioFarbleBody + whiteNoiseFloat,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getFloatTimeDomainData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				if (behaviour == 0) {
					origGetFloatTimeDomainData.call(this, destination);
					audioFarble(destination);
				}
				else if (behaviour == 1) {
					whiteNoiseFloat(destination);
				}
			`,
		},
		{
			parent_object: "AnalyserNode.prototype",
			parent_object_property: "getByteFrequencyData",
			wrapped_objects: [
				{
					original_name: "AnalyserNode.prototype.getByteFrequencyData",
					wrapped_name: "origGetByteFrequencyData",
				}
			],
			helping_code: "var behaviour = args[0];" +  audioFarbleInt + whiteNoiseInt,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getByteFrequencyData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				if (behaviour == 0) {
					origGetByteFrequencyData.call(this, destination);
					audioFarbleInt(destination);
				}
				else if (behaviour == 1) {
					whiteNoiseInt(destination);
				}
			`,
		},
		{
			parent_object: "AnalyserNode.prototype",
			parent_object_property: "getFloatFrequencyData",
			wrapped_objects: [
				{
					original_name: "AnalyserNode.prototype.getFloatFrequencyData",
					wrapped_name: "origGetFloatFrequencyData",
				}
			],
			helping_code: "var behaviour = args[0];" +  audioFarbleBody + whiteNoiseFloat,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getFloatFrequencyData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				if (behaviour == 0) {
					origGetFloatFrequencyData.call(this, destination);
					audioFarble(destination);
				}
				else if (behaviour == 1) {
					whiteNoiseFloat(destination);
				}
			`,
		}
	];
	add_wrappers(wrappers);
})();
