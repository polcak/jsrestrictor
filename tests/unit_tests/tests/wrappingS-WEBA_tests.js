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

            expect(floatsWASM.every((value, index) => value === floatsJS[index])).toEqual(true);
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
