//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The object carrying all the wrappers
 */
var build_wrapping_code = {};

/**
 * Adds a list of wrapping objects to the build_wrapping_code.
 *
 * This function is called from each wrapper in its file.
 */
function add_wrappers(wrappers) {
	for (wrapper of wrappers) {
		build_wrapping_code[wrapper.parent_object + "." + wrapper.parent_object_property] = wrapper;
	}
}

/**
 * Function to be used by wrapped code used for rounding
 */
var rounding_function = `function rounding_function(numberToRound, precision) {
	return numberToRound - (numberToRound % Math.pow(10, Math.max(3 - precision)));
}`;

/**
 * Function to be used by wrapped code for adding randomized noise
 */
var noise_function = `let lastValue = 0;
	function noise_function(numberToChange, precision) {
    const noise = Math.floor(Math.random() * Math.pow(10, 3 - precision));
    const arr = (numberToChange + '').split('.');
    const number = parseInt(arr[0]);
    const decimal = parseInt(arr[1]);
    var value = number - (number % noise) + parseFloat('0.' + (decimal - (decimal % noise)));
    if (lastValue < value) {
        lastValue = value;
    }
    return lastValue;
}`;
