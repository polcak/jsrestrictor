/** \file
 * \brief Simple functions that can be used by the extension
 *
 *  \author Copyright (C) 2020  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
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

function escape(str) {
	var map =	{
		'"': '&quot;',
		"'": '&#039;',
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};
	return str.replace(/["'&<>]/g, (c) =>  map[c]);
}

/**
 * Transform byte to Hex value
 */
function byteToHex(byte) {
  return ('0' + byte.toString(16)).slice(-2);
}

/**
 * Generate random 32-bit number.
 */
function gen_random32() {
	var array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0];
}

/**
 * Generate random 64-bit number.
 */
function gen_random64() {
  var array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  return BigInt("" + array[0] + array[1]);
}

/**
 * Generate random hash - default length is 32 bytes.
 */
function generateId(len = 32) {
  var arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, byteToHex).join("");
}

/**
 * Remove "www." at the beggining of the given hostname.
 */
function wwwRemove(hostname) {
	return String(hostname).replace(/^www\./,'');
}

/**
 * \brief shifts number bits to pick new number
 * \param v BigInt number to shift
 */
function lfsr_next(v) {
	return BigInt.asUintN(64, ((v >> 1n) | (((v << 62n) ^ (v << 61n)) & (~(~0n << 63n) << 62n))));
}
/**
 * \brief generates pseudorandom string based on domain key
 * \param length Number length of generated string
 * \param charSetEnum Number enum choosing charset
 */
function randomString(length, charSetEnum) {
	var ret = "";
	var charSets = ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ ", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"];
	var charSet = charSets[charSetEnum];
	for ( var i = 0; i < length; i++ ) {
			ret += charSet.charAt(Math.floor(prng() * charSet.length));
	}
	return ret;
}
/** \brief shuffle given array according to domain key
 * \param array input array
 *
 * Fisher–Yates shuffle algorithm - Richard Durstenfeld's version
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(prng() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
	}
}
/**
 * \brief makes number from substring of given string - should work as reinterpret_cast
 * \param str String
 * \param length Number specifying substring length
 */
function strToUint(str, length){
	var sub = str.substring(0,length);
	var ret = "";
	for (var i = sub.length-1; i >= 0; i--) {
			ret += ((sub[i].charCodeAt(0)).toString(2).padStart(8, "0"));
	}
	return "0b"+ret;
};

/**
 * \brief Asynchronously sleep for given number of milliseconds
 * \param ms Number of milliseconds to sleep
 */
async function async_sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
