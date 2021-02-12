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

/*
 * Create private namespace
 */
 (function() {

	var audioFarble = `
	function strToUint64(str){
		var sub = str.substring(0,8);
		var ret = "";
		for (var i = sub.length-1; i >= 0; i--) {
				ret += ((sub[i].charCodeAt(0)).toString(2).padStart(8, "0"));
		}
		return BigInt("0b"+ret);
	}
	var fudge = strToUint64(domainHash)*1000n;
	var maxUInt64 = 18446744073709551615n;
	var fudge_factor = 0.99 + (Number(fudge / maxUInt64) / 100000);
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
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.AudioBuffer.prototype.getChannelData",
			replace_original_function: true,
			wrapping_function_args: "channel",
			wrapping_function_body: `
				var floatArr = origGetChannelData.call(this,channel);
				for (var i = 0; i < floatArr.length; i++) {
					floatArr[i] = floatArr[i]*fudge_factor;
				}
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
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.AudioBuffer.prototype.copyFromChannel",
			replace_original_function: true,
			wrapping_function_args: "destination, channel, start",
			wrapping_function_body: `
				var dest = new Float32Array(destination.length);
				origCopyFromChannel.call(this, dest, channel, start);
				for (var i = 0; i < dest.length; i++) {
					dest[i] = dest[i]*fudge_factor;
				}
				destination = [...dest];
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
			helping_code:``,
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return origCopyFromChannel.call(this, ...args);
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
			helping_code:``,
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return origGetByteFrequencyData.call(this, ...args);
			`,
		}
 	];
 	add_wrappers(wrappers);
 })();
