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

/// <reference path="../../common/levels.js">

describe("Levels", function() {
	describe("Function getCurrentLevelJSON", function() {
		it("should be defined.",function() {
			expect(getCurrentLevelJSON).toBeDefined();
		});
		it("should return object.",function() {
			expect(getCurrentLevelJSON("http://www.jshelter.org/")).toEqual(jasmine.any(Object));
		});
		it("should throw error when parametr is not given.",function() {
			expect(function() {getCurrentLevelJSON()}).toThrowError();
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {getCurrentLevelJSON(undefined)}).toThrowError();
		});
		it("should throw error when parametr is empty string.",function() {
			expect(function() {getCurrentLevelJSON("")}).toThrowError();
		});
		it("should throw error when parametr is invalid URL.",function() {
			expect(function() {getCurrentLevelJSON("http")}).toThrowError();
			expect(function() {getCurrentLevelJSON("nvjidfnbgfi")}).toThrowError();
			expect(function() {getCurrentLevelJSON("jshelter.org")}).toThrowError();
			expect(function() {getCurrentLevelJSON("jshelter")}).toThrowError();
			expect(function() {getCurrentLevelJSON("www")}).toThrowError();
			expect(function() {getCurrentLevelJSON("www.jshelter.org")}).toThrowError();
		});
		it("should return default level when subdomains from given URL is not saved in domains in browser storage.",function() {
			// See config/global.json for the list of configured domains propagated to file under test
			expect(getCurrentLevelJSON("https://www.jshelter.org/")).toBe(default_level);
			expect(getCurrentLevelJSON("https://www.fit.vut.cz/research/groups/.cs")).toBe(default_level);
		});
		it("should return set level (from browser storage) for saved domains.",function() {
			// See config/global.json for the list of configured domains propagated to file under test
			expect(getCurrentLevelJSON("https://stackoverflow.com/questions/1925976/declaring-functions-in-javascript")).toBe(level_3);
			expect(getCurrentLevelJSON("http://www.example.net/?amount=brass&bird=basketball")).toBe(level_3);
			expect(getCurrentLevelJSON("https://www.vas-hosting.cz/blog-vyhody-dedikovaneho-serveru-vds-oproti-vps")).toBe(level_2);
			expect(getCurrentLevelJSON("https://www.csob.cz/portal/lide")).toBe(level_0);
		});
		it("should return set level (from browser storage) for saved domains with subdomains.",function() {
			// See config/global.json for the list of configured domains propagated to file under test
			expect(getCurrentLevelJSON("https://polcak.github.io/jsrestrictor/test/test.html")).toBe(level_2);
			expect(getCurrentLevelJSON("https://swatblog.rtgp.xyz/")).toBe(level_1);
			expect(getCurrentLevelJSON("https://mail.google.com/mail/u/0/#inbox")).toBe(level_0);
			expect(getCurrentLevelJSON("https://thenetworg.crm4.dynamics.com/main.aspx#759240725")).toBe(level_1);
		});
	});
	describe("Object level_0", function() {
		it("should be defined.",function() {
			expect(level_0).toBeDefined();
		});
	});
	describe("Object level_1", function() {
		it("should be defined.",function() {
			expect(level_1).toBeDefined();
		});
	});
	describe("Object level_2", function() {
		it("should be defined.",function() {
			expect(level_2).toBeDefined();
		});
	});
	describe("Object level_3", function() {
		it("should be defined.",function() {
			expect(level_3).toBeDefined();
		});
	});
	describe("Object level_3", function() {
		it("should be defined.",function() {
			expect(level_3).toBeDefined();
		});
	});
	describe("Object default_level", function() {
		it("should be defined.",function() {
			expect(default_level).toBeDefined();
		});
		it("should contain level_0 definiton.",function() {
			expect(levels[0]).toBe(level_0);
		});
		it("should contain level_1 definiton.",function() {
			expect(levels[1]).toBe(level_1);
		});
		it("should contain level_2 definiton.",function() {
			expect(levels[2]).toBe(level_2);
		});
		it("should contain level_3 definiton.",function() {
			expect(levels[3]).toBe(level_3);
		});
	});
	describe("Object wrapping_groups", function() {
		it("should be defined.",function() {
			expect(wrapping_groups).toBeDefined();
		});
		it("should has attribute groups.",function() {
			expect(wrapping_groups.groups).toBeDefined();
		});
	});
	describe("Function is_api_undefined", function() {
		it("should be defined.",function() {
			expect(is_api_undefined).toBeDefined();
		});
		it("should return boolean.",function() {
			expect(is_api_undefined("navigator.getBattery")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Worker")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.SharedArrayBuffer")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.DataView")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Uint8Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Int8Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Uint8ClampedArray")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Int16Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Uint16Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Int32Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Uint32Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Float32Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Float64Array")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.XMLHttpRequest")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("navigator.hardwareConcurrency")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("navigator.deviceMemory")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("CanvasRenderingContext2D.prototype.getImageData")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("HTMLCanvasElement.prototype.toBlob")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("HTMLCanvasElement.prototype.toDataURL")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("Performance.prototype.now")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("PerformanceEntry.prototype")).toEqual(jasmine.any(Boolean));
			expect(is_api_undefined("window.Date")).toEqual(jasmine.any(Boolean));
		});
		it("should return True or False.",function() {
			expect(is_api_undefined("navigator.getBattery") === true || is_api_undefined("navigator.getBattery") === false).toBeTruthy();
			expect(is_api_undefined("window.Worker") === true || is_api_undefined("window.Worker") === false).toBeTruthy();
			expect(is_api_undefined("window.SharedArrayBuffer") === true || is_api_undefined("window.SharedArrayBuffer") === false).toBeTruthy();
			expect(is_api_undefined("window.DataView") === true || is_api_undefined("window.DataView") === false).toBeTruthy();
			expect(is_api_undefined("window.Uint8Array") === true || is_api_undefined("window.Uint8Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Int8Array") === true || is_api_undefined("window.Int8Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Uint8ClampedArray") === true || is_api_undefined("window.Uint8ClampedArray") === false).toBeTruthy();
			expect(is_api_undefined("window.Int16Array") === true || is_api_undefined("window.Int16Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Uint16Array") === true || is_api_undefined("window.Uint16Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Int32Array") === true || is_api_undefined("window.Int32Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Uint32Array") === true || is_api_undefined("window.Uint32Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Float32Array") === true || is_api_undefined("window.Float32Array") === false).toBeTruthy();
			expect(is_api_undefined("window.Float64Array") === true || is_api_undefined("window.Float64Array") === false).toBeTruthy();
			expect(is_api_undefined("window.XMLHttpRequest") === true || is_api_undefined("window.XMLHttpRequest") === false).toBeTruthy();
			expect(is_api_undefined("navigator.hardwareConcurrency") === true || is_api_undefined("navigator.hardwareConcurrency") === false).toBeTruthy();
			expect(is_api_undefined("navigator.deviceMemory") === true || is_api_undefined("navigator.deviceMemory") === false).toBeTruthy();
			expect(is_api_undefined("CanvasRenderingContext2D.prototype.getImageData") === true || is_api_undefined("CanvasRenderingContext2D.prototype.getImageData") === false).toBeTruthy();
			expect(is_api_undefined("HTMLCanvasElement.prototype.toBlob") === true || is_api_undefined("HTMLCanvasElement.prototype.toBlob") === false).toBeTruthy();
			expect(is_api_undefined("HTMLCanvasElement.prototype.toDataURL") === true || is_api_undefined("HTMLCanvasElement.prototype.toDataURL") === false).toBeTruthy();
			expect(is_api_undefined("Performance.prototype.now") === true || is_api_undefined("Performance.prototype.now") === false).toBeTruthy();
			expect(is_api_undefined("PerformanceEntry.prototype") === true || is_api_undefined("PerformanceEntry.prototype") === false).toBeTruthy();
			expect(is_api_undefined("window.Date") === true || is_api_undefined("window.Date") === false).toBeTruthy();
		});
		it("should throw error when parametr is not given.",function() {
			expect(function() {is_api_undefined()}).toThrowError();
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {is_api_undefined(undefined)}).toThrowError();
		});
	});
	describe("Function are_all_api_unsupported", function() {
		it("should be defined.",function() {
			expect(are_all_api_unsupported).toBeDefined();
		});
		it("should return boolean.",function() {
			expect(are_all_api_unsupported(["Performance.prototype.now","PerformanceEntry.prototype","window.Date"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["CanvasRenderingContext2D.prototype.getImageData","HTMLCanvasElement.prototype.toBlob","HTMLCanvasElement.prototype.toDataURL"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["navigator.hardwareConcurrency","navigator.deviceMemory"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["window.XMLHttpRequest"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["window.DataView","window.Uint8Array","window.Int8Array","window.Uint8ClampedArray","window.Int16Array","window.Uint16Array",
			"window.Int32Array","window.Uint32Array","window.Float32Array","window.Float64Array"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["window.SharedArrayBuffer"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["window.Worker"])).toEqual(jasmine.any(Boolean));
			expect(are_all_api_unsupported(["navigator.getBattery"])).toEqual(jasmine.any(Boolean));
		});
		it("should throw error when parametr is not given.",function() {
			expect(function() {are_all_api_unsupported()}).toThrowError();
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {are_all_api_unsupported(undefined)}).toThrowError();
		});
		it("should throw error when parametr is not iterable.",function() {
			expect(function() {are_all_api_unsupported(5)}).toThrowError();
		});
	});
});
