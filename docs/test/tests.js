//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020  Peter Hornak
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

QUnit.assert.arrayEqual = function (a, b, msg) {
	function toArray(arr) {
		var resultArr = [];
		for (let i = 0; i < arr.length; ++i)
			resultArr[i] = arr[i];
		return resultArr;
	}

	this.deepEqual(toArray(a), toArray(b), msg);
};

QUnit.test('ArrayBufferViews', function (assert) {
	assert.expect(6);
	let buffer = new ArrayBuffer(56);
	let typedArr = new Uint32Array(buffer, 16);
	typedArr.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	assert.deepEqual(typedArr.buffer, buffer);
	assert.deepEqual(typedArr.byteOffset, 16);
	assert.deepEqual(typedArr.byteLength, 40);
	let dataView = new DataView(buffer, 32);
	assert.deepEqual(dataView.buffer, buffer);
	assert.deepEqual(dataView.byteOffset, 32);
	assert.deepEqual(dataView.byteLength, 24);
});

QUnit.test('TypedArraysInit', function (assert) {
	let typedArray;

	typedArray = new Uint32Array([1, 100, 1000, 2, 200]);
	assert.arrayEqual(typedArray, [1, 100, 1000, 2, 200], 'array');
	typedArray[0] = 10;
	assert.arrayEqual(typedArray, [10, 100, 1000, 2, 200], 'array');
	assert.deepEqual(typedArray.BYTES_PER_ELEMENT, 4, 'array');
	assert.deepEqual(typedArray.length * typedArray.BYTES_PER_ELEMENT, typedArray.byteLength, 'array');
	assert.deepEqual(typedArray.length, 5, 'array');
	assert.deepEqual(typedArray.byteOffset, 0, 'array');

	typedArray = new Uint8Array(5);
	assert.arrayEqual(typedArray, [0, 0, 0, 0, 0], 'len');
	typedArray.set([1, 2, 3, 4, 5]);
	assert.arrayEqual(typedArray, [1, 2, 3, 4, 5], 'len');
	typedArray[0] = 100;
	assert.arrayEqual(typedArray, [100, 2, 3, 4, 5], 'len');
	assert.deepEqual(typedArray.BYTES_PER_ELEMENT, 1, 'len');
	assert.deepEqual(typedArray.length * typedArray.BYTES_PER_ELEMENT, typedArray.byteLength, 'len');
	assert.deepEqual(typedArray.length, 5, 'len');
	assert.deepEqual(typedArray.byteOffset, 0, 'len');

	arrayBuffer = new ArrayBuffer(5);
	typedArray = new Uint8Array(arrayBuffer);
	assert.arrayEqual(typedArray, [0, 0, 0, 0, 0], 'buffer');
	typedArray.set([1, 2, 3, 4, 5]);
	assert.arrayEqual(typedArray, [1, 2, 3, 4, 5], 'buffer');
	typedArray[0] = 100;
	assert.arrayEqual(typedArray, [100, 2, 3, 4, 5], 'buffer');
	assert.deepEqual(typedArray.BYTES_PER_ELEMENT, 1, 'buffer');
	assert.deepEqual(typedArray.length * typedArray.BYTES_PER_ELEMENT, typedArray.byteLength, 'buffer');
	assert.deepEqual(typedArray.length, 5, 'buffer');
	assert.deepEqual(typedArray.byteOffset, 0, 'buffer');
});

