//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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
	var wrappers = [
		{
			parent_object: "navigator",
			parent_object_property: "deviceMemory",
			wrapped_objects: [],
			helping_code: `
				var validValues = [0.25, 0.5, 1.0, 2.0, 4.0, 8.0];
				var ret = 4;
				var realValue = navigator.deviceMemory;
				if(args[0]!=2 && realValue==0.25){
					ret = realValue;
				}
				else if(args[0]==0){
					var maxIndex = validValues.indexOf(realValue);
					if(maxIndex == -1){
						maxIndex = validValues.length-1;
					}
					ret = validValues[Math.floor((prng()*(maxIndex+1)))];
				}
				else if(args[0]==1){
					ret = validValues[Math.floor(prng()*(validValues.length))];
				}
			`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "navigator",
					parent_object_property: "deviceMemory",
					wrapped_objects: [],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return ret;
								}`,
						},
					],
				}
			],
		},
	]
	add_wrappers(wrappers);
})();
