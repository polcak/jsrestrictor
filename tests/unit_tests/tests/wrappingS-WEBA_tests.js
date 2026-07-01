//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2023 Martin Zmitko
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

/// <reference path="../../common/wrappingS-WEBA.js">


describe("WEBA function audioFarble", function() {
    var wasm = {ready: false};
    var consoleDebug = console.debug;
    const getRandomFloats = function(len) {
        const data = new Float32Array(len);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return data;
    };
    eval(audioFarble.toString()); // load audioFarble function in this scope
	beforeAll(function initWASM(done) {
        console.debug = function() {}; // suppress console output
        let code = insert_wasm_code("// WASM_CODE //");
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});
    afterAll(function() {
        console.debug = consoleDebug;
    });
    
    it("should provide consistent results for both JS and WASM implementations for random data.",function() {
        for (let i = 0; i < 5; i++) {
            expect(wasm.ready).toBe(true);
            const randomFloats = getRandomFloats(40000);

            const floatsWASM = randomFloats.slice();
            audioFarble(floatsWASM);

            wasm.ready = false;
            const floatsJS = randomFloats.slice();
            audioFarble(floatsJS);
            wasm.ready = true;

            expect(floatsWASM.every(function (value, index) {
							if (value !== floatsJS[index]) {
								console.log("Problem wrappingS-WEBA_tests.js", index, value, floatsJS[index]);
							}
							return value === floatsJS[index]})).toEqual(true);
        }
    });
    it("should provide consistent results for both JS and WASM implementations for empty data.",function() {
        expect(wasm.ready).toBe(true);
        const floatsWASM = new Float32Array(40000);
        audioFarble(floatsWASM);

        wasm.ready = false;
        const floatsJS =new Float32Array(40000);
        audioFarble(floatsJS);
        wasm.ready = true;
        expect(floatsWASM.every((value, index) => value === floatsJS[index])).toEqual(true);
    });
});

describe("WEBA function audioFarbleInt", function() {
    var wasm = {ready: false};
    var consoleDebug = console.debug;
    const getRandomBytes = function(len) {
        const data = new Uint8Array(len);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 256;
        }
        return data;
    };
    eval(audioFarbleInt.toString()); // load audioFarble function in this scope
	beforeAll(function initWASM(done) {
        console.debug = function() {}; // suppress console output
        let code = insert_wasm_code("// WASM_CODE //");
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});
    afterAll(function() {
        console.debug = consoleDebug;
    });
    
    it("should provide consistent results for both JS and WASM implementations.",function() {
        for (let i = 0; i < 50; i++) {
            expect(wasm.ready).toBe(true);
            const randomFloats = getRandomBytes(40000);

            const bytesWASM = randomFloats.slice();
            audioFarbleInt(bytesWASM);

            wasm.ready = false;
            const bytesJS = randomFloats.slice();
            audioFarbleInt(bytesJS);
            wasm.ready = true;

            expect(bytesWASM.every((value, index) => value === bytesJS[index])).toEqual(true);
        }
    });
    it("should provide consistent results for both JS and WASM implementations for empty data.",function() {
        expect(wasm.ready).toBe(true);
        const bytesWASM = new Uint8Array(40000);
        audioFarbleInt(bytesWASM);

        wasm.ready = false;
        const bytesJS =new Uint8Array(40000);
        audioFarbleInt(bytesJS);
        wasm.ready = true;
        expect(bytesWASM.every((value, index) => value === bytesJS[index])).toEqual(true);
    });
});

