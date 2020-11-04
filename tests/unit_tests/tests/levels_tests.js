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

/// <reference path="../../common/levels.js">

describe("Levels", function() {
	describe("Function getCurrentLevelJSON", function() {
		beforeAll(function() {
			domains = {};
			domains['stackoverflow.com'] = level_3;
			domains['polcak.github.io'] = level_2;
			domains['github.io'] = level_3;
			domains['swatblog.rtgp.xyz'] = level_1;
			domains['mail.google.com'] = level_0;
			domains['example.net'] = level_3;
			domains['vas-hosting.cz'] = level_2;
			domains['crm4.dynamics.com'] = level_1;
			domains['dynamics.com'] = level_2;
			domains['csob.cz'] = level_0;
			
			for (let key in levels) {
				levels[key].wrappers = wrapping_groups.get_wrappers(levels[key]);
			}
			for (l in levels) {
				wrapped_codes[l] = wrap_code(levels[l].wrappers) || "";
			}
		});
		afterAll(function() {
			domains = {};
		});
		it("should be defined.",function() {
			expect(getCurrentLevelJSON).toBeDefined();
		});
		it("should return object.",function() {
			expect(getCurrentLevelJSON("http://www.seznam.cz/")).toEqual(jasmine.any(Object));
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
			expect(function() {getCurrentLevelJSON("seznam.cz")}).toThrowError();
			expect(function() {getCurrentLevelJSON("seznam")}).toThrowError();
			expect(function() {getCurrentLevelJSON("www")}).toThrowError();
			expect(function() {getCurrentLevelJSON("www.seznam.cz")}).toThrowError();
		});
		it("should return default level when subdomains from given URL is not saved in domains in browser storage.",function() {
			expect(getCurrentLevelJSON("https://www.seznam.cz/")[0]).toBe(default_level);
			expect(getCurrentLevelJSON("https://www.fit.vut.cz/research/groups/.cs")[0]).toBe(default_level);
		});
		it("should return set level (from browser storage) for saved domains.",function() {
			expect(getCurrentLevelJSON("https://stackoverflow.com/questions/1925976/declaring-functions-in-javascript")[0]).toBe(level_3);
			expect(getCurrentLevelJSON("http://www.example.net/?amount=brass&bird=basketball")[0]).toBe(level_3);
			expect(getCurrentLevelJSON("https://www.vas-hosting.cz/blog-vyhody-dedikovaneho-serveru-vds-oproti-vps")[0]).toBe(level_2);
			expect(getCurrentLevelJSON("https://www.csob.cz/portal/lide")[0]).toBe(level_0);
		});
		it("should return set level (from browser storage) for saved domains with subdomains.",function() {
			expect(getCurrentLevelJSON("https://polcak.github.io/jsrestrictor/test/test.html")[0]).toBe(level_2);
			expect(getCurrentLevelJSON("https://swatblog.rtgp.xyz/")[0]).toBe(level_1);
			expect(getCurrentLevelJSON("https://mail.google.com/mail/u/0/#inbox")[0]).toBe(level_0);
			expect(getCurrentLevelJSON("https://thenetworg.crm4.dynamics.com/main.aspx#759240725")[0]).toBe(level_1);
		});
		it("should return default level wrappers when subdomains from given URL is not saved in domains in browser storage.",function() {
			expect(getCurrentLevelJSON("https://www.seznam.cz/")[1]).toBe(wrapped_codes[default_level.level_id]);
			expect(getCurrentLevelJSON("https://www.fit.vut.cz/research/groups/.cs")[1]).toBe(wrapped_codes[default_level.level_id]);
		});
		it("should return set level wrappers (from browser storage) for saved domains.",function() {
			expect(getCurrentLevelJSON("https://stackoverflow.com/questions/1925976/declaring-functions-in-javascript")[1]).toBe(wrapped_codes[level_3.level_id]);
			expect(getCurrentLevelJSON("http://www.example.net/?amount=brass&bird=basketball")[1]).toBe(wrapped_codes[level_3.level_id]);
			expect(getCurrentLevelJSON("https://www.vas-hosting.cz/blog-vyhody-dedikovaneho-serveru-vds-oproti-vps")[1]).toBe(wrapped_codes[level_2.level_id]);
			expect(getCurrentLevelJSON("https://www.csob.cz/portal/lide")[1]).toBe(wrapped_codes[level_0.level_id]);
		});
		it("should return set level wrappers (from browser storage) for saved domains with subdomains.",function() {
			expect(getCurrentLevelJSON("https://polcak.github.io/jsrestrictor/test/test.html")[1]).toBe(wrapped_codes[level_2.level_id]);
			expect(getCurrentLevelJSON("https://swatblog.rtgp.xyz/")[1]).toBe(wrapped_codes[level_1.level_id]);
			expect(getCurrentLevelJSON("https://mail.google.com/mail/u/0/#inbox")[1]).toBe(wrapped_codes[level_0.level_id]);
			expect(getCurrentLevelJSON("https://thenetworg.crm4.dynamics.com/main.aspx#759240725")[1]).toBe(wrapped_codes[level_1.level_id]);
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