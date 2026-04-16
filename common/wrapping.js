/** \file
 * \brief Main file handling wrappers
 *
 *  \author Copyright (C) 2019  Libor Polcak
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

/**
 * \defgroup wrappers JavaScript Shield
 *
 * \brief Wrappers are small pieces of code that modifies the original functionalty of a function,
 * or property defined by standards.
 *
 * $(PROJECT_NAME) defines wrappers to modify the behaviour of the JavaScript environment. The
 * purpose of the most of the wrappers can be divided into several categories:
 *
 * * Block APIs: some APIs are not generally needed and can be blocked for most of the pages.
 * * Precision reduction: The returned value is too precise which might result into attacks on the
 * browser or can be used to fingerprint users.
 * * Hide information: Some APIs provide information that is not generally needed and can be hidden
 * from most of the pages.
 * * Provide fake information: We provide fake information mostly to confuse fingerprinters.
 */

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
	return numberToRound - (numberToRound % precision);
}`;

/**
 * Function to be used by wrapped code for adding randomized noise
 *
 * Mostly, browsers represent time-related values without decimal
 * part. Milliseconds are often available via a separate call. But
 * some values returned by Chromium-based browsers have decimal part.
 * For example, event timestamps or performance.now() return decimal
 * numbers in Chromium-based browsers, e.g. 92348.90000000224,
 * 281.70000000298023, or 24702.69999999553.
 */
let CONSECUTIVE_DIGITS_ROUNDING_ERROR = 2;
var noise_function = `let lastValue = 0;
	function factorHeuristics(n) {
		if (Number.isInteger(n)) {
			return 1;
		}
		
		const n_str = n.toString();
		const dot_pos = n_str.indexOf('.');
		let factor = 1;
		let factor_possible_rounding_error = 1;
		let zero_group_length = 0;
		let nine_group_length = 0;
		
		for (let i = dot_pos+1;
				i < n_str.length;
				i++) {
			factor_possible_rounding_error *= 10;
			const c = n_str[i];
			if (c === '0') {
				zero_group_length++;
				nine_group_length = 0;
				if (zero_group_length >= ${CONSECUTIVE_DIGITS_ROUNDING_ERROR}) {
					return factor;
				}
			}
			else if (c === '9') {
				zero_group_length = 0;
				nine_group_length++;
				if (nine_group_length >= ${CONSECUTIVE_DIGITS_ROUNDING_ERROR}) {
					return factor;
				}
			}
			else {
				zero_group_length = 0;
				nine_group_length = 0;
				factor = factor_possible_rounding_error;
			}
		}
		
		return factor_possible_rounding_error;
	}
	function decimal_part(n) {
		let n_str = n.toString();
		return n_str.substring(n_str.indexOf('.')+1);
	}
	function noise_function(numberToChange, precision) {
		// Check if the input number is integer
		let factor = factorHeuristics(numberToChange);
		let noise;
		var candidate_result;
		if (factor == 1) {
			noise = Math.floor(Math.random() * precision);
			candidate_result = numberToChange + noise;
		}
		else {
			noise = Math.random() * precision;
			candidate_result = Math.floor((numberToChange + noise) * factor) / factor;
		}
    if (lastValue < candidate_result) {
        lastValue = candidate_result;
    }
    return lastValue;
}`;