// The PCM data are in  [-1.0; 1.0]
// https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/getChannelData#examples
const PCM_FLOAT_VALUES_TO_TEST = [
	-1.0,
	-0.999999999999,
	-0.5,
	-0.1,
	-0.000000000001,
	0,
	0.000000000001,
	0.1,
	0.5,
	0.999999999999,
	1.0
];
describe("WEBA function audioFarble (JS, float)", function() {
	var wasm = {ready: false}; // Test the JS version, the consistency of WebAssembly and JS implementation is tested above
	var consoleDebug = console.debug;
	beforeAll(function () {
		console.debug = function() {}; // suppress console output
	});
	afterAll(function() {
		console.debug = consoleDebug;
	});
	eval(audioFarble.toString()); // load audioFarble function in this scope
	it("should modify the input data", function() {
		const TOLERANCE = 0.1; // This might need to change depending on the farbling algorithm
		for (const VALUE_TO_TEST of PCM_FLOAT_VALUES_TO_TEST) {
			expect(wasm.ready).toBe(false);
			const ARRAY_LEN = 10;
			let data = new Float32Array(ARRAY_LEN);
			for (let i = 0; i < ARRAY_LEN; i++) {
				data[i] = VALUE_TO_TEST;
			}
			audioFarble(data);
			for (let i = 0; i < ARRAY_LEN; i++) {
				if (data[i] !== -1 && data[i] !== 1) { // It is not necessary to change the minimal or maximal value as the computed farbling might go in the wrong direction outside the desired range
					expect(data[i]).not.toBe(VALUE_TO_TEST, VALUE_TO_TEST);
				}
				expect(data[i]).toBeGreaterThanOrEqual(-1.0, VALUE_TO_TEST); // Minimal PCM value
				expect(data[i]).toBeLessThanOrEqual(1.0, VALUE_TO_TEST); // Maximal PCM value
				expect(data[i]).toBeGreaterThanOrEqual(VALUE_TO_TEST-TOLERANCE, VALUE_TO_TEST);
				expect(data[i]).toBeLessThanOrEqual(VALUE_TO_TEST+TOLERANCE, VALUE_TO_TEST);
			}
		}
	});
});

describe("WEBA function audioFarbleInt (JS)", function() {
	var wasm = {ready: false}; // Test the JS version, the consistency of WebAssembly and JS implementation is tested above
	var consoleDebug = console.debug;
	beforeAll(function () {
		console.debug = function() {}; // suppress console output
	});
	afterAll(function() {
		console.debug = consoleDebug;
	});
	eval(audioFarbleInt.toString()); // load audioFarbleInt function in this scope
	it("should modify the input data", function() {
		const TOLERANCE = 1; // This might need to change depending on the farbling algorithm
		const ARRAY_LEN = 10;
		let total_modified = 0;
		for (let value_to_test = 0; value_to_test <= 255; value_to_test++) {
			expect(wasm.ready).toBe(false);
			let data = new Uint8Array(ARRAY_LEN);
			for (let i = 0; i < ARRAY_LEN; i++) {
				data[i] = value_to_test;
			}
			audioFarbleInt(data);
			let modified = 0;
			for (let i = 0; i < ARRAY_LEN; i++) {
				if (data[i] !== value_to_test) {
					modified++;
				}
				expect(data[i]).toBeGreaterThanOrEqual(value_to_test-TOLERANCE, value_to_test);
				expect(data[i]).toBeLessThanOrEqual(value_to_test+TOLERANCE, value_to_test);
			}
			expect(modified).toBeGreaterThan(0);
			total_modified += modified;
		}
		let average_modified_probability = total_modified / (256*ARRAY_LEN);
		// Note that the following two checks might fail if the chance goes bad way
		expect(average_modified_probability).toBeGreaterThan(0.4, average_modified_probability);
		expect(average_modified_probability).toBeLessThan(0.6, average_modified_probability);
	});
});

/**
 * https://blog.demofox.org/2015/04/14/decibels-db-and-amplitude/
 * https://en.wikipedia.org/wiki/DBFS (decibels relative to full scale)
 */
function amplitude2dBfullscale(amplitude) {
	if (amplitude <= 0) {
		return -Infinity; // absolute silence
	}
	return 20 * Math.log10(amplitude);
}

