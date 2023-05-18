describe("WEBGL function farblePixels", function() {
    var wasm = {ready: false};
    var consoleDebug = console.debug;
    var args = [0]; // set approach to farbling
    var origReadPixels = function(...args) { // mock origReadPixels to return fake data
        const data = new Uint8Array(args[3] * args[4] * 4);
        for (let i = 0; i < data.length; i++) {
            data[i] = i % 256;
        }
        return data;
    };
    var gl = { // mock WebGL context
        drawingBufferWidth: 100,
        drawingBufferHeight: 100,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
    };
    eval(farblePixels.toString()); // load farblePixels function in this scope
	beforeAll(function initWASM(done) { // init WASM module before tests
        console.debug = function() {}; // suppress console output
        let code = insert_wasm_code("// WASM_CODE //");
        // replace debug message with done() call to signal that the module is ready
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});
    afterAll(function() {
        console.debug = consoleDebug;
    });
    
    it("should provide consistent results for both JS and WASM implementations for entire canvas.",function() {
        expect(wasm.ready).toBe(true);
        const pixelsWASM = new Uint8Array(40000);
        farblePixels(gl, 0, 0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsWASM);

        wasm.ready = false;
        const pixelsJS = new Uint8Array(40000);
        farblePixels(gl, 0, 0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsJS);
        wasm.ready = true;

        expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
    });
    it("should provide consistent results for both JS and WASM implementations for canvas edges.",function() {
        const coords = [[-50, -50, 100, 100], [-50, 0, 100, 100], [0, -50, 100, 100], [50, 0, 100, 100], [0, 50, 100, 100], [50, 50, 100, 100]];
        for (const coord of coords) {
            expect(wasm.ready).toBe(true);
            const pixelsWASM = new Uint8Array(40000);
            farblePixels(gl, ...coord, gl.RGBA, gl.UNSIGNED_BYTE, pixelsWASM);

            wasm.ready = false;
            const pixelsJS = new Uint8Array(40000);
            farblePixels(gl, ...coord, gl.RGBA, gl.UNSIGNED_BYTE, pixelsJS);
            wasm.ready = true;

            expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
        }
    });
    it("should provide consistent results for both JS and WASM implementations for canvas edges with smaller selection.",function() {
        const coords = [[-50, -50, 50, 50], [-50, 0, 50, 50], [0, -50, 50, 50], [50, 0, 50, 50], [0, 50, 50, 50], [50, 50, 50, 50]];
        for (const coord of coords) {
            expect(wasm.ready).toBe(true);
            const pixelsWASM = new Uint8Array(20000);
            farblePixels(gl, ...coord, gl.RGBA, gl.UNSIGNED_BYTE, pixelsWASM);

            wasm.ready = false;
            const pixelsJS = new Uint8Array(20000);
            farblePixels(gl, ...coord, gl.RGBA, gl.UNSIGNED_BYTE, pixelsJS);
            wasm.ready = true;

            expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
        }
    });
    it("should provide consistent results for both JS and WASM implementations outside of canvas.",function() {
        expect(wasm.ready).toBe(true);
        const pixelsWASM = new Uint8Array(40000);
        farblePixels(gl, 100, 100, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsWASM);

        wasm.ready = false;
        const pixelsJS = new Uint8Array(40000);
        farblePixels(gl, 100, 100, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsJS);
        wasm.ready = true;

        expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
    });
    it("should provide consistent results for both JS and WASM implementations for empty canvas.",function() {
        origReadPixels = function(...args) {
            return new Uint8Array(args[3] * args[4] * 4);
        };
        expect(wasm.ready).toBe(true);
        const pixelsWASM = new Uint8Array(40000);
        farblePixels(gl, 0, 0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsWASM);

        wasm.ready = false;
        const pixelsJS = new Uint8Array(40000);
        farblePixels(gl, 0, 0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixelsJS);
        wasm.ready = true;

        expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
    });
});
