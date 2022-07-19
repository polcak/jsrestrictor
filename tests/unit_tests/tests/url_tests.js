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

/// <reference path="../../common/url.js">

describe("URL", function() {
	describe("Function extractSubDomains", function() {		
		it("should be defined.",function() {
			expect(extractSubDomains).toBeDefined();
		});
		it("should return array.",function() {
			expect(extractSubDomains("")).toEqual(jasmine.any(Array));
		});
		it("should return array of strings.",function() {
			expect(extractSubDomains("")[0]).toEqual(jasmine.any(String));
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {extractSubDomains(undefined)}).toThrowError();
		});
		it("should return array with one empty string when parametr is empty string.",function() {
			expect(extractSubDomains("")).toEqual(new Array(1).fill(""));
		});
		it("should return parametr when parametr is nonsense without dots.",function() {
			expect(extractSubDomains("gsf14f56sdvds1,-dfsv,§ú")).toEqual(["gsf14f56sdvds1,-dfsv,§ú"]);
		});
		it("should return array of domains.",function() {
			expect(extractSubDomains("vutbr.cz")).toEqual(["cz", "vutbr.cz"]);
			expect(extractSubDomains("fit.vutbr.cz")).toEqual(["cz", "vutbr.cz","fit.vutbr.cz"]);
			expect(extractSubDomains("wis.fit.vutbr.cz")).toEqual(["cz", "vutbr.cz","fit.vutbr.cz","wis.fit.vutbr.cz"]);
			expect(extractSubDomains("eva.fit.vutbr.cz")).toEqual(["cz", "vutbr.cz","fit.vutbr.cz","eva.fit.vutbr.cz"]);
			expect(extractSubDomains("netfox-hyperv.fit.vutbr.cz")).toEqual(["cz", "vutbr.cz","fit.vutbr.cz","netfox-hyperv.fit.vutbr.cz"]);
			expect(extractSubDomains("project.bigred.cornell.edu")).toEqual(["edu", "cornell.edu","bigred.cornell.edu","project.bigred.cornell.edu"]);
			expect(extractSubDomains("test.eva.fit.vutbr.cz")).toEqual(["cz", "vutbr.cz","fit.vutbr.cz","eva.fit.vutbr.cz","test.eva.fit.vutbr.cz"]);
			expect(extractSubDomains("sites.google.com")).toEqual(["com", "google.com","sites.google.com"]);
			expect(extractSubDomains("code.google.com")).toEqual(["com", "google.com","code.google.com"]);
			expect(extractSubDomains("docs.google.com")).toEqual(["com", "google.com","docs.google.com"]);
			expect(extractSubDomains("support.google.com")).toEqual(["com", "google.com","support.google.com"]);
			expect(extractSubDomains("polcak.github.io")).toEqual(["io", "github.io","polcak.github.io"]);
			expect(extractSubDomains("martinbednar.github.io")).toEqual(["io", "github.io","martinbednar.github.io"]);
			expect(extractSubDomains("swatblog.rtgp.xyz")).toEqual(["xyz", "rtgp.xyz","swatblog.rtgp.xyz"]);
			expect(extractSubDomains("thenetworg.crm4.dynamics.com")).toEqual(["com", "dynamics.com","crm4.dynamics.com","thenetworg.crm4.dynamics.com"]);
		});
		it("should return IP address for IP address (no domainname). Example URL: http://89.45.196.133/paneln/Login.aspx)",function() {
			//example web page: http://89.45.196.133/paneln/Login.aspx
			expect(extractSubDomains("89.45.196.133")).toEqual(["89.45.196.133"]);
			expect(extractSubDomains("0.0.0.0")).toEqual(["0.0.0.0"]);
			expect(extractSubDomains("255.255.255.255")).toEqual(["255.255.255.255"]);
			expect(extractSubDomains("2001:67c:1220:809::93e5:917")).toEqual(["2001:67c:1220:809::93e5:917"]);
			expect(extractSubDomains("::")).toEqual(["::"]);
			expect(extractSubDomains("::1")).toEqual(["::1"]);
			expect(extractSubDomains("2001:db8::")).toEqual(["2001:db8::"]);
		});
		it("should parse invalid IP-address-like strings as domains)",function() {
			expect(extractSubDomains("256.255.255.255")).toEqual(["255", "255.255", "255.255.255", "256.255.255.255"]);
			expect(extractSubDomains("255.256.255.255")).toEqual(["255", "255.255", "256.255.255", "255.256.255.255"]);
			expect(extractSubDomains("255.255.256.255")).toEqual(["255", "256.255", "255.256.255", "255.255.256.255"]);
			expect(extractSubDomains("255.255.255.256")).toEqual(["256", "255.256", "255.255.256", "255.255.255.256"]);
		});
	});
});
