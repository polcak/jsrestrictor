describe("Function CRC16", function () {
	function checkEqualInt(data) {
		wasm.set(data);
		const crcWASM = wasm.crc16(data.byteLength);

		const crc = new CRC16();
		crc.next(data);
		const crcJS = crc.crc;

		expect(crcWASM).toEqual(crcJS);
	}

	function checkEqualFloat(data) {
		expect(wasm.grow(data.byteLength)).toBe(true);
		wasm.set(data, 0, true);
		const crcWASM = wasm.crc16Float(data.byteLength);

		const crc = new CRC16();
		const MAXUINT32 = 4294967295;
		for (let i = 0; i < data.length; i++) {
			crc.single(data[i] * MAXUINT32);
		}
		const crcJS = crc.crc;

		expect(crcWASM).toEqual(crcJS);
	}

	var wasm = { ready: false };
	eval(crc16);

	beforeAll(function initWASM(done) { // init WASM module before tests
		let code = insert_wasm_code("// WASM_CODE //");
		// replace debug message with done() call to signal that the module is ready
		code = code.replace('console.debug("WASM farbling module initialized");', 'done();');
		eval(code);
	});

	it("should provide consistent results for both JS and WASM implementations for empty byte data.", function () {
		expect(wasm.ready).toBe(true);
		const data = new Uint8Array(40000);
		checkEqualInt(data);
	});
	it("should provide consistent results for both JS and WASM implementations for constant byte data.", function () {
		expect(wasm.ready).toBe(true);
		const data = new Uint8Array(40000);
		for (let i = 0; i < data.length; i++) {
			data[i] = i % 256;
		}
		checkEqualInt(data);
	});
	it("should provide consistent results for both JS and WASM implemenations for random byte data.", function () {
		expect(wasm.ready).toBe(true);
		for (let i = 0; i < 5; i++) {
			const randomData = new Uint8Array(40000);
			for (let i = 0; i < randomData.length; i++) {
				randomData[i] = Math.random() * 256;
			}
			checkEqualInt(randomData);
		}
	});

	it("should provide consistent results for both JS and WASM implementations for empty float data.", function () {
		expect(wasm.ready).toBe(true);
		const data = new Float32Array(40000);
		checkEqualFloat(data);
	});
	it("should provide consistent results for both JS and WASM implementations for constant float data.", function () {
		expect(wasm.ready).toBe(true);
		const data = new Float32Array(40000);
		for (let i = 0; i < data.length; i++) {
			data[i] = (i % 256) / 256;
		}
		checkEqualFloat(data);
	});
	it("should provide consistent results for both JS and WASM implemenations for random float data.", function () {
		expect(wasm.ready).toBe(true);
		for (let i = 0; i < 5; i++) {
			const randomData = new Float32Array(10000);
			for (let i = 0; i < randomData.length; i++) {
				randomData[i] = Math.random() * 2 - 1;
			}
			checkEqualFloat(randomData);
		}
	});
});
