//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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
/**
 * Function to be used by geolocation wrapper for adding randomized noise
 */
var geolocation_noise_function = `
function geolocation_noise_function(numberToChange, precision) {
	var rounded = rounding_function(numberToChange, precision);
	return rounded + Math.random() * Math.pow(10, 3 - precision);
}`;
