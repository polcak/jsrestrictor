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
		it("should return rounded number for whole number when precision is from {10,100,1000}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789,10)).toBe(123456780);
			expect(rounding_function(12,10)).toBe(10);
			expect(rounding_function(123456789,100)).toBe(123456700);
			expect(rounding_function(123,100)).toBe(100);
			expect(rounding_function(123456789,1000)).toBe(123456000);
			expect(rounding_function(1234,1000)).toBe(1000);
		});
		it("should return rounded number for float number when precision is from {0,1,2}.",function() {
			eval(rounding_function);
			expect(rounding_function(123456789.123,10)).toBe(123456780);
			expect(rounding_function(123456789.123,100)).toBe(123456700);
			expect(rounding_function(123456789.123,1000)).toBe(123456000);
		});
		it("should return zero for number less than 10^(3-precision).",function() {
			eval(rounding_function);
			expect(rounding_function(1,10)).toBe(0);
			expect(rounding_function(12,100)).toBe(0);
			expect(rounding_function(123,1000)).toBe(0);
		});
	});
	describe("Function noise_function", function() {		
		it("should be defined.",function() {
			expect(noise_function).toBeDefined();
		});
		it("should return number.",function() {
			eval(noise_function);
			expect(noise_function(123456.123,1000)).toEqual(jasmine.any(Number));
		});
		it("should return 0 when precision is undefined.",function() {
			eval(noise_function);
			expect(noise_function(123456789,undefined)).toBe(0);
		});
		it("should return a number in a monotonous sequence.",function() {
			eval(noise_function);
			const input_nums = [1009.1013, 1019.1021, 1031.1033, 1039.1049, 1051.1061];
			const precs = [10, 100, 1000];
			for (const prec of precs) {
				let last_number = 0;
				for (const orig_num of input_nums) {
					let result = noise_function(orig_num, prec);
					expect(result).toBeGreaterThanOrEqual(last_number);
					last_number = result;
				}
			}
		});
		it("should return a number in a monotonous sequence.",function() {
			eval(noise_function);
			const input_nums = Array.from({ length: 1000 }, (_, i) => i + 1);
			const precs = [10, 100, 1000];
			for (const prec of precs) {
				let last_number = 0;
				for (const orig_num of input_nums) {
					let result = noise_function(orig_num, prec);
					expect(result).toBeGreaterThanOrEqual(last_number);
					last_number = result;
				}
			}
		});
		it("should return factor 1.",function() {
			eval(noise_function);
			const input_nums = [0, 1, 10, 1000, 123, 116546489, 1776261239621000000];
			for (num of input_nums) {
				let factor = factorHeuristics(num);
				expect(factor).toBe(1, num);
			}
		});
		it("should return factor 10.",function() {
			eval(noise_function);
			const input_nums = [0.1, 1.2, 10.3, 1000.4, 123.5, 116546489.6];
			for (num of input_nums) {
				let factor = factorHeuristics(num);
				expect(factor).toBe(10, num);
			}
		});
		it("should return factor 100.",function() {
			eval(noise_function);
			const input_nums = [0.12, 1.25, 10.37, 1000.49, 123.55, 116546489.46];
			for (num of input_nums) {
				let factor = factorHeuristics(num);
				expect(factor).toBe(100, num);
			}
		});
		it("should return correct factor value.",function() {
			eval(noise_function);
			const inputs = [
				[0.30000000000000004, 10, 1],
				[36.230, 100, 2],
				[18880343.4, 10, 1],
				[281.70000000298023, 10, 1],
				[18898343.700000003, 10, 1],
				[18978343.800000004, 10, 1],
				[18930343.300000004, 10, 1],
				[702.5999999940395, 10, 1],
				[24702.69999999553, 10, 1],
				[32842.333999999851, 1000, 3],
			];
			for ([num, eFactor, eDecimals] of inputs) {
				let factor = factorHeuristics(num);
				expect(factor).toBe(eFactor, num);
			}
		});
		it("should return a number in the desired range for float numbers.",function() {
			function decimal_part(n) {
				let n_str = n.toString();
				return n_str.substring(n_str.indexOf('.')+1);
			}
			// Enforce predictable random value
			//function fakeRandom() {return 0.5;}
			//fake_random_noise_function = noise_function.replace(/\bMath\.random\(\)/g, 'fakeRandom()');
			//eval(fake_random_noise_function);
			eval(noise_function + "function reset_wrapper() {lastValue = 0}"); // note that lastValue is a variable from the file under test
			var number_changed = false; // Do not check for all numbers but expect that for at least one number, the number changed
			var fractional_part_changed = false; // Do not check for all numbers but expect that for at least one number, the fractional part is different
			//whole part and decimal part are prime numbers
			const input_nums = [1009.1013, 1019.1021, 1031.1033, 1039.1049, 1051.1061];
			const precs = [10, 100, 1000];
			for (const orig_num of input_nums) {
				for (const prec of precs) {
					reset_wrapper(); // Reset the state (last returned number) in the noise function
					let result = noise_function(orig_num, prec);
					if (result != orig_num) {
						number_changed = true;
					}
					expect(result).toBeGreaterThanOrEqual(orig_num - prec);
					expect(result).toBeLessThanOrEqual(orig_num + prec);
					// Check that the decimal part changed
					const orig_fractional = decimal_part(orig_num);
					const result_fractional = decimal_part(result);
					if (orig_fractional != result_fractional) {
						fractional_part_changed = true;
					}
				}
			}
			expect(number_changed).toBeTrue();
			expect(fractional_part_changed).toBeTrue();
		});
		it("should not return unchanged float number from argument when precision is 100.",function() {
			eval(noise_function);
			var number_changed = false;
			//whole part and decimal part are prime numbers
			const input_nums = [1009.1013, 1019.1021, 1031.1033, 1039.1049, 1051.1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,100) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged whole number from argument when precision is 10.",function() {
			eval(noise_function);
			var number_changed = false;
			//prime numbers
			const input_nums = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,10) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged whole number from argument when precision is 100.",function() {
			eval(noise_function);
			var number_changed = false;
			//prime numbers
			const input_nums = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,100) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
		it("should not return unchanged whole number from argument when precision is 1000.",function() {
			eval(noise_function);
			var number_changed = false;
			//prime numbers
			const input_nums = [1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061];
			for (const num of input_nums) {
				if (Math.abs(noise_function(num,1000) - num) > 0.0001) {
					number_changed = true;
					break;
				}
			}
			expect(number_changed).toBeTrue();
		});
	});
});