describe("WEBA function whiteNoiseFloat (JS)", function() {
	eval(whiteNoiseFloat.toString()); // load the function under test in this scope
	it("should modify the input data", function() {
		for (const VALUE_TO_TEST of PCM_FLOAT_VALUES_TO_TEST) {
			const ARRAY_LEN = 10;
			let data = new Float32Array(ARRAY_LEN);
			for (let i = 0; i < ARRAY_LEN; i++) {
				data[i] = VALUE_TO_TEST;
			}
			whiteNoiseFloat(data);
			let modified = 0;
			for (let i = 0; i < ARRAY_LEN; i++) {
				if (data[i] !== VALUE_TO_TEST) {
					modified++;
				}
				expect(data[i]).toBeGreaterThanOrEqual(-1.0, VALUE_TO_TEST); // Minimal PCM value
				expect(data[i]).toBeLessThanOrEqual(1.0, VALUE_TO_TEST); // Maximal PCM value
			}
			expect(modified).toBeGreaterThan(ARRAY_LEN-2); // Theoretically, it should be always ARRAY_LEN
		}
	});
	it("the maximal noise generated should be quiet", function() {
		const ARRAY_LEN = 1000000;
		let data = new Float32Array(ARRAY_LEN);
		whiteNoiseFloat(data);

		let max_absolute_pcm = 0; // one time sound
		let average_energy_sum_powered = 0; // long term noise
		for (let i = 0; i < ARRAY_LEN; i++) {
			const cur_absolute_pcm = Math.abs(data[i]);
			if (cur_absolute_pcm > max_absolute_pcm) {
				max_absolute_pcm = cur_absolute_pcm;
			}
			average_energy_sum_powered += cur_absolute_pcm * cur_absolute_pcm;
		}

		expect(amplitude2dBfullscale(max_absolute_pcm)).toBeLessThanOrEqual(-60); // (demofox)
		expect(amplitude2dBfullscale(Math.sqrt(average_energy_sum_powered / ARRAY_LEN))).toBeLessThanOrEqual(-60); // (demofox)
	});
});

describe("WEBA function whiteNoiseInt (JS)", function() {
	eval(whiteNoiseInt.toString()); // load the function under test in this scope
	it("should modify the input data", function() {
		const ARRAY_LEN = 10;
		for (let value_to_test = 0; value_to_test <= 255; value_to_test++) {
			let data = new Uint8Array(ARRAY_LEN);
			for (let i = 0; i < ARRAY_LEN; i++) {
				data[i] = value_to_test;
			}
			whiteNoiseInt(data);
			let modified = 0;
			for (let i = 0; i < ARRAY_LEN; i++) {
				if (data[i] !== value_to_test) {
					modified++;
				}
			}
			expect(modified).toBeGreaterThan(0); // Theoretically besides low energy inputs, it should be always ARRAY_LEN
		}
	});
	it("the maximal noise generated should be quiet", function() {
		const ARRAY_LEN = 1000000;
		let data = new Uint8Array(ARRAY_LEN);
		whiteNoiseInt(data);

		let max_absolute_pcm = 0; // one time sound
		let average_energy_sum_powered = 0; // long term noise
		for (let i = 0; i < ARRAY_LEN; i++) {
			const cur_absolute_pcm = data[i] / 256;
			if (cur_absolute_pcm > max_absolute_pcm) {
				max_absolute_pcm = cur_absolute_pcm;
			}
			average_energy_sum_powered += cur_absolute_pcm * cur_absolute_pcm;
		}

		// According to demofox -60 should be silence, however, the integer
		// precision generates a signal that is hearable, yet silent
		// -40dBfs was chosen arbitrary, change it to a more suitable value when
		// you think you have one
		expect(amplitude2dBfullscale(max_absolute_pcm)).toBeLessThanOrEqual(-40);
		expect(amplitude2dBfullscale(Math.sqrt(average_energy_sum_powered / ARRAY_LEN))).toBeLessThanOrEqual(-40);
	});
});
