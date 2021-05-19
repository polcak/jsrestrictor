//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Matus Svancar
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
//  Copyright (c) 2020 The Brave Authors.

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
 */

/*
 * Create private namespace
 */
(function() {
	/**
	 * \brief makes number from substring of given string - should work as reinterpret_cast
	 * \param str String
	 * \param length Number specifying substring length
	 */
	function strToUint(str, length){
		var sub = str.substring(0,length);
		var ret = "";
		for (var i = sub.length-1; i >= 0; i--) {
				ret += ((sub[i].charCodeAt(0)).toString(2).padStart(8, "0"));
		}
		return "0b"+ret;
	};
	/**
	 * \brief shifts number bits to pick new number
	 * \param v number to shift
	 */
	function lfsr_next32(v) {
		return ((v >>> 1) | (((v << 30) ^ (v << 29)) & (~(~0 << 31) << 30)));
	};
	/**
	 * \brief seeded pseudo random sequence using lfsr_next32
	 * \param seed Number used as seed at first call
	 */
	function pseudoRandomSequence(seed){
		if (typeof this.v == 'undefined'){
				this.v = seed;
			}
		const maxUInt32n = 4294967295;
		this.v = lfsr_next32(this.v);
		return ((this.v>>>0) / maxUInt32n) / 10;
	};
	/**
	 * \brief Modifies audio data
	 *
	 * \param arr typed array with data - Uint8Array or Float32Array
	 *
	 * Depending on level chosen this function modifies arr content:
	 *	* (0) - multiplies values by fudge factor based on domain key
	 *	* (1) - replace values by white noise based on domain key
	 */
	function audioFarble(arr){
		if(args[0] == 0){
			var fudge = BigInt(strToUint(domainHash,8))*1000n;
			var maxUInt64 = 18446744073709551615n;
			var fudge_factor = 0.99 + (Number(fudge / maxUInt64) / 100000);
			for (var i = 0; i < arr.length; i++) {
				arr[i] = arr[i]*fudge_factor;
			}
		}
		else if(args[0] == 1){
		var seed = Number(strToUint(domainHash,4));
			for (var i = 0; i < arr.length; i++) {
				arr[i] = pseudoRandomSequence(seed);
			}
		}
	};
	/** @var String audioFarbleBody.
	 *
	 * Contains functions for modyfing audio data according to chosen level of protection -
	 * (0) - replace by white noise (range <0,0.1>) based on domain key
	 * (1) - multiply array by fudge factor based on domain key
	 */
	var audioFarbleBody = strToUint + lfsr_next32 + pseudoRandomSequence + audioFarble;
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
			helping_code: audioFarbleBody,
			original_function: "AudioBuffer.prototype.getChannelData",
			wrapping_function_args: "channel",
			/** \fn fake AudioBuffer.prototype.getChannelData
			 * \brief Returns modified channel data.
			 *
			 * Calls original function, which returns array with result, then calls function
			 * audioFarble with returned array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				var floatArr = origGetChannelData.call(this, channel);
				audioFarble(floatArr);
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
			helping_code: audioFarbleBody,
			original_function: "AudioBuffer.prototype.copyFromChannel",
			wrapping_function_args: "destination, channel, start",
			/** \fn fake AudioBuffer.prototype.copyFromChannel
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				origCopyFromChannel.call(this, destination, channel, start);
				audioFarble(destination);
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
			helping_code:audioFarbleBody,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getByteTimeDomainData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				origGetByteTimeDomainData.call(this, destination);
				audioFarble(destination);
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
			helping_code:audioFarbleBody,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getFloatTimeDomainData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				origGetFloatTimeDomainData.call(this, destination);
				audioFarble(destination);
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
			helping_code:audioFarbleBody,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getByteFrequencyData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				origGetByteFrequencyData.call(this, destination);
				audioFarble(destination);
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
			helping_code:audioFarbleBody,
			wrapping_function_args: "destination",
			/** \fn fake AnalyserNode.prototype.getFloatFrequencyData
			 * \brief Modifies destination array after calling original function.
			 *
			 * Calls original function, which writes data to destination array, then calls function
			 * audioFarble with destination array as argument - which changes array values according to chosen level.
			 */
			wrapping_function_body: `
				origGetFloatFrequencyData.call(this, destination);
				audioFarble(destination);
			`,
		}
	];
	add_wrappers(wrappers);
})();