QUnit.test('TypedArraysMethods', function (assert) {
	let defaultVals = [1, 2, 3, 4, 5];
	let typedArray = new Uint8Array(5);
	typedArray.set(defaultVals);
	assert.arrayEqual(typedArray, defaultVals);
	typedArray.reverse();
	assert.arrayEqual(typedArray, [5, 4, 3, 2, 1]);
	typedArray.sort();
	assert.arrayEqual(typedArray, defaultVals);
	typedArray.fill(10, 0, 2);
	assert.arrayEqual(typedArray, [10, 10, 3, 4, 5]);
	typedArray.copyWithin(2, 0, 2,);
	assert.arrayEqual(typedArray, [10, 10, 10, 10, 5]);
	let sub = typedArray.subarray(0, 4);
	assert.arrayEqual(sub, [10, 10, 10, 10]);
	sub[0] = 1;
	assert.deepEqual(sub[0], typedArray[0]);
	let slice = typedArray.slice(0, 2);
	assert.arrayEqual(slice, [1, 10]);
	slice[0] = 100;
	assert.notDeepEqual(slice[0], typedArray[0]);
	map = typedArray.map(x => x * 2);
	assert.arrayEqual(map, [2, 20, 20, 20, 10]);
	filter = typedArray.filter(x => x === 10);
	assert.arrayEqual(filter, [10, 10, 10]);
	reduce = typedArray.reduce(function (prev, curr) {
		return prev + curr;
	});
	assert.deepEqual(reduce, 36);
	reduceR = typedArray.reduce(function (prev, curr) {
		return prev + curr;
	});
	assert.deepEqual(reduceR, 36);
	assert.deepEqual(typedArray.lastIndexOf(10), 3);
	let forEachArr = [];
	typedArray.forEach(x => forEachArr.push(x));
	assert.deepEqual(forEachArr, [1, 10, 10, 10, 5]);
	let find = typedArray.find(function (value, index, obj) {
		return value > 1;
	});
	assert.deepEqual(find, 10);
	assert.deepEqual(typedArray.join(), "1,10,10,10,5");
	assert.deepEqual(typedArray.entries().next().value, [0, 1]);
	assert.deepEqual(typedArray.keys().next().value, 0);
	assert.deepEqual(typedArray.values().next().value, 1);

	assert.arrayEqual(Uint8Array.from([1, 2, 3]), [1, 2, 3]);
	assert.arrayEqual(Uint8Array.of(1, 2, 3, 4), [1, 2, 3, 4]);
});

QUnit.test('DataViewInit', function (assert) {
	let buff = new ArrayBuffer(16);
	let dataView = new DataView(buff);
	assert.deepEqual(dataView.byteLength, 16);
	assert.deepEqual(dataView.byteOffset, 0);
	assert.deepEqual(dataView.buffer, buff);
	dataView = new DataView(buff, 4, 8);
	assert.deepEqual(dataView.byteLength, 8);
	assert.deepEqual(dataView.byteOffset, 4);
});

const dataViewGets = ['getInt8', 'getInt16', 'getInt32', 'getUint8', 'getUint16', 'getUint32', 'getFloat32', 'getFloat64', 'getBigInt64', 'getBigUint64'];
const dataViewSets = ['setInt8', 'setInt16', 'setInt32', 'setUint8', 'setUint16', 'setUint32', 'setFloat32', 'setFloat64', 'setBigInt64', 'setBigUint64'];

QUnit.test('DataViewMethods', function (assert) {
	buff = new ArrayBuffer(128);
	dataView = new DataView(buff);
	for (let i in dataViewGets) {
		let n = i * 10 + 1;
		if (i >= dataViewGets.length - 2) {
			n = BigInt(n);
		}
		dataView[dataViewSets[i]](0, n);
		assert.deepEqual(dataView[dataViewGets[i]](0), n, 'Big endian');
	}

	for (let i in dataViewGets) {
		let n = i * 10 + 1;
		if (i >= dataViewGets.length - 2) {
			n = BigInt(n);
		}
		dataView[dataViewSets[i]](0, n, true);
		assert.deepEqual(dataView[dataViewGets[i]](0, true), n, 'Little endian');
	}

	dataView.setFloat64(1, 123456.7891);
	assert.deepEqual(dataView.getFloat64(1), 123456.7891, 'Floats');

	dataView.setInt32(2, -12345);
	assert.deepEqual(dataView.getInt32(2), -12345, 'Signed int');

	dataView.setBigInt64(0, -1234567890123456789n);
	res = dataView.getBigInt64(0);
	assert.deepEqual(res, -1234567890123456789n, 'Signed BigInt')
});

QUnit.test('OneBufferMoreViews', function (assert) {
	let aBuff = new ArrayBuffer(12);
	let typedArray = new Int8Array(aBuff);
	let dataView = new DataView(aBuff);
	typedArray[0] = 10;
	assert.deepEqual(typedArray[0], dataView.getInt8(0), 'Known failure');
});

QUnit.test('Worker', function (assert) {
	let worker;
	worker = new Worker('');

	assert.equal(worker.onmessage, null);
	assert.equal(worker.onerror, null);
	assert.equal(typeof worker.addEventListener, 'function');
	assert.equal(typeof worker.dispatchEvent, 'function');
	assert.equal(typeof worker.postMessage, 'function');
	assert.equal(typeof worker.removeEventListener, 'function');
	assert.equal(typeof worker.terminate, 'function');
});
