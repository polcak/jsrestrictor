describe("Canvas function farble", function() {
    var wasm = {ready: false};
    var consoleDebug = console.debug;
    const args = [0]; // set approach to farbling
    let origGetImageData = function(...args) { // mock origGetImageData to return fake data
        const data = {data: new Uint8Array(args[2] * args[3] * 4)};
        for (let i = 0; i < data.data.length; i++) {
            data.data[i] = i % 256;
        }
        return data; 
    };
    const ctx = { // mock original canvas context
        canvas: {
            width: 100,
            height: 100
        }
    }
    const fake = { // mock fake canvas context
        putImageData: function(data) {
            this.data = data.data; // save data for later retrieval
        }
    };
    eval(wrappers[1].helping_code); // load farble function in this scope
	beforeAll(function initWASM(done) {
        console.debug = function() {}; // suppress console output
        let code = insert_wasm_code("// WASM_CODE //");
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});
    afterAll(function() {
        console.debug = consoleDebug;
    });
    
    it("should provide consistent results for both JS and WASM implementations for entire canvas.",function() {
        expect(wasm.ready).toBe(true);
        farble(ctx, fake);
        const pixelsWASM = fake.data;

        wasm.ready = false;
        farble(ctx, fake);
        const pixelsJS = fake.data;
        wasm.ready = true;

        expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
    });
    it("should provide consistent results for both JS and WASM implemenations for random data.", function() {
        for (let i = 0; i < 50; i++) {
            // redefine origGetImageData to return same random data
            const randomData = new Uint8Array(40000);
            for (let i = 0; i < randomData.length; i++) {
                randomData[i] = Math.random() * 256;
            }
            origGetImageData = function(...args) {
                return {data: randomData};
            };
            
            expect(wasm.ready).toBe(true);
            farble(ctx, fake);
            const pixelsWASM = fake.data;

            wasm.ready = false;
            farble(ctx, fake);
            const pixelsJS = fake.data;
            wasm.ready = true;

            expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
        }
    });
    it("should provide consistent results for both JS and WASM implemenations for empty data.", function() {
        origGetImageData = function(...args) {
            return {data: new Uint8Array(40000)};
        };
        
        expect(wasm.ready).toBe(true);
        farble(ctx, fake);
        const pixelsWASM = fake.data;

        wasm.ready = false;
        farble(ctx, fake);
        const pixelsJS = fake.data;
        wasm.ready = true;

        expect(pixelsWASM.every((value, index) => value === pixelsJS[index])).toEqual(true);
    });
});
