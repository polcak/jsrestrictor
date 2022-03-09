/** \file
 * \brief Wrappers for arrays from the ECMA standard library
 *
 *  \author Copyright (C) 2020  Peter Hornak
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

/** \file
 * \ingroup wrappers
 *
 * This wrapper aims on prevention of microarchitectural attacks like Meltdown and Spectre. This
 * code was originally a part of [ChromeZero](https://github.com/IAIK/ChromeZero).
 *
 * \bug The `subarray()` method always ruturns the full array.
 *
 * The wrappers support the following behaviour:
 *
 * * Offset: The content of the buffer is shifted by a fix offset. This is a faster method but can
 *   be removed.
 * * Random mapping: All items are mapped randomly. This is a slower method but more reliable.
 *
 * \see <https://www.fit.vut.cz/study/thesis/22374/?year=0&sup=Pol%C4%8D%C3%A1k>, especially Sect. 5.1
 */


/// \see This function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function packIEEE754(v, ebits, fbits) {
	var bias = (1 << (ebits - 1)) - 1;

	function roundToEven(n) {
		var w = Math.floor(n), f = n - w;
		if (f < 0.5)
			return w;
		if (f > 0.5)
			return w + 1;
		return w % 2 ? w + 1 : w;
	}

	// Compute sign, exponent, fraction
	var s, e, f;
	if (v !== v) {
		// NaN
		// http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
		e = (1 << ebits) - 1;
		f = Math.pow(2, fbits - 1);
		s = 0;
	} else if (v === Infinity || v === -Infinity) {
		e = (1 << ebits) - 1;
		f = 0;
		s = (v < 0) ? 1 : 0;
	} else if (v === 0) {
		e = 0;
		f = 0;
		s = (1 / v === -Infinity) ? 1 : 0;
	} else {
		s = v < 0;
		v = Math.abs(v);

		if (v >= Math.pow(2, 1 - bias)) {
			// Normalized
			e = Math.min(Math.floor(Math.log(v) / Math.LN2), 1023);
			var significand = v / Math.pow(2, e);
			if (significand < 1) {
				e -= 1;
				significand *= 2;
			}
			if (significand >= 2) {
				e += 1;
				significand /= 2;
			}
			var d = Math.pow(2, fbits);
			f = roundToEven(significand * d) - d;
			e += bias;
			if (f / d >= 1) {
				e += 1;
				f = 0;
			}
			if (e > 2 * bias) {
				// Overflow
				e = (1 << ebits) - 1;
				f = 0;
			}
		} else {
			// Denormalized
			e = 0;
			f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
		}
	}

	// Pack sign, exponent, fraction
	var bits = [], i;
	for (i = fbits; i; i -= 1) {
		bits.push(f % 2 ? 1 : 0);
		f = Math.floor(f / 2);
	}
	for (i = ebits; i; i -= 1) {
		bits.push(e % 2 ? 1 : 0);
		e = Math.floor(e / 2);
	}
	bits.push(s ? 1 : 0);
	bits.reverse();
	var str = bits.join('');

	// Bits to bytes
	var bytes = [];
	while (str.length) {
		bytes.unshift(parseInt(str.substring(0, 8), 2));
		str = str.substring(8);
	}
	return bytes;
}

/// \see This function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function unpackIEEE754(bytes, ebits, fbits) {
	// Bytes to bits
	var bits = [], i, j, b, str,
		bias, s, e, f;

	for (i = 0; i < bytes.length; ++i) {
		b = bytes[i];
		for (j = 8; j; j -= 1) {
			bits.push(b % 2 ? 1 : 0);
			b = b >> 1;
		}
	}
	bits.reverse();
	str = bits.join('');

	// Unpack sign, exponent, fraction
	bias = (1 << (ebits - 1)) - 1;
	s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
	e = parseInt(str.substring(1, 1 + ebits), 2);
	f = parseInt(str.substring(1 + ebits), 2);

	// Produce number
	if (e === (1 << ebits) - 1) {
		return f !== 0 ? NaN : s * Infinity;
	} else if (e > 0) {
		// Normalized
		return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
	} else if (f !== 0) {
		// Denormalized
		return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
	} else {
		return s < 0 ? -0 : 0;
	}
}

