//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Martin Bednar
// SPDX-License-Identifier: GPL-3.0-or-later
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
			expect(extractSubDomains("vutbr.cz")).toEqual(["vutbr.cz"]);
			expect(extractSubDomains("fit.vutbr.cz")).toEqual(["vutbr.cz","fit.vutbr.cz"]);
			expect(extractSubDomains("wis.fit.vutbr.cz")).toEqual(["vutbr.cz","fit.vutbr.cz","wis.fit.vutbr.cz"]);
			expect(extractSubDomains("eva.fit.vutbr.cz")).toEqual(["vutbr.cz","fit.vutbr.cz","eva.fit.vutbr.cz"]);
			expect(extractSubDomains("netfox-hyperv.fit.vutbr.cz")).toEqual(["vutbr.cz","fit.vutbr.cz","netfox-hyperv.fit.vutbr.cz"]);
			expect(extractSubDomains("project.bigred.cornell.edu")).toEqual(["cornell.edu","bigred.cornell.edu","project.bigred.cornell.edu"]);
			expect(extractSubDomains("test.eva.fit.vutbr.cz")).toEqual(["vutbr.cz","fit.vutbr.cz","eva.fit.vutbr.cz","test.eva.fit.vutbr.cz"]);
			expect(extractSubDomains("sites.google.com")).toEqual(["google.com","sites.google.com"]);
			expect(extractSubDomains("code.google.com")).toEqual(["google.com","code.google.com"]);
			expect(extractSubDomains("docs.google.com")).toEqual(["google.com","docs.google.com"]);
			expect(extractSubDomains("support.google.com")).toEqual(["google.com","support.google.com"]);
			expect(extractSubDomains("polcak.github.io")).toEqual(["github.io","polcak.github.io"]);
			expect(extractSubDomains("martinbednar.github.io")).toEqual(["github.io","martinbednar.github.io"]);
			expect(extractSubDomains("swatblog.rtgp.xyz")).toEqual(["rtgp.xyz","swatblog.rtgp.xyz"]);
			expect(extractSubDomains("thenetworg.crm4.dynamics.com")).toEqual(["dynamics.com","crm4.dynamics.com","thenetworg.crm4.dynamics.com"]);
		});
		xit("should return IP address for IP address (no domainname). Example URL: http://89.45.196.133/paneln/Login.aspx)",function() {
			//example web page: http://89.45.196.133/paneln/Login.aspx
			//Documentation of function extractSubDomains tells, that only domainname can be given as an argument,
			//but in function getCurrentLevelJSON in file levels.js can be function extractSubDomains called with IP address.
			//This test simulate, what happend, when the function extractSubDomains is called with existing IP address from URL.
			expect(extractSubDomains("89.45.196.133")).toEqual(["89.45.196.133"]);
			expect(extractSubDomains("2001:67c:1220:809::93e5:917")).toEqual(["2001:67c:1220:809::93e5:917"]);
		});
	});
});
