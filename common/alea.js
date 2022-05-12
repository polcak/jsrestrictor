/** \file
* \brief Random number generator
*
* A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010 and 
* Tommy Ettinger (tommy.ettinger@gmail.com)
*
* Original code is available at
* http://baagoe.com/en/RandomMusings/javascript/
* https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
* https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
*
* SPDX-License-Identifier: GPL-3.0-or-later
* SPDX-License-Identifier: MIT
*
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
* \license Original work is under MIT license and in public domain, the derived code is under GPL-3.0-or-later
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
	mash.addData(' ');

	for (var i = 0; i < args.length; i++) {
		mash.addData(args[i]);
	}
	this.seed = mash.n | 0; // Create a 32-bit UInt
	mash = null;
	this.xoring = [];
	for (let i = 0; i < 64; i += 8) {
		this.xoring.push(parseInt(domainHash.slice(i, i+8), 16) >>> 0); // Store 32-bit unsigned integers
	}
}
Alea.prototype = {
	current: 0,
	stored_random: 0,
	random_bits: 0,
	next: function() {
		this.seed += 0x6D2B79F5;
		var t = this.seed;
		this.current = (this.current + t) & 7;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return (((t ^ t >>> 14) ^ this.xoring[this.current]) >>> 0); // '>>> 0' casts to unsigned
	},
	normalized: function() {
		return this.next() / 4294967296;
	},
	get_bits: function(count) {// 0 < count <= 32
		if (count === 32) {
			return this.next();
		}
		else if (count <= this.random_bits) {
			let mask = ((1 << count) >>> 0) - 1;
			let ret = this.stored_random & mask;
			this.stored_random = this.stored_random >>> count;
			this.random_bits -= count;
			return ret;
		}
		else {
			let needed = count - this.random_bits;
			let ret = this.stored_random << needed;
			this.random_bits = 32;
			this.stored_random = this.next();
			return ret | this.get_bits(needed);
		}
	}
}

function impl(...seed) {
	var xg = new Alea(...seed);
	var prng = xg.normalized.bind(xg);
	prng.uint32 = xg.next.bind(xg);
	prng.fract53 = function() {
		return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
	};
	prng.get_bits = xg.get_bits.bind(xg);
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
