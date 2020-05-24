//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2020  Peter Hornak
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
	var common_function_body = `
				var measures = origFunc.call(this, ...args);
				func = rounding_function;
				if (doNoise === true){
					func = noise_function
				}
				var ret = [];
				for (measure of measures) {
					ret.push({
						entryType: measure.entryType,
						name: measure.name,
						startTime: func(measure.startTime, precision),
						duration: func(measure.duration, precision),
						toJSON: function() {return this},
					});
				}
				return ret;
			`;
	var wrappers = [
		{
			parent_object: "performance",
			parent_object_property: "getEntries",
			wrapped_objects: [
				{
					original_name: "performance.getEntries",
					wrapped_name: "origFunc",
				}
			],
			helping_code: rounding_function + "var precision = args[0]; var doNoise = args[1];",
			wrapping_function_args: "...args",
			wrapping_function_body: common_function_body
		},
		{
			parent_object: "performance",
			parent_object_property: "getEntriesByName",
			wrapped_objects: [
				{
					original_name: "performance.getEntriesByName",
					wrapped_name: "origFunc",
				}
			],
			helping_code: rounding_function + "var precision = args[0]; var doNoise = args[1];",
			wrapping_function_args: "...args",
			wrapping_function_body: common_function_body
		},
		{
			parent_object: "performance",
			parent_object_property: "getEntriesByType",
			wrapped_objects: [
				{
					original_name: "performance.getEntriesByType",
					wrapped_name: "origFunc",
				}
			],
			helping_code: rounding_function + "var precision = args[0]; var doNoise = args[1];",
			wrapping_function_args: "...args",
			wrapping_function_body: common_function_body
		},
	]
	add_wrappers(wrappers);
})();
