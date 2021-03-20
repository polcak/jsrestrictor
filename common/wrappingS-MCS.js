//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Libor Polcak
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

	function farbleEnumerateDevices(){
		if(args[0] == 0 || args[0] == 1){
			return devices;
		}
		else if(args[0] == 2){
			return new Promise((resolve) => resolve([]));
		}
	}
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
		return ret;
	}
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
			wrapping_function_body: `
				return farbleEnumerateDevices();
				`,
		},
	]
	add_wrappers(wrappers);
})()
