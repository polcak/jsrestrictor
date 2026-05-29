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

	describe("Function wrap_code", function() {
		it("should return undefined when no wrappers defined.",function() {
			expect(wrap_code([])).toBe(undefined);
		});
		it("should return patching code when a wrapper is defined.",function() {
			let code = wrap_code([["window.Geolocation", 3]]);
			expect(typeof code).toBe("string");
			expect(code.length).toBeGreaterThanOrEqual(100);
			expect(code.includes("Geolocation")).toBe(true);
			expect(code.includes("XRAY")).toBe(true);
			expect(code.includes("WrapHelper")).toBe(true);
			expect(code.includes("unX")).toBe(true);
			//expect(code.includes("domainHash")).toBe(true);
			expect(code.includes("// FPD_S")).toBe(true);
			expect(code.includes("// FPD_E")).toBe(true);
			expect(code.includes("fpd")).toBe(false);
			expect(code.includes("updateCount")).toBe(true);
		});
	});
	describe("Function generate_code", function() {
		it("should return empty string when no code passed.",function() {
			expect(generate_code("")).toBe("");
		});
		it("should return patching code when a code to wrap is defined.",function() {
			let code = generate_code("var test = 1;");
			expect(typeof code).toBe("string");
			expect(code.length).toBeGreaterThanOrEqual(100);
			expect(code.includes("var test = 1;")).toBe(true);
			expect(code.includes("XRAY")).toBe(true);
			expect(code.includes("WrapHelper")).toBe(true);
			expect(code.includes("unX")).toBe(true);
			//expect(code.includes("domainHash")).toBe(true);
			expect(code.includes("fp_call_count")).toBe(false);
			expect(code.includes("updateCount")).toBe(true);
		});
	});
	describe("serializeUCA that helps to serialize Maps and Sets", function() {
		it("should be defined.",function() {
			expect(serializeUCA).toBeDefined();
		});
		it("should handle empty map.",function() {
			var testMap = new Map();
			testMap.toJSON = serializeUCA;
			var serialized = JSON.stringify(testMap);
			expect(typeof serialized).toBe('string');
			var deserialized = JSON.parse(serialized);
			expect(typeof deserialized).toBe('object');
			expect(deserialized).not.toBeNull();
		});
		it("should work with JSON.stringify with a realistic simple map.",function() {
			var wrapperStr = "window.Date#get";
			var stackStr = "Error: Test\n    at REPL16:1:13\n    at ContextifyScript.runInThisContext (node:vm:137:12)\n    at REPLServer.defaultEval (node:repl:598:22)\n    at bound (node:domain:433:15)\n    at REPLServer.runBound [as eval] (node:domain:444:12)\n    at REPLServer.onLine (node:repl:927:10)\n    at REPLServer.emit (node:events:536:35)\n    at REPLServer.emit (node:domain:489:12)\n    at [_onLine] [as _onLine] (node:internal/readline/interface:416:12)\n    at [_line] [as _line] (node:internal/readline/interface:887:18)";
			var testMap = new Map();
			testMap.set(wrapperStr, {
				args: new Map(),
				stack: new Set([stackStr]),
			});
			testMap.toJSON = serializeUCA;
			var serialized = JSON.stringify(testMap);
			expect(typeof serialized).toBe('string');
			var deserialized = JSON.parse(serialized);
			expect(typeof deserialized).toBe('object');
			expect(deserialized).not.toBeNull();
			expect(Object.keys(deserialized)).toContain(wrapperStr);
			expect(typeof deserialized[wrapperStr]).toBe('object');
			expect(deserialized[wrapperStr]).not.toBeNull();
			expect(Object.keys(deserialized[wrapperStr])).toContain("args");
			expect(Object.keys(deserialized[wrapperStr])).toContain("stack");
			expect(deserialized[wrapperStr].stack).toContain(stackStr);
		});
	});
	describe("FPD code that registers the APIs called", function() {
		beforeEach(function() {
			// Neceassary due to the limitations that fpd_updateCountCode needs to hold
			// a string specifying the code for other test cases but we need to be able
			// to test the internals. This kind of duplicates the content of
			// fpd_updateCountCode. FIXME automatically populate based on the content of
			// fpd_updateCountCode.
			set_global_variable("UPDATE_COUNT_IMMEDIATE_WRAPPERS", 5);
			set_global_variable("UPDATE_COUNT_IMMEDIATE_CALLS", 10);
			set_global_variable("UPDATE_COUNT_FLUSH_INTERVAL", 100);
			var testMap = new Map();
			testMap.toJSON = serializeUCA;
			set_global_variable("updateCountAggregate", testMap);
			set_global_variable("updateCountAggregateCurrentCalls", 0);
			// Do not wait for the timer interval, let Jasmine simulate the time
			jasmine.clock().install();
		});
		afterEach(function() {
			jasmine.clock().uninstall();
		});
		it("should define updateCount function.",function() {
			expect(updateCount).toBeDefined();
		});
		it("updateCount function should not propagate exceptions.",function() {
			expect(function() {updateCount("a", "b", 1)}).not.toThrow();
		});
		it("updateCount function should propagate information on the called APIs through the port when total count is 1.",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 1
			};
			updateCount(
				test_data.wrapperName,
				test_data.wrapperType,
				test_data.wrapperArgs,
				test_data.stack,
				test_data.totalCount
			);
			let received_data = updateCount_calls.pop();
			expect(updateCount_calls.length).toBe(0); // Check that only a single value was propagated
			let parsed = JSON.parse(received_data);
			expect(Object.keys(parsed).length).toBe(1); // Just one wrapper name+type registered
			let wrapper_labels = Object.keys(parsed)[0].split("#");
			expect(wrapper_labels.length).toBe(2);
			expect(wrapper_labels[0]).toBe(test_data.wrapperName);
			expect(wrapper_labels[1]).toBe(test_data.wrapperType);
			let wrapper_details = parsed[Object.keys(parsed)[0]];
			expect(wrapper_details.stack.length).toBe(1);
			expect(wrapper_details.stack[0]).toBe(test_data.stack);
			let argsMap = wrapper_details.args;
			expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
			expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
		});
		it("updateCount function should not immediately propagate information on the called APIs through the port when total count is 2.",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 2
			};
			updateCount(
				test_data.wrapperName,
				test_data.wrapperType,
				test_data.wrapperArgs,
				test_data.stack,
				test_data.totalCount
			);
			expect(updateCount_calls.length).toBe(0); // The call is delayed
			jasmine.clock().tick(1000); // Simulate that a second has passed
			let received_data = updateCount_calls.pop();
			expect(updateCount_calls.length).toBe(0); // Check that only a single value was propagated
			let parsed = JSON.parse(received_data);
			expect(Object.keys(parsed).length).toBe(1); // Just one wrapper name+type registered
			let wrapper_labels = Object.keys(parsed)[0].split("#");
			expect(wrapper_labels.length).toBe(2);
			expect(wrapper_labels[0]).toBe(test_data.wrapperName);
			expect(wrapper_labels[1]).toBe(test_data.wrapperType);
			let wrapper_details = parsed[Object.keys(parsed)[0]];
			expect(wrapper_details.stack.length).toBe(1);
			expect(wrapper_details.stack[0]).toBe(test_data.stack);
			let argsMap = wrapper_details.args;
			expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
			expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
		});
		it("updateCount function should propagate information on the called APIs through the port (UPDATE_COUNT_IMMEDIATE_WRAPPERS=1).",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 2
			};
			set_global_variable("UPDATE_COUNT_IMMEDIATE_WRAPPERS", 1);
			updateCount(
				test_data.wrapperName,
				test_data.wrapperType,
				test_data.wrapperArgs,
				test_data.stack,
				test_data.totalCount
			);
			let received_data = updateCount_calls.pop();
			expect(updateCount_calls.length).toBe(0); // Check that only a single value was propagated
			let parsed = JSON.parse(received_data);
			expect(Object.keys(parsed).length).toBe(1); // Just one wrapper name+type registered
			let wrapper_labels = Object.keys(parsed)[0].split("#");
			expect(wrapper_labels.length).toBe(2);
			expect(wrapper_labels[0]).toBe(test_data.wrapperName);
			expect(wrapper_labels[1]).toBe(test_data.wrapperType);
			let wrapper_details = parsed[Object.keys(parsed)[0]];
			expect(wrapper_details.stack.length).toBe(1);
			expect(wrapper_details.stack[0]).toBe(test_data.stack);
			let argsMap = wrapper_details.args;
			expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
			expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
		});
		it("updateCount function should propagate information on the called APIs through the port (UPDATE_COUNT_IMMEDIATE_CALLS=1).",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 2
			};
			set_global_variable("UPDATE_COUNT_IMMEDIATE_CALLS", 1);
			updateCount(
				test_data.wrapperName,
				test_data.wrapperType,
				test_data.wrapperArgs,
				test_data.stack,
				test_data.totalCount
			);
			let received_data = updateCount_calls.pop();
			expect(updateCount_calls.length).toBe(0); // Check that only a single value was propagated
			let parsed = JSON.parse(received_data);
			expect(Object.keys(parsed).length).toBe(1); // Just one wrapper name+type registered
			let wrapper_labels = Object.keys(parsed)[0].split("#");
			expect(wrapper_labels.length).toBe(2);
			expect(wrapper_labels[0]).toBe(test_data.wrapperName);
			expect(wrapper_labels[1]).toBe(test_data.wrapperType);
			let wrapper_details = parsed[Object.keys(parsed)[0]];
			expect(wrapper_details.stack.length).toBe(1);
			expect(wrapper_details.stack[0]).toBe(test_data.stack);
			let argsMap = wrapper_details.args;
			expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
			expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
		});
		it("updateCount function should propagate all information (single message).",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 2
			};
			const REPEAT = 4;
			for (let i=1; i <= REPEAT; i++) {
				updateCount(
					test_data.wrapperName + i.toString(),
					test_data.wrapperType,
					test_data.wrapperArgs,
					test_data.stack,
					test_data.totalCount
				);
			}
			expect(updateCount_calls.length).toBe(0); // The call is delayed
			jasmine.clock().tick(1000); // Simulate that a second has passed
			let received_data = updateCount_calls.pop();
			expect(updateCount_calls.length).toBe(0); // Check that there was just one message through the port
			let parsed = JSON.parse(received_data);
			expect(Object.keys(parsed).length).toBe(REPEAT); // All wrapper name+type propagated
			for (let i=1; i <= REPEAT; i++) {
				expect(Object.keys(parsed)).toContain(test_data.wrapperName + i.toString() + "#" + test_data.wrapperType);
				let wrapper_labels = Object.keys(parsed)[i-1].split("#");
				expect(wrapper_labels.length).toBe(2);
				expect(wrapper_labels[0].slice(0, -1)).toBe(test_data.wrapperName); // remove the last character (number as the keys may be iterated in any order
				expect(wrapper_labels[1]).toBe(test_data.wrapperType);
				let wrapper_details = parsed[Object.keys(parsed)[i-1]];
				expect(wrapper_details.stack.length).toBe(1);
				expect(wrapper_details.stack[0]).toBe(test_data.stack);
				let argsMap = wrapper_details.args;
				expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
				expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
			}
		});
		it("updateCount function should propagate all information (multiple messages).",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 2
			};
			const REPEAT = 15;
			const CALLS_PER_MESSAGE = 5;
			const MESSAGES = REPEAT / CALLS_PER_MESSAGE;
			for (let i=1; i <= REPEAT; i++) {
				updateCount(
					test_data.wrapperName + i.toString(),
					test_data.wrapperType,
					test_data.wrapperArgs,
					test_data.stack,
					test_data.totalCount
				);
			}
			expect(updateCount_calls.length).toBe(MESSAGES); // The propagation is not delayed
			for(let j=0; j < MESSAGES; j++) {
				let received_data = updateCount_calls.shift();
				let parsed = JSON.parse(received_data);
				expect(Object.keys(parsed).length).toBe(CALLS_PER_MESSAGE); // All wrapper name+type propagated
				for (let i=1; i <= CALLS_PER_MESSAGE; i++) {
					let full_i = j*CALLS_PER_MESSAGE+i;
					expect(Object.keys(parsed)).toContain(test_data.wrapperName + full_i.toString() + "#" + test_data.wrapperType);
					let wrapper_labels = Object.keys(parsed)[i-1].split("#");
					expect(wrapper_labels.length).toBe(2);
					expect(wrapper_labels[0].startsWith(test_data.wrapperName)).toBeTrue(); // ignore the number at the end (as the keys may be iterated in any order)
					expect(wrapper_labels[1]).toBe(test_data.wrapperType);
					let wrapper_details = parsed[Object.keys(parsed)[i-1]];
					expect(wrapper_details.stack.length).toBe(1);
					expect(wrapper_details.stack[0]).toBe(test_data.stack);
					let argsMap = wrapper_details.args;
					expect(Object.keys(argsMap).length).toBe(1); // Just one argument used
					expect(argsMap[Object.keys(argsMap)[0]]).toBe(1); // One call of the API
				}
			}
			expect(updateCount_calls.length).toBe(0); // Check that there are no more messages received
		});
		it("updateCount function should propagate all information on a single API (multiple messages).",function() {
			let updateCount_calls = [];
			let port = {
				postMessage: function(msg) {
												updateCount_calls.push(msg);
											}
			};
			set_global_variable("port", port);
			const test_data = {
				wrapperName: "wrapper name",
				wrapperType: "wrapper type",
				wrapperArgs: [1,2,3],
				stack: "the stack",
				totalCount: 0
			};
			const REPEAT = 20;
			for (let i=1; i <= REPEAT; i++) {
				let args = [...test_data.wrapperArgs];
				args.push(i);
				updateCount(
					test_data.wrapperName,
					test_data.wrapperType,
					args,
					test_data.stack + i.toString(),
					test_data.totalCount+i
				);
			}
			expect(updateCount_calls.length).toBe(4); // The propagation is not delayed
			jasmine.clock().tick(1000); // Simulate that a second has passed
			expect(updateCount_calls.length).toBe(5); // The last message is delayed
			let total_calls_notified = 0;
			while (updateCount_calls.length > 0) {
				let received_data = updateCount_calls.shift();
				let parsed = JSON.parse(received_data);
				expect(Object.keys(parsed).length).toBe(1); // Just one wrapper name+type registered
				let wrapper_labels = Object.keys(parsed)[0].split("#");
				expect(wrapper_labels.length).toBe(2);
				expect(wrapper_labels[0]).toBe(test_data.wrapperName);
				expect(wrapper_labels[1]).toBe(test_data.wrapperType);
				let wrapper_details = parsed[Object.keys(parsed)[0]];
				let argsMap = wrapper_details.args;
				let argsCount = Object.keys(argsMap).length;
				expect(wrapper_details.stack.length).toBe(argsCount); // The stack changes
				for (let i = 0; i < argsCount; i++) {
					expect(argsMap[Object.keys(argsMap)[i]]).toBe(1); // One call of the API per parameter
					expect(wrapper_details.stack[i].startsWith(test_data.stack)).toBeTrue(); // ignore the number at the end (as the keys may be iterated in any order)
					total_calls_notified++;
				}
			}
			expect(total_calls_notified).toBe(REPEAT);
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