/// \see Function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function unpackF64(b) {
	return unpackIEEE754(b, 11, 52);
}

/// \see Function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function packF64(v) {
	return packIEEE754(v, 11, 52);
}

/// \see Function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function unpackF32(b) {
	return unpackIEEE754(b, 8, 23);
}

/// \see Function was adopted from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js under MIT licence.
function packF32(v) {
	return packIEEE754(v, 8, 23);
}

function constructDecorator(wrapped) {
	return function () {
		const res = wrapped.apply(originalF, arguments);
		return replacementF(res);
	}
}

function offsetDecorator(wrapped, type, proxyRef, offsetF) {
	return function () {
		var ref = proxyRef;
		let newArr = [];
		// Create a copy of array
		for (let i = 0; i < this.length; i++) {
			newArr[i] = this[offsetF(i)]
		}
		// Shift to original
		for (let i = 0; i < this.length; i++) {
			this[i] = newArr[i];
		}
		// Do func
		let res;
		if (type === 3) {
			res = new this.__proto__.constructor(this)[wrapped.name.split(' ')[1]]()
		} else {
			res = wrapped.apply(this, arguments);
		}
		// Create copy of new arr
		let secArr = [];
		for (let i = 0; i < this.length; i++) {
			secArr[i] = this[i];
		}
		for (let i = 0; i < this.length; i++) {
			this[offsetF(i)] = secArr[i];
		}
		switch (type) {
			case 0:
				return ref;
			case 1:
				return replacementF(res);
			case 2:
				return res;
			default:
				return res
		}
	}
}

function redefineNewArrayFunctions(target, offsetF) {
	target['sort'] = offsetDecorator(target['sort'], 0, target, offsetF);
	target['reverse'] = offsetDecorator(target['reverse'], 0, target, offsetF);
	target['fill'] = offsetDecorator(target['fill'], 0, target, offsetF);
	target['copyWithin'] = offsetDecorator(target['copyWithin'], 0, target, offsetF);
	target['subarray'] = offsetDecorator(target['subarray'], 0, target, offsetF);
	target['slice'] = offsetDecorator(target['slice'], 1, target, offsetF);
	target['map'] = offsetDecorator(target['map'], 1, target, offsetF);
	target['filter'] = offsetDecorator(target['filter'], 1, target, offsetF);
	target['set'] = offsetDecorator(target['set'], 2, target, offsetF);
	target['reduce'] = offsetDecorator(target['reduce'], 2, target, offsetF);
	target['reduceRight'] = offsetDecorator(target['reduceRight'], 2, target, offsetF);
	target['lastIndexOf'] = offsetDecorator(target['lastIndexOf'], 2, target, offsetF);
	target['indexOf'] = offsetDecorator(target['indexOf'], 2, target, offsetF);
	target['forEach'] = offsetDecorator(target['forEach'], 2, target, offsetF);
	target['find'] = offsetDecorator(target['find'], 2, target, offsetF);
	target['join'] = offsetDecorator(target['join'], 2, target, offsetF);
	target['entries'] = offsetDecorator(target['entries'], 3, target, offsetF);
	target['keys'] = offsetDecorator(target['keys'], 3, target, offsetF);
	target['values'] = offsetDecorator(target['values'], 3, target, offsetF);
}

function redefineNewArrayConstructors(target) {
	target['from'] = constructDecorator(originalF['from']);
	target['of'] = constructDecorator(originalF['of']);
}

