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
		it("should return right code when argument is very simple wrapper.",function() {
			expect(build_code(my_very_simple_wrapper).replace(/\s/g,'')).toBe("(function(...args){if(!undefined){Object.freeze(window.Float64Array);}})();".replace(/\s/g,''));
		});
	});
});
