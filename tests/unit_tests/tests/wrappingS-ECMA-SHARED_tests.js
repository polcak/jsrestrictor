//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2022 Martin Bednar
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

/// <reference path="../../common/wrappingS-ECMA-SHARED.js">

describe("ECMA-SHARED", function() {
	describe("proxyHandler", function() {
		it("should be defined.",function() {
			expect(proxyHandler).toBeDefined();
		});
	});
	describe("wrappingFunctionBody", function() {
		it("should be defined.",function() {
			expect(wrappingFunctionBody).toBeDefined();
		});
	});
	describe("wrappers", function() {
		it("should be defined.",function() {
			expect(wrappers).toBeDefined();
		});
	});
});