/// Default proxy handler for Typed Arrays
var proxyHandler = `{
	get(target, key, receiver) {
		var random_idx = Math.floor(Math.random() * target['length']);
		// Load random index from array
		var rand_val = target[random_idx];
		/*
		let proto_keys = ['buffer', 'byteLength', 'byteOffset', 'length'];
		if (proto_keys.indexOf(key) >= 0) {
			return target[key];
		}
		*/
		// offsetF argument needs to be in array range
		if (typeof key !== 'symbol' && Number(key) >= 0 && Number(key) < target.length) {
			key = offsetF(key)
		}
		let value = target[key]
		return typeof value == 'function' ? value.bind(target) : value;
	},
	set(target, key, value) {
		var random_idx = Math.floor(Math.random() * (target['length']));
		// Load random index from array
		var rand_val = target[random_idx];
		rand_val = rand_val;
		if (typeof key !== 'symbol' && Number(key) >= 0 && Number(key) < target.length) {
			key = offsetF(key)
		}
		return target[key] = value;
	}
}`;

function getByteDecorator(wrapped, offsetF, name, doMapping) {
	return function () {
		const originalIdx = arguments[0];
		const endian = arguments[1];
		if (name === 'getUint8') {
			// Random access
			let ran = wrapped.apply(this, [Math.floor(Math.random() * (this.byteLength))]);
			// Call original func
			arguments[0] = offsetF(originalIdx);
			return wrapped.apply(this, arguments);
		}
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
		let res = 0;
		let swapNumber = byteNumber - 1;
		for (let i = 0; i < byteNumber; i++) {
			if (endian) {
				// Shift starting with 0,1,2
				swapNumber = i * 2;
			}
			res += this.getUint8(originalIdx + i) << ((swapNumber - i) * 8);
		}
		return res;
	}
}

function setByteDecorator(wrapped, offsetF, name, doMapping) {
	function toNBitBin(n, bits) {
		if (n < 0) {
			n = 0xFFFFFFFF + n + 1;
		}
		function makeString(n) {
			let s = "";
			for (let i = 0; i < n; i++) {
				s += "0";
			}
			return s;
		}
		return (makeString(bits) + parseInt(n, 10).toString(2)).substr(-bits);
	}

	return function () {
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const originalIdx = arguments[0];
		const value = arguments[1];
		const endian = arguments[2];
		if (name === 'setUint8') {
			// Random access
			this.getUint8(0);
			// Call original func
			arguments[0] = offsetF(originalIdx);
			return wrapped.apply(this, arguments);
		}
		const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
		const binNumber = toNBitBin(value, byteNumber * 8);
		let numberPart;
		for (let i = 0; i < byteNumber; i++) {
			numberPart = binNumber.substr(i * 8, 8);
			numberPart = parseInt(numberPart, 2);
			if (endian) {
				this.setUint8(originalIdx + byteNumber - i - 1, numberPart);
			} else {
				this.setUint8(originalIdx + i, numberPart);
			}
		}
		return undefined;
	}
}

function getFloatDecorator(wrapped, name, doMapping) {
	return function () {
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const originalIdx = arguments[0];
		if (originalIdx === undefined) {
			wrapped.apply(this, arguments)
		}
		const endian = arguments[1];
		const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
		let binArray = [];
		// Random access
		this.getUint8(0);
		for (let i = 0; i < byteNumber; i++) {
			binArray[binArray.length] = this.getUint8(originalIdx + i);
		}
		if (endian) {
			binArray = binArray.reverse()
		}
		if (byteNumber === 4) {
			return unpackF32(binArray);
		} else {
			return unpackF64(binArray);
		}
	}
}

function setFloatDecorator(wrapped, name, doMapping) {
	return function () {
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const originalIdx = arguments[0];
		const value = arguments[1];
		if (originalIdx === undefined || value === undefined) {
			wrapped.apply(this, arguments)
		}
		const endian = arguments[2];
		const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
		let binArray;

		// Random access
		this.getUint8(0);
		if (byteNumber === 4) {
			binArray = packF32(value);
		} else {
			binArray = packF64(value);
		}
		for (let i = 0; i < binArray.length; i++) {
			if (endian) {
				this.setUint8(originalIdx + byteNumber - i - 1, binArray[i]);
			} else {
				this.setUint8(originalIdx + i, binArray[i]);
			}
		}
		return undefined;
	}
}

