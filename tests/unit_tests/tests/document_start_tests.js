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

/// <reference path="../../common/document_start.js">

let port_seq_counter = 0;
/**
 * Get a unique sequence (string) for each call that can be used as a port ID
 *
 * The goal is not to reuse the same port IDs in different test so that the
 * tests do not affect other tests.
 *
 * Using this ID prevents potential errors steming from copy&paste a part of
 * the test and consequently dupliacting an existing static test ID.
 */
function getTestId() {
	++port_seq_counter;
	return "test_" + port_seq_counter;
}

describe("document_start.js", function() {
	describe("Function wrapWindow", function() {
		it("should be defined.",function() {
			expect(wrapWindow).toBeDefined();
		});
		it("should return null for L0 and deactivated FPD.",function() {
			level_0.wrappers = []; // Otherwise initialized dynamically
			expect(wrapWindow(level_0, [], {fpdTrackCallers: false, domainHash: "abc"})).toBe(null);
		});
		it("should return patching code for L1 and deactivated FPD.",function() {
			level_1.wrappers = [["window.Geolocation", 3]]; // Fake, in production populated dynamically
			let code = wrapWindow(level_1, [], {fpdTrackCallers: false, domainHash: "abc"})
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
			let code = wrapWindow(level_0, [["Navigator.prototype.userAgent", 1 ["get"], 0]], {fpdTrackCallers: false, domainHash: "abc"})
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
			let code = wrapWindow(level_1, [["Navigator.prototype.userAgent", 1 ["get"], 0]], {fpdTrackCallers: false, domainHash: "abc"})
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

describe("bootstrap handshake hardening", function () {
	beforeEach(function () {
		expect(registerBootstrapListener).toBeDefined();
		// reset of the internal state
		resetDocumentStart();
	});
	afterEach(function () {
		// reset of the internal state for the following tests, possibly outside this module
		resetDocumentStart();
	});

	it("rejects a forged bootstrap after the real handshake", function () {
		const test_id = getTestId();
		const real_port_id = "real" + test_id;
		const attacker_port_id = "attacker" + test_id;
		const realResponses = jasmine.createSpy();
		window.addEventListener(real_port_id + ":return:extension", realResponses, true);

		// Simulate an event from JShelter wrappers_generated.js
		window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
			{detail: {portId: real_port_id}}));
		// Forged message establishing attacker portId
		// (commit 21df1d8335e28a295b923152490105332aebe25e)
		window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
			{detail: {portId: attacker_port_id}}));
		// Use the attacker's channel to forge further messages
		// (commit 21df1d8335e28a295b923152490105332aebe25e)
		window.dispatchEvent(new CustomEvent(attacker_port_id + ":page",
			{detail: {msg: {init: true}}}));

		expect(realResponses).not.toHaveBeenCalled();
		// Test that the attacker's channel does not get a reply
		const attackerResponses = jasmine.createSpy();
		window.addEventListener(attacker_port_id + ":return:extension", attackerResponses, true);
		window.dispatchEvent(new CustomEvent(attacker_port_id + ":page",
			{detail: {msg: {init: true}}}));
		expect(attackerResponses).not.toHaveBeenCalled();
	});

	it("does not throw an exception on malformed bootstrap events", function () {
		// Regression: pre-21df1d83 code did e.detail.portId without validation and threw inside the listener
		expect(function () {
			// Missing event detail (no portId at all)
			window.dispatchEvent(new CustomEvent("jshelter-bootstrap", {}));
		}).not.toThrow();
		expect(function () {
			// Invalid portId as it has to be a string
			window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
				{detail: {portId: 1234}}));
		}).not.toThrow();
	});

	it("a malformed bootstrap consumes the handshake", function () {
		// As documented in the main file, a malicious bootstrap event prevents
		// the MAIN world to obtain the configuration. This test documents the
		// behavior; it is a behavioral safety net against regressions in event
		// validation, not a security claim. Feel free to change the tested
		// behaviour when there are arguments for a different behaviour.
		const port_id = "real" + getTestId();

		// malformed event: consumed the {once: true} listener but sealed nothing
		window.dispatchEvent(new CustomEvent("jshelter-bootstrap", {}));

		// genuine bootstrap arrives too late — must be ignored
		window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
			{detail: {portId: port_id}}));

		// Probe the port: if it were established, the listener would answer
		// any message with a "[port_id]:return:extension" event (even when the
		// value is undefined, the event itself fires).
		const responses = [];
		window.addEventListener(port_id + ":return:extension", function (e) {
			responses.push(e.detail);
		}, true);
		window.dispatchEvent(new CustomEvent(port_id + ":page",
			{detail: {msg: {init: true}}}));

		expect(responses).toEqual([]);
	});
	it("a genuine bootstrap establishes a working port", function () {
		const port_id = "real" + getTestId();
		window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
			{detail: {portId: port_id}}));

		const responses = [];
		window.addEventListener(port_id + ":return:extension", function (e) {
			responses.push(e.detail);
		}, true);
		window.dispatchEvent(new CustomEvent(port_id + ":page",
			{detail: {msg: {init: true}}}));

		expect(responses.length).toBe(1);  // event fires; .value may be undefined
	});


	it("answers {init: true} at most once", function () {
		const conf = {domainHash: "deadbeef", currentLevel: {level_id: "2"}};
		pendingConfig = conf;
		const handler = createHandleWrappersPortMessage(() => pendingConfig);

		expect(handler({init: true})).toBe(conf);
		expect(handler({init: true})).toBeUndefined(); // No response for the secondy try, see commit 21df1d83
	});

	it("keeps FPD forwarding working for non-init messages", function () {
		spyOn(browser.runtime, "sendMessage");
		const handler = createHandleWrappersPortMessage(() => null);
		handler({access: "call", resource: "SomeAPI"});
		expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
				purpose: "fp-detection",
				content: {access: "call", resource: "SomeAPI"}
			});
	});

	it("pushes pendingConfig over an established port", function () {
		const port_id = "real" + getTestId();
		const testedDomainHash = "HASH X" + getTestId(); // Delibarately different value to port_id so (let the domain hash differ with each potential copy)
		const testedLevelId = "2";
		const pushed = [];
		window.addEventListener(port_id + ":extension", function (e) {
				pushed.push(e.detail.msg);
			}, true);

		window.dispatchEvent(new CustomEvent("jshelter-bootstrap",
			{detail: {portId: port_id}}));
		const ok = configureInjection(
			{
				currentLevel: {level_id: testedLevelId},
				fpdWrappers: [],
        fpdTrackCallers: false,
				domainHash: testedDomainHash,
				incognitoHash: "i"
			}
		);
		expect(ok).toBeTrue();
    expect(pushed.length).toBe(1);
    expect(pushed[0].currentLevel).toBeDefined();
    expect(pushed[0].currentLevel.level_id).toBeDefined(testedLevelId);
    expect(pushed[0].domainHash).toBe(testedDomainHash);
		// A repeated call does not succeed
		expect(configureInjection({currentLevel: {level_id: testedLevelId + "3"}})).toBeUndefined();
	});

});
