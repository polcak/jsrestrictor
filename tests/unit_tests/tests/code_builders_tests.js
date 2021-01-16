//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020 Martin Bednar
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

/// <reference path="../../common/code_builders.js">

describe("Code builders", function() {
	describe("Function build_code", function() {
		var my_very_simple_wrapper = {
			wrapped_objects: [],
			parent_object: "window",
			parent_object_property: "Float64Array"
		};
		var my_simple_wrapper = {
			wrapped_objects: [],
			parent_object: "window",
			parent_object_property: "Float64Array",
			post_wrapping_code: [{
				code_type: "object_properties",
				parent_object: "navigator",
				parent_object_property: "deviceMemory",
				wrapped_objects: [],
				wrapped_properties: [{
					property_name: "get",
					property_value: "function(){return 4;}"
				}]
			}]
		};
		var my_complicated_wrapper = {
			wrapped_objects: [{
				original_name: "XMLHttpRequest",
				wrapped_name: "originalXMLHttpRequest"
			}],
			parent_object: "window",
			parent_object_property: "Float64Array",
			post_wrapping_code: [{
				code_type: "object_properties",
				parent_object: "navigator",
				parent_object_property: "deviceMemory",
				wrapped_objects: [],
				wrapped_properties: [{
					property_name: "get",
					property_value: "function(){return 4;}"
				}]
			}]
		};
		it("should be defined.",function() {
			expect(build_code).toBeDefined();
		});
		it("should throw error when no wrapper is given as an argument.",function() {
			expect(function() {build_code()}).toThrowError();
		});
		it("should return string.",function() {
			expect(build_code(my_very_simple_wrapper)).toEqual(jasmine.any(String));
		});
		xit("should return right code when argument is very simple wrapper.",function() {
			expect(build_code(my_very_simple_wrapper)).toBe("(function(...args) {Object.freeze(window.Float64Array);})();");
		});
		xit("should return right code when argument is simple wrapper.",function() {
			expect(build_code(my_simple_wrapper)).toBe(`(function(...args) {
		if (!("deviceMemory" in navigator)) {
			// Do not wrap an object that is not defined, e.g. because it is experimental feature.
			// This should reduce fingerprintability.
			return;
		}
	descriptor = Object.getOwnPropertyDescriptor(
			navigator, "deviceMemory");
		if (descriptor === undefined) {
			descriptor = { // Originally not a descriptor
				get: navigator.deviceMemory,
				set: undefined,
				configurable: false,
				enumerable: true,
			};
		}
	
			originalPDF = descriptor["get"];
			replacementPD = function(){return 4;};
			descriptor["get"] = replacementPD;
			if (replacementPD instanceof Function) {
				original_functions[replacementPD.toString()] = originalPDF.toString();
			}
		Object.defineProperty(navigator,
		"deviceMemory", descriptor);
	Object.freeze(window.Float64Array);})();`);
		});
		xit("should return right code when argument is complicated wrapper.",function() {
			expect(build_code(my_complicated_wrapper)).toBe(`(function(...args) {
			var originalXMLHttpRequest = XMLHttpRequest;
			if (originalXMLHttpRequest === undefined) {
				// Do not wrap an object that is not defined, e.g. because it is experimental feature.
				// This should reduce fingerprintability.
				return;
			}
		
		if (!("deviceMemory" in navigator)) {
			// Do not wrap an object that is not defined, e.g. because it is experimental feature.
			// This should reduce fingerprintability.
			return;
		}
	descriptor = Object.getOwnPropertyDescriptor(
			navigator, "deviceMemory");
		if (descriptor === undefined) {
			descriptor = { // Originally not a descriptor
				get: navigator.deviceMemory,
				set: undefined,
				configurable: false,
				enumerable: true,
			};
		}
	
			originalPDF = descriptor["get"];
			replacementPD = function(){return 4;};
			descriptor["get"] = replacementPD;
			if (replacementPD instanceof Function) {
				original_functions[replacementPD.toString()] = originalPDF.toString();
			}
		Object.defineProperty(navigator,
		"deviceMemory", descriptor);
	Object.freeze(window.Float64Array);})();`);
		});
	});
	describe("Function wrap_code", function() {
		beforeAll(function() {
			for (let key in levels) {
				levels[key].wrappers = wrapping_groups.get_wrappers(levels[key]);
			}
		});
		it("should be defined.",function() {
			expect(wrap_code).toBeDefined();
		});
		it("should return undefined when no wrappers are given as an argument.",function() {
			expect(wrap_code([])).toBe(undefined);
		});
		it("should throw error when parametr is not iterable.",function() {
			expect(function() {wrap_code(5)}).toThrowError();
		});
		xit("should return wrapped code when wrappers are given.",function() {
			var rnd_num_regex = /\/\/ \d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/g;
			
			for (level of [0,1,2,3]) {
			for (wrapper of levels[level].wrappers) {
			expect(wrap_code([wrapper]).replace(rnd_num_regex,"123456789")).toEqual(
			(`(function() {
		var original_functions = {};
		`
			+
			build_code(build_wrapping_code[wrapper[0]], wrapper.slice(1))
			+
			`
			var originalToStringF = Function.prototype.toString;
			var originalToStringStr = Function.prototype.toString();
			Function.prototype.toString = function() {
				var currentString = originalToStringF.call(this);
				var originalStr = original_functions[currentString];
				if (originalStr !== undefined) {
					return originalStr;
				}
				else {
					return currentString;
				}
			};
			original_functions[Function.prototype.toString.toString()] = originalToStringStr;
		})();`).replace(rnd_num_regex,"123456789")
			);
			}
			}
		});
	});
});