function getBigIntDecorator(wrapped, doMapping) {
	return function () {
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const originalIdx = arguments[0];
		if (originalIdx === undefined) {
			wrapped.apply(this, arguments)
		}
		const endian = arguments[1];
		let hex = [];
		let binArray = [];
		for (let i = 0; i < 8; i++) {
			binArray[binArray.length] = this.getUint8(originalIdx + i);
		}
		if (endian) {
			binArray = binArray.reverse();
		}
		for (let i of binArray) {
			let h = i.toString(16);
			if (h.length % 2) {
				h = '0' + h;
			}
			hex.push(h);
		}
		let result = BigInt('0x' + hex.join(''));
		if (binArray[0] >= 128) {
			return result - 18446744073709551615n - 1n;
		}
		return result
	}
}

function setBigIntDecorator(wrapped, doMapping) {
	return function () {
		if (!doMapping){
			this.getUint8(0);
			return wrapped.apply(this, arguments);
		}
		const originalIdx = arguments[0];
		let value = arguments[1];
		if (originalIdx === undefined || value === undefined || typeof value !== 'bigint') {
			return wrapped.apply(this, arguments)
		}
		const endian = arguments[2];
		if (value < 0n) {
			value = 18446744073709551615n + value + 1n;
		}
		let hex = BigInt(value).toString(16);
		if (hex.length % 2) {
			hex = '0' + hex;
		}

		const len = hex.length / 2;
		let binArray = [];
		let j = 0;
		// Random access
		this.getUint8(0);
		for (let i = 0; i < 8; i++) {
			if (i < 8 - len) {
				binArray[binArray.length] = 0;
			} else {
				binArray[binArray.length] = parseInt(hex.slice(j, j + 2), 16);
				j += 2;
			}
		}
		if (endian) {
			binArray.reverse();
		}
		for (let i in binArray) {
			this.setUint8(originalIdx + parseInt(i), binArray[i])
		}
		return undefined;
	}
}

function redefineDataViewFunctions(target, offsetF, doMapping) {
	// Replace functions working with Ints
	var dataViewTypes = ['getInt8', 'getInt16', 'getInt32', 'getUint8', 'getUint16', 'getUint32'];
	for (type of dataViewTypes) {
		target[type] = getByteDecorator(target[type], offsetF, type, doMapping);
		type = 's' + type.substr(1);
		target[type] = setByteDecorator(target[type], offsetF, type, doMapping);
	}

	var dataViewTypes2 = ['getFloat32', 'getFloat64'];
	for (type of dataViewTypes2) {
		target[type] = getFloatDecorator(target[type], type, doMapping);
		type = 's' + type.substr(1);
		target[type] = setFloatDecorator(target[type], type, doMapping);
	}
	var dataViewTypes3 = ['getBigInt64', 'getBigUint64'];
	for (type of dataViewTypes3) {
		target[type] = getBigIntDecorator(target[type], doMapping);
		type = 's' + type.substr(1);
		target[type] = setBigIntDecorator(target[type], doMapping);
	}

};

