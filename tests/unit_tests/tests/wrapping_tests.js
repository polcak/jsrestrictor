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

/// <reference path="../../common/wrapping.js">

describe("Wrapping", function() {
	describe("Object build_wrapping_code", function() {		
		it("should be defined.",function() {
			expect(build_wrapping_code).toBeDefined();
		});
	});
	describe("Function add_wrappers", function() {
		var HRT_wrappers = [
			{
				parent_object: "Performance.prototype",
				parent_object_property: "now",
				wrapped_objects: [
					{
						original_name: "Performance.prototype.now",
						wrapped_name: "origNow",
					}
				],
				helping_code: rounding_function + noise_function + `
					let precision = args[0];
					let doNoise = args[1];
				`,
				wrapping_function_args: "",
				wrapping_function_body: `
						var originalPerformanceValue = origNow.call(window.performance);
						var limit_precision = doNoise ? noise_function : rounding_function;
						return limit_precision(originalPerformanceValue, precision);
				`,
			},
		];
		afterEach(function() {
			setTimeout(function(){ build_wrapping_code = {}; }, 3000);
		});
		it("should be defined.",function() {
			expect(add_wrappers).toBeDefined();
		});
		it("should return nothing.",function() {
			expect(add_wrappers(HRT_wrappers)).toBe(undefined);
		});
		it("should add wrappers to object build_wrapping_code.",function() {
			add_wrappers(HRT_wrappers);
			for (wrapper of HRT_wrappers) {
				expect(build_wrapping_code[wrapper.parent_object + "." + wrapper.parent_object_property]).toBe(wrapper);
			}
		});
	});
	describe("Function rounding_function", function() {
		it("should be defined.",function() {
			expect(rounding_function).toBeDefined();
		});
		it("should return number.",function() {
			eval(rounding_function);
			expect(rounding_function(123123,0)).toEqual(jasmine.any(Number));
		});
		it("should return NaN when number is undefined.",function() {
			eval(rounding_function);
			expect(rounding_function(undefined,0)).toEqual(NaN);
		});
		it("should return NaN when precision is undefined.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789,undefined)).toEqual(NaN);
		});
		it("should return rounded number for whole number when precision is from {0,1,2}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789,2)).toBe(123456780);
			expect(rounding_function(12,2)).toBe(10);
			expect(rounding_function(123456789,1)).toBe(123456700);
			expect(rounding_function(123,1)).toBe(100);
			expect(rounding_function(123456789,0)).toBe(123456000);
			expect(rounding_function(1234,0)).toBe(1000);
		});
		it("should not round number for whole number when precision is 3.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789,3)).toBe(123456789);
		});
		it("should return rounded number for whole number when precision is from {-1,-2,-3}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789,-1)).toBe(123450000);
			expect(rounding_function(123456789,-2)).toBe(123400000);
			expect(rounding_function(123456789,-3)).toBe(123000000);
		});
		it("should return rounded number for float number when precision is from {0,1,2}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789.123,2)).toBe(123456780);
			expect(rounding_function(123456789.123,1)).toBe(123456700);
			expect(rounding_function(123456789.123,0)).toBe(123456000);
		});
		it("should return whole part of number for float number when precision is 3.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789.123,3)).toBe(123456789);
		});
		it("should return rounded number for float number when precision is from {-1,-2,-3}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789.123,-1)).toBe(123450000);
			expect(rounding_function(123456789.123,-2)).toBe(123400000);
			expect(rounding_function(123456789.123,-3)).toBe(123000000);
		});
		it("should return zero for number less than 10^(3-precision).",function() {
			eval(rounding_function);
			expect(rounding_function(1,2)).toBe(0);
			expect(rounding_function(12,1)).toBe(0);
			expect(rounding_function(123,0)).toBe(0);
		});
	});
	describe("Function noise_function", function() {		
		it("should be defined.",function() {
			expect(noise_function).toBeDefined();
		});
		it("should return number.",function() {
			eval(noise_function);
			expect(noise_function(123456.123,3)).toEqual(jasmine.any(Number));
		});
		it("should return 0 when number is undefined.",function() {
			eval(noise_function);
			expect(noise_function(undefined,0)).toBe(0);
		});
		it("should return 0 when precision is undefined.",function() {
			eval(noise_function);
			expect(noise_function(123456789,undefined)).toBe(0);
		});
		it("should return 0 when precision is 3 and greather.",function() {
			eval(noise_function);
			expect(noise_function(123456789,3)).toBe(0);
			expect(noise_function(123456789,4)).toBe(0);
			expect(noise_function(123456789,5)).toBe(0);
			expect(noise_function(123456789,6)).toBe(0);
		});
		it("should not return unchanged float number from argument when precision is 0.",function() {
			eval(noise_function);
			var number_changed = false;
			//whole part and decimal part are prime numbers
			const input_nums = [1009.1013, 1019.1021, 1031.1033, 1039.1049, 1051.1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,0) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged float number from argument when precision is 1.",function() {
			eval(noise_function);
			var number_changed = false;
			//whole part and decimal part are prime numbers
			const input_nums = [1009.1013, 1019.1021, 1031.1033, 1039.1049, 1051.1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,1) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged whole number from argument when precision is 0.",function() {
			eval(noise_function);
			var number_changed = false;
			//prime numbers
			const input_nums = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,0) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged whole number from argument when precision is 1.",function() {
			eval(noise_function);
			var number_changed = false;
			//prime numbers
			const input_nums = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,1) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
	});
});
