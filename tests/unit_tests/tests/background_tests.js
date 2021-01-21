//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Martin Bednar
// SPDX-License-Identifier: GPL-3.0-or-later
//

/// <reference path="../../common/background.js">

describe("Background", function() {
	describe("Function updateBadge", function() {		
		it("should be defined.",function() {
			expect(updateBadge).toBeDefined();
		});
		it("should return nothing.",function() {
			expect(updateBadge(levels[2])).toBe(undefined);
		});
		it("should not throw error when argument is valid level.",function() {
			expect(function() {updateBadge(levels[2])}).not.toThrowError();
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {updateBadge(undefined)}).toThrowError();
		});
		it("should throw error when parametr is not given.",function() {
			expect(function() {updateBadge()}).toThrowError();
		});
	});
	describe("Function tabUpdate", function() {		
		it("should be defined.",function() {
			expect(tabUpdate).toBeDefined();
		});
		it("should return nothing.",function() {
			expect(tabUpdate(5,{'url':'https://www.seznam.cz/'})).toBe(undefined);
		});
		it("should not throw error when argument changeInfo['url'] is undefined.",function() {
			expect(function() {tabUpdate(5,{'url':undefined})}).not.toThrowError();
		});
		it("should throw error when parametr changeInfo is undefined.",function() {
			expect(function() {tabUpdate(5,undefined)}).toThrowError();
		});
		it("should throw error when no parametr is given.",function() {
			expect(function() {tabUpdate()}).toThrowError();
		});
	});
	describe("Function tabActivate", function() {		
		it("should be defined.",function() {
			expect(tabActivate).toBeDefined();
		});
		it("should return nothing.",function() {
			expect(tabActivate({tabId:5})).toBe(undefined);
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {tabActivate(undefined)}).toThrowError();
		});
		it("should throw error when no parametr is given.",function() {
			expect(function() {tabActivate()}).toThrowError();
		});
	});
	describe("Function connected", function() {		
		it("should be defined.",function() {
			expect(connected).toBeDefined();
		});
		it("should return nothing.",function() {
			expect(connected({name:"test"})).toBe(undefined);
		});
		it("should throw error when parametr is undefined.",function() {
			expect(function() {connected(undefined)}).toThrowError();
		});
		it("should throw error when no parametr is given.",function() {
			expect(function() {connected()}).toThrowError();
		});
	});
});