(function () {
	var common_function_body = `
	let _data;
	if (typeof target === 'object' && target !== null) {
		if (is_proxy in target){
			// If already Proxied array is passed as arg return it
			return target;
		}
	}
	_data = new originalF(...arguments);
	// No offset
	var offsetF = function(x) {
		return x;
	};
	if (doMapping) {
		// Random numbers for offset function
		let n = _data.length;
		let a;
		while (true){
			a = Math.floor(Math.random() * 4096);
			if (gcd(a,n) === 1){
				break;
			}
		}
		let b = Math.floor(Math.random() * 4096);
		// Define function to calculate offset;
		offsetF = function(x) {
			if (x === undefined){
				return x;
			}
			x = x < 0 ? n + x : x;
			return (a*x + b) % n ;
		};
		let arr = []
		for (let i = 0; i < _data.length; i++) {
			arr[i] = _data[i];
		}

		for (let i = 0; i < _data.length; i++) {
			_data[offsetF(i)] = arr[i];
		}
	}
	var proxy = new newProxy(_data, ${proxyHandler});
	// Proxy has to support all methods, original object supports.
	${offsetDecorator};
	${redefineNewArrayFunctions};
	if (doMapping) {
		// Methods have to work with offsets;
		redefineNewArrayFunctions(proxy, offsetF);
	}
	// Preload array
	let j;
	for (let i = 0; i < _data['length']; i++) {
		j = _data[i];
	}
	return proxy;
	`;

	var wrappers = [
		{
			parent_object: 'window',
			parent_object_property: 'DataView',
			original_function: 'window.DataView',
			wrapped_objects: [],
			wrapping_function_args: 'buffer, byteOffset, byteLength',
			helping_code: packIEEE754 + unpackIEEE754 + packF32 + unpackF32 + packF64 + unpackF64 + `
			function gcd(x, y) {
				while(y) {
					var t = y;
					y = x % y;
					x = t;
				}
			return x;
			}
			var doMapping = args[0];
			`,
			wrapping_function_body: `
				let _data = new originalF(...arguments);
				let n = _data.byteLength;
				let a;
				while (true){
					a = Math.floor(Math.random() * 4096);
					if (gcd(a,n) === 1){
						break;
					}
				}
				let b = Math.floor(Math.random() * 4096);
				// Define function to calculate offset;
				offsetF = function(x) {
					if (x === undefined){
						return x;
					}
					x = x < 0 ? n + x : x;
					return (a*x + b) % n ;
				};
				${getByteDecorator}
				${setByteDecorator}
				${getFloatDecorator}
				${setFloatDecorator}
				${getBigIntDecorator}
				${setBigIntDecorator}
				${redefineDataViewFunctions}
				for (let i = 0; i < n; i++) {
					let random = _data.getUint8(i);
				}
				if (!doMapping){
					offsetF = function(x) {
						return x;
					}
				}
				redefineDataViewFunctions(_data, offsetF, doMapping);
				return _data;
			`,
		},
	];


	let DEFAULT_TYPED_ARRAY_WRAPPER = {
		parent_object: 'window',
		parent_object_property: '_PROPERTY_',
		original_function: 'window._PROPERTY_',
		wrapped_objects: [],
		helping_code:`
		let doMapping = args[0];
		var proxyHandler = ${proxyHandler};
		function gcd(x, y) {
		while(y) {
			var t = y;
			y = x % y;
			x = t;
		}
		return x;
		}

		const is_proxy = Symbol('is_proxy');
		const originalProxy = Proxy;
		var proxyHandler = {
			has (target, key) {
				return (is_proxy === key) || (key in target);
			}
	  };
		let newProxy = new originalProxy(originalProxy, {
			construct(target, args) {
				return new originalProxy(new target(...args), proxyHandler);
			}
		});
		`,
		wrapping_function_args: `target`,
		wrapping_function_body: common_function_body,
		post_replacement_code: `
		${constructDecorator}
		${redefineNewArrayConstructors}
		redefineNewArrayConstructors(window._PROPERTY_);
		`
	};

	var typedTypes = ['Uint8Array', 'Int8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'];
	for (let p of typedTypes) {
		let wrapper = {...DEFAULT_TYPED_ARRAY_WRAPPER};
		wrapper.parent_object_property = wrapper.parent_object_property.replace('_PROPERTY_', p);
		wrapper.original_function = wrapper.original_function.replace('_PROPERTY_', p);
		wrapper.post_replacement_code = wrapper.post_replacement_code.split('_PROPERTY_').join(p);
		wrapper.wrapping_function_body += `// ${p};`;
		wrappers.push(wrapper);
	}

	add_wrappers(wrappers);
})();
