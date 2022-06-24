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

/// <reference path="../../common/helpers.js">

describe("Helpers", function() {


	describe("Function escape", function() {
		it("should be defined.",function() {
			expect(escape).toBeDefined();
		});
		it("should return string.",function() {
			expect(escape("")).toEqual(jasmine.any(String));
		});
		it("should replace single character in the middle of the word.",function() {
			expect(escape('te"st')).toBe("te&quot;st");
			expect(escape("te'st")).toBe("te&#039;st");
			expect(escape("te&st")).toBe("te&amp;st");
			expect(escape("te<st")).toBe("te&lt;st");
			expect(escape("te>st")).toBe("te&gt;st");
		});
		it("should replace single character in the beginning of the word.",function() {
			expect(escape('"test')).toBe("&quot;test");
			expect(escape("'test")).toBe("&#039;test");
			expect(escape("&test")).toBe("&amp;test");
			expect(escape("<test")).toBe("&lt;test");
			expect(escape(">test")).toBe("&gt;test");
		});
		it("should replace single character at the end of the word.",function() {
			expect(escape('test"')).toBe("test&quot;");
			expect(escape("test'")).toBe("test&#039;");
			expect(escape("test&")).toBe("test&amp;");
			expect(escape("test<")).toBe("test&lt;");
			expect(escape("test>")).toBe("test&gt;");
		});
		it("should replace multiple single character.",function() {
			expect(escape('"test""')).toBe("&quot;test&quot;&quot;");
			expect(escape("'test''")).toBe("&#039;test&#039;&#039;");
			expect(escape("&test&&")).toBe("&amp;test&amp;&amp;");
			expect(escape("<test<<")).toBe("&lt;test&lt;&lt;");
			expect(escape(">test>>")).toBe("&gt;test&gt;&gt;");
		});
		it("should replace multiple character.",function() {
			expect(escape("&Te\"stova' 'v<eta>.")).toBe("&amp;Te&quot;stova&#039; &#039;v&lt;eta&gt;.");
		});
	});


	describe("Function byteToHex", function() {
		it("should be defined.",function() {
			expect(byteToHex).toBeDefined();
		});
		it("should convert an integer represented as byte to string.",function() {
			expect(byteToHex(0)).toBe("00");
			expect(byteToHex(255)).toBe("ff");
			expect(byteToHex(256)).toBe("00"); // Bit overflow
		});
	});


	describe("Function gen_random32", function() {
		it("should be defined.",function() {
			expect(gen_random32).toBeDefined();
		});
		// Not able to test function gen_random32, because window.crypto is not defined in NodeJS.
	});
	describe("Function gen_random64", function() {
		it("should be defined.",function() {
			expect(gen_random64).toBeDefined();
		});
		// Not able to test function gen_random32, because window.crypto is not defined in NodeJS.
	});


	describe("Function getEffectiveDomain", function() {
		it("should be defined.",function() {
			expect(getEffectiveDomain).toBeDefined();
		});
		it("should remove www. from the beginning of the string.",function() {
			expect(getEffectiveDomain("https://www.fit.vutbr.cz")).toBe("fit.vutbr.cz");
			expect(getEffectiveDomain("http://www.fit.vutbr.cz")).toBe("fit.vutbr.cz");
		});
		it("should do nothing if there is not www. at the beginning of the string.",function() {
			expect(getEffectiveDomain("https://merlin.fit.vutbr.cz")).toBe("merlin.fit.vutbr.cz");
			expect(getEffectiveDomain("http://merlin.fit.vutbr.cz")).toBe("merlin.fit.vutbr.cz");
			expect(getEffectiveDomain("https://example.co.uk")).toBe("example.co.uk");
			expect(getEffectiveDomain("http://example.co.uk")).toBe("example.co.uk");
			expect(getEffectiveDomain("http://192.168.1.1")).toBe("192.168.1.1");
			expect(getEffectiveDomain("http://[2001:db8::]")).toBe("[2001:db8::]");
		});
		it("should support file: protocol.",function() {
			expect(getEffectiveDomain("file:///test")).toBe("file:");
		});
		it("should receive a valid URL.",function() {
			expect(() => getEffectiveDomain("merlin.fit.vutbr.cz")).toThrowError();
		});
	});


	describe("Function getSiteForURL", function() {
		it("should be defined.",function() {
			expect(getSiteForURL).toBeDefined();
		});
		it("propagate to TLD module.",function() {
			// See the config file for the tld mock function
			// The results below are not the results that the function should return in a correctly
			// built webextension
			expect(getSiteForURL("https://www.fit.vutbr.cz")).toBe("TLD#www.fit.vutbr.cz");
			expect(getSiteForURL("http://www.fit.vutbr.cz")).toBe("TLD#www.fit.vutbr.cz");
			expect(getSiteForURL("https://merlin.fit.vutbr.cz")).toBe("TLD#merlin.fit.vutbr.cz");
			expect(getSiteForURL("http://merlin.fit.vutbr.cz")).toBe("TLD#merlin.fit.vutbr.cz");
			expect(getSiteForURL("https://polcak.github.io")).toBe("TLD#polcak.github.io");
			expect(getSiteForURL("http://example.co.uk")).toBe("TLD#example.co.uk");
		});
		it("should support file: protocol.",function() {
			expect(getSiteForURL("file:///test")).toBe("file:");
		});
		it("should receive a valid URL.",function() {
			expect(getSiteForURL("merlin.fit.vutbr.cz")).toBe("");
		});
	});


	describe("Function create_short_text", function() {
		it("should be defined.",function() {
			expect(create_short_text).toBeDefined();
		});
		it("should not modify short strings.",function() {
			expect(create_short_text("", 10)).toBe("");
			expect(create_short_text("", 0)).toBe("");
			expect(create_short_text("1", 2)).toBe("1");
			var js = "jShelter";
			expect(create_short_text(js, js.length)).toBe(js);
		});
		it("should remove parentheses.",function() {
			expect(create_short_text("Test (should remove).", 1)).toBe("Test.");
			expect(create_short_text("Test (should remove). Test.", 12)).toBe("Test. Test.");
		});
		it("should respect sentences.",function() {
			expect(create_short_text("ABC. ABC. ABC.", 1)).toBe("ABC.");
			expect(create_short_text("ABC. ABC. ABC.", 5)).toBe("ABC.");
			expect(create_short_text("ABC. ABC. ABC.", 8)).toBe("ABC.");
			expect(create_short_text("ABC. ABC. ABC.", 9)).toBe("ABC. ABC.");
		});
	});


});
