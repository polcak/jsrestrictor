//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
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
 * Generate random 32-bit number.
 */
function gen_random32() {
	var array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0];
}

/**
 * Remove "www." at the beggining of the given hostname.
 */
function wwwRemove(hostname) {
	return String(hostname).replace(/^www\./,'');
}
