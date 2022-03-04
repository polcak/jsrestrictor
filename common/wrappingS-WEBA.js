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

/**
*
* This algorithm is a modified version of the similar algorithm from
* Brave Software <https://brave.com>
* available at <https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc>
* Copyright (c) 2020 The Brave Authors.
*/
/*
 * Create private namespace
 */
(function() {

	var audioFarble = `
		function strToUint(str, length){
			var sub = str.substring(0,length);
			var ret = "";
			for (var i = sub.length-1; i >= 0; i--) {
					ret += ((sub[i].charCodeAt(0)).toString(2).padStart(8, "0"));
			}
			return "0b"+ret;
		}
		function lfsr_next32(v) {
			return ((v >>> 1) | (((v << 30) ^ (v << 29)) & (~(~0 << 31) << 30)));
		}
		function PseudoRandomSequence(seed){
			if (typeof this.v == 'undefined'){
					this.v = seed;
				}
			const maxUInt32n = 4294967295;
			this.v = lfsr_next32(this.v);
			return ((this.v>>>0) / maxUInt32n) / 10;
		}
		var fudge = BigInt(strToUint(domainHash,8))*1000n;
		var maxUInt64 = 18446744073709551615n;
		var fudge_factor = 0.99 + (Number(fudge / maxUInt64) / 100000);
		if(args[0] == 0){
			function farble(arr){
				for (var i = 0; i < arr.length; i++) {
					arr[i] = arr[i]*fudge_factor;
				}
			}
		}
		else if(args[0] == 1){
			var seed = Number(strToUint(domainHash,4));
			function farble(arr){
				for (var i = 0; i < arr.length; i++) {
					arr[i] = PseudoRandomSequence(seed);
				}
			}
		}
	`;
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
			helping_code: audioFarble,
			original_function: "parent.AudioBuffer.prototype.getChannelData",
			wrapping_function_args: "channel",
			wrapping_function_body: `
				var floatArr = origGetChannelData.call(this, channel);
				farble(floatArr);
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
			helping_code: audioFarble,
			original_function: "parent.AudioBuffer.prototype.copyFromChannel",
			wrapping_function_args: "destination, channel, start",
			wrapping_function_body: `
				origCopyFromChannel.call(this, destination, channel, start);
				farble(destination);
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
			helping_code:audioFarble,
			wrapping_function_args: "destination",
			wrapping_function_body: `
				origGetByteTimeDomainData.call(this, destination);
				farble(destination);
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
			helping_code:audioFarble,
			wrapping_function_args: "destination",
			wrapping_function_body: `
				origGetFloatTimeDomainData.call(this, destination);
				farble(destination);
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
			helping_code:audioFarble,
			wrapping_function_args: "destination",
			wrapping_function_body: `
				origGetByteFrequencyData.call(this, destination);
				farble(destination);
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
			helping_code:audioFarble,
			wrapping_function_args: "destination",
			wrapping_function_body: `
				origGetFloatFrequencyData.call(this, destination);
				farble(destination);
			`,
		}
	];
	add_wrappers(wrappers);
})();
