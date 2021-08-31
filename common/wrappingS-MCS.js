/** \file
 * \brief Wrappers for Media Capture and Streams standard
 *
 * \see https://www.w3.org/TR/mediacapture-streams/
 *
 *  \author Copyright (C) 2021  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
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
 * This file contains wrapper for MediaDevices.enumerateDevices https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
 * \ingroup wrappers
 *
 * The goal is to prevent fingerprinting by modifying return value of enumerateDevices.
 *
 * This wrapper operates with three levels of protection:
 *	* (0) - return promise with suffled array
 *	* (1) - return promise with shuffled array with additional 0-4 fake devices
 *	* (2) - return empty promise
 *
 *
 * Shuffling approach is inspired by the algorithms created by Brave Software <https://brave.com>
 * available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/mediastream/media_devices.cc
 *
 */
/*

/*
 * Create private namespace
 */
(function() {
	/**
	 * \brief change reurn value of enumerateDevices
	 *
	 * Depending on level chosen this function returns:
	 *	* (0,1) - promise with modified device array
	 *	* (2) - empty promise
	 */
	function farbleEnumerateDevices(){
		if(args[0] == 0 || args[0] == 1){
			return devices;
		}
		else if(args[0] == 2){
			return Promise.resolve([]);
		}
	}
	/**
	 * \brief create and return MediaDeviceInfo object
	 *
	 * \param browserEnum enum specifying browser 0 - Chrome 1 - Firefox
	 */
	function fakeDevice(browserEnum){
		var kinds = ["videoinput", "audioinput", "audiooutput"];
		var deviceId = browserEnum == 1 ? randomString(43, browserEnum)+ "=" : "";
		var ret = Object.create(MediaDeviceInfo.prototype);
		Object.defineProperties(ret, {
			deviceId:{
				value: deviceId
			},
			groupId:{
				value: deviceRandomString(browserEnum)
			},
			kind:{
				value: kinds[Math.floor(prng()*3)]
			},
			label:{
				value: ""
			}
		});
		ret.__proto__.toJSON = JSON.stringify;
		return ret;
	}
	/**
	 * \brief return random string for MediaDeviceInfo parameters
	 *
	 * \param browserEnum enum specifying browser 0 - Chrome 1 - Firefox
	 */
	function deviceRandomString(browserEnum) {
		var ret = "";
		var lengths = [64, 43];
		var charSets = ["abcdefghijklmnopqrstuvwxyz0123456789","abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"];
		var length = lengths[browserEnum];
		var charSet = charSets[browserEnum];
		for ( var i = 0; i < length; i++ ) {
				ret += charSet.charAt(Math.floor(Math.random() * charSet.length));
		}
		if(browserEnum == 1)
			ret += "=";
		return ret;
	}
	var wrappers = [
		{
			parent_object: "MediaDevices.prototype",
			parent_object_property: "enumerateDevices",
			wrapped_objects: [{
					original_name: "MediaDevices.prototype.enumerateDevices",
					wrapped_name: "origEnumerateDevices",
				}],
			helping_code: farbleEnumerateDevices+shuffleArray+deviceRandomString+randomString+fakeDevice+`
			  if(args[0]==0){
					var devices = origEnumerateDevices.call(navigator.mediaDevices);
					devices.then(function(result) {
						shuffleArray(result);
					});
				}
				if(args[0]==1){
					var until = Math.floor(prng()*4);
					var devices = origEnumerateDevices.call(navigator.mediaDevices);
					devices.then(function(result) {
						var browserEnum = 0;
						if(result[0].groupId.length == 44)
							browserEnum = 1;
						for(var i = 0; i < until; i++){
							result.push(fakeDevice(browserEnum));
						}
						shuffleArray(result);
					});
				}
				`,
			wrapping_function_args: "",
			/** \fn fake MediaDevices.prototype.enumerateDevices
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - promise with shuffled array
			 *	* (1) - promise with shuffled array with additional 0-4 fake devices
			 *	* (2) - empty promise
			 */
			wrapping_function_body: `
				return farbleEnumerateDevices();
				`,
		},
	]
	add_wrappers(wrappers);
})()
