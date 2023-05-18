//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020 Martin Bednar
//
// SPDX-License-Identifier: GPL-3.0-or-later
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
	});

	describe("Function insert_wasm_code", function() {
		it("should be defined.",function() {
			expect(insert_wasm_code).toBeDefined();
		});
		it("shouldn't change code without WASM_CODE placeholder.",function() {
			expect(insert_wasm_code("")).toEqual("");
			expect(insert_wasm_code("test")).toEqual("test");
		});
		it("should return valid code.",function() {
			var wasm = {ready: false};
			expect(wasm_code = insert_wasm_code("// WASM_CODE //")).not.toEqual("// WASM_CODE //");
			eval(wasm_code.replace('console.debug("WASM farbling module initialized");', ''));
		});

	});
});

describe("WebAssembly farbling module", function() {
	var wasm = {ready: false};
	beforeAll(function initWASM(done) {
		let code = insert_wasm_code("// WASM_CODE //");
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});

	it("should initialize properly.",function() {
		expect(wasm.ready).toBe(true);
	});
	it("should contain exported functions.",function() {
		expect(wasm.farbleBytes).toEqual(jasmine.any(Function));
		expect(wasm.farbleFloats).toEqual(jasmine.any(Function));
		expect(wasm.crc16).toEqual(jasmine.any(Function));
		expect(wasm.crc16Float).toEqual(jasmine.any(Function));
		expect(wasm.adjustWebGL).toEqual(jasmine.any(Function));
		expect(wasm.get).toEqual(jasmine.any(Function));
		expect(wasm.set).toEqual(jasmine.any(Function));
		expect(wasm.grow).toEqual(jasmine.any(Function));
	});
});
