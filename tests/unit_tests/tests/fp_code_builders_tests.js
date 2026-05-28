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

/// <reference path="../../common/fp_code_builders.js">

describe("fp_code_builders.js", function() {
	describe("Function fp_assemble_injection", function() {
		it("should be defined.",function() {
			expect(fp_assemble_injection).toBeDefined();
		});
		it("should return empty string for L0 and deactivated FPD.",function() {
			level_0.wrappers = []; // Otherwise initialized dynamically
			expect(fp_assemble_injection(level_0, [])).toBe("");
		});
		it("should return patching code for L1 and deactivated FPD.",function() {
			level_1.wrappers = [["window.Geolocation", 3]]; // Fake, in production populated dynamically
			let code = fp_assemble_injection(level_1, [])
			expect(typeof code).toBe("string");
			expect(code.length).toBeGreaterThanOrEqual(100);
			expect(code.includes("Geolocation")).toBe(true);
			expect(code.includes("XRAY")).toBe(true);
			expect(code.includes("WrapHelper")).toBe(true);
			expect(code.includes("unX")).toBe(true);
			expect(code.includes("domainHash")).toBe(true);
			expect(code.includes("// FPD_S")).toBe(true);
			expect(code.includes("// FPD_E")).toBe(true);
			expect(code.includes("fp_call_count")).toBe(false);
		});
		it("should return patching code for L0 and activated FPD.",function() {
			level_0.wrappers = []; // Otherwise initialized dynamically
			let code = fp_assemble_injection(level_0, [["Navigator.prototype.userAgent", 1 ["get"], 0]])
			expect(typeof code).toBe("string");
			expect(code.length).toBeGreaterThanOrEqual(100);
			expect(code.includes("Geolocation")).toBe(false);
			expect(code.includes("XRAY")).toBe(true);
			expect(code.includes("WrapHelper")).toBe(true);
			expect(code.includes("unX")).toBe(true);
			//expect(code.includes("domainHash")).toBe(true);
			expect(code.includes("fp_call_count")).toBe(true);
		});
		it("should return patching code for L1 and activated FPD.",function() {
			level_1.wrappers = [["window.Geolocation", 3]]; // Fake, in production populated dynamically
			let code = fp_assemble_injection(level_1, [["Navigator.prototype.userAgent", 1 ["get"], 0]])
			expect(typeof code).toBe("string");
			expect(code.length).toBeGreaterThanOrEqual(100);
			expect(code.includes("Geolocation")).toBe(true);
			expect(code.includes("XRAY")).toBe(true);
			expect(code.includes("WrapHelper")).toBe(true);
			expect(code.includes("unX")).toBe(true);
			expect(code.includes("domainHash")).toBe(true);
			expect(code.includes("fp_call_count")).toBe(true);
		});
	});
});
