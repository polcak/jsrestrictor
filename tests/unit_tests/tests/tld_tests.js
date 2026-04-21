//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2026 Libor Polčák
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

/// <reference path="../../nscl/common/tld.js">

describe("tld", function() {

	describe("Function getDomain", function() {
		it("should return effective TLD + 1.",function() {
			const TEST_CASES = [
				["www.fit.vut.cz", "vut.cz"],
				["www.fit.vut.cz.", "vut.cz"],
				["[::]", "[::]"],
				["127.0.0.1", "127.0.0.1"],
				["polcak.github.io", "polcak.github.io"],
				["example.co.uk", "example.co.uk"],
				["www.háčkyčárky.cz", "háčkyčárky.cz"],
				["www.xn--hkyrky-ptac70bc.cz", "xn--hkyrky-ptac70bc.cz"], // Also háčkyčárky.cz which would be a better result
			];
			for ([domain, eResult] of TEST_CASES) {
				expect(tld.getDomain(domain)).toBe(eResult, domain);
			}
		});
		it("should return effective TLD.",function() {
			const TEST_CASES = [
				["www.fit.vut.cz", "cz"],
				["www.fit.vut.cz.", "cz"],
				["[::]", undefined],
				["127.0.0.1", undefined],
				["polcak.github.io", "github.io"],
				["example.co.uk", "co.uk"],
				["www.háčkyčárky.cz", "cz"],
				["www.xn--hkyrky-ptac70bc.cz", "cz"],
			];
			for ([domain, eResult] of TEST_CASES) {
				expect(tld.getPublicSuffix(domain)).toBe(eResult, domain);
			}
		});
		it("should normalize the domain.",function() {
			const TEST_CASES = [
				["www.fit.vut.cz", "www.fit.vut.cz"],
				["www.fit.vut.cz.", "www.fit.vut.cz"],
				["[::]", "[::]"],
				["127.0.0.1", "127.0.0.1"],
				["polcak.github.io", "polcak.github.io"],
				["example.co.uk", "example.co.uk"],
				["www.háčkyčárky.cz", "www.háčkyčárky.cz"],
				["www.xn--hkyrky-ptac70bc.cz", "www.xn--hkyrky-ptac70bc.cz"], // Also háčkyčárky.cz which would be a better result
			];
			for ([domain, eResult] of TEST_CASES) {
				expect(tld.normalize(domain)).toBe(eResult, domain);
			}
		});
		it("should differentiate between IP addresses and domain names.",function() {
			const TEST_CASES = [
				["www.fit.vut.cz", false],
				["www.fit.vut.cz.", false],
				["[::]", true],
				["127.0.0.1", true],
				["polcak.github.io", false],
				["example.co.uk", false],
				["www.háčkyčárky.cz", false],
				["www.xn--hkyrky-ptac70bc.cz", false],
			];
			for ([domain, eResult] of TEST_CASES) {
				expect(tld.isIp(domain)).toBe(eResult, domain);
			}
		});
	});


});
