/** \file
* \brief A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
*
* This code is available at
* http://baagoe.com/en/RandomMusings/javascript/
* https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
*
* SPDX-License-Identifier: MIT
* \license Original work is under MIT license
*/
//
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * alea creates a function that is functionally equivalent to Math.random.
 *
 * That is, successive calls of the returned function return Number values
 * with positive sign, greater than or equal to 0 but less than 1, chosen
 * pseudo-randomly with approximately uniform distribution over that range.
 *
 * The internal state of random, and hence the sequence of pseudo-random
 * numbers it returns, is determined by the arguments to alea. Two functions
 * returned by calls to alea with the same argument values will return exactly
 * the same sequence of pseudo-random numbers. String and Number arguments
 * should provide repeatable output across platforms. Object arguments[3]
 * provide repeatable output on the same platform, but not necessarily on others.
 *
 * Please call alea() with at least one argument, the implementation with
 * nno arguments described by Baagøe was not implemented here. This provides
 * easy means to provide somewhat unpredictable numbers, like Math.random does.
 *
 * Example usage: let module_prng = alea(domainHash, "MyModuleName"); module_prng();
 *
 * See more details in the README.md at
 * https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
 */
var alea =`
function Alea(...args) {
	var mash = new Mash();

	// Apply the seeding algorithm from Baagoe.
	this.c = 1;
	this.s0 = mash.addData(' ').finalize();
	this.s1 = mash.addData(' ').finalize();
	this.s2 = mash.addData(' ').finalize();

	for (var i = 0; i < args.length; i++) {
		this.s0 -= mash.addData(args[i]).finalize();
		if (this.s0 < 0) {
			this.s0 += 1;
		}
		this.s1 -= mash.addData(args[i]).finalize();
		if (this.s1 < 0) {
			this.s1 += 1;
		}
		this.s2 -= mash.addData(args[i]).finalize();
		if (this.s2 < 0) {
			this.s2 += 1;
		}
	}
	mash = null;
}
Alea.prototype = {
	next: function() {
		var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
		this.s0 = this.s1;
		this.s1 = this.s2;
		return this.s2 = t - (this.c = t | 0);
	}
}

function impl(...seed) {
	var xg = new Alea(...seed);
	var prng = xg.next.bind(xg);
	prng.uint32 = function() {
		return (xg.next() * 0x100000000) | 0;
	}
	prng.fract53 = function() {
		return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
	};
	prng.quick = prng;
	return prng;
}

// Original at https://github.com/nquinlan/better-random-numbers-for-javascript-mirror/blob/master/support/js/Mash.js
function Mash()
{
	this.n = 0xefc8249d;
}
Mash.prototype = {
	addData: function(data) {
		data = String(data);
		for (var i = 0; i < data.length; i++) {
			this.addNumber(data.charCodeAt(i));
		}
		return this;
	},
	addNumber: function(num) {
		this.n += num;
		var h = 0.02519603282416938 * this.n;
		this.n = h >>> 0;
		h -= this.n;
		h *= this.n;
		this.n = h >>> 0;
		h -= this.n;
		this.n += h * 0x100000000; // 2^32
		return this;
	},
	finalize: function() {
		return (this.n >>> 0) * 2.3283064365386963e-10; // 2^-32
	}
}
var alea = impl;
`
