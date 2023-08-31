/** \file
 * \brief Efficient AssemblyScript implementation of farbling
 *
 *  \author Copyright (C) 2023  Martin Zmitko
 * 
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

// Memory layout:
// +-----------------+--------------+----------+---------------------------------------- - -
// | CRC table       | Xoring table | Reserved | Data
// | 256 * u16       | 8 * u32      |          | 
// +-----------------+--------------+----------+---------------------------------------- - -
// 0                 512            544        1024
const crc_offset: usize = 0;
const xoring_offset: usize = 512;
const reserved_offset: usize = 544;
const data_offset: usize = 1024;

var seed: u64;
var current: u8;
var stored_random: u32;
var random_bits: u32;

// To be compatible with the JS version, we have to be careful about correct data types and conversions.
// In JavaScript, all numbers are stored as 64bit floats, but for bitwise operations, the values are truncated to
// 32bit signed integers. After the bitwise operation, the resulting value is converted back.
// Because the PRNG algorithm uses both arithmetic and bitwise operations, we have to use
// u64 for arithmetic operations, but recast to u32 for bitwise operations, even when the result is
// supposed to be a u32.
function next(): void {
	seed += 0x6D2B79F5;
	current = ((current + seed) & 7) as u8;
	let t: u64 = seed as u32;
	t = ((t ^ t >> 15) * (t | 1)) as u32;
	t ^= (t + (t ^ t >> 7) * (t | 61)) as u32;
	stored_random = ((t ^ t >> 14) ^ load<u32>(current * 4, xoring_offset)) as u32;
	random_bits = 32;
}

function init(alea_seed: u64): void {
	seed = alea_seed;
	current = 0;
	stored_random = 0;
	random_bits = 0;
}

// Functions for crc calculation depend on pre-calculated table supplied during initialization
export function crc16(size: usize): u16 {
	let crc: u16 = 0;
	for (let i: usize = 0; i < size; i++) {
		crc = load<u16>(((crc ^ load<u8>(i, data_offset)) & 0xff) * 2, crc_offset) ^ (crc >> 8);
	}
	return crc;
}

export function crc16Float(size: usize): u16 {
	let crc: u16 = 0;
	for (let i: usize = 0; i < size; i += 4) {
		crc = load<u16>(((crc ^ (load<f32>(i, data_offset) as f64 * 4294967295) as i64) & 0xff) as usize * 2, crc_offset) ^ (crc >> 8);
	}
	return crc;
}

// Farble bytes in-place in memory, data is expected to begin at data_offset
// If is_canvas is true, alpha channel (every 4th byte) is not modified
export function farbleBytes(size: usize, alea_seed: u32, is_canvas: bool): void {
	init(alea_seed);
	for (let i: usize = 0; i < size; i++) {
		if (is_canvas && i % 4 === 3) {
			continue; // Do not modify alpha
		}
		if (random_bits == 0) {
			next();
		}
		if (stored_random & 1) { // Modify data with probability of 0.5
			store<u8>(i, load<u8>(i, data_offset) ^ 1, data_offset);
		}
		stored_random >>= 1;
		random_bits--;
	}
}

// Farble 32bit floats in-place in memory, data is expected to begin at data_offset
// size is specified in bytes
export function farbleFloats(size: usize, alea_seed: u32): void {
	init(alea_seed);
	for (let i: usize = 0; i < size; i += 4) {
		next();
		store<f32>(i, f32(load<f32>(i, data_offset) as f64 * (0.99 + (stored_random as f64 / 429496729600))), data_offset);
	}
}

// Copy farbled data at data_offset to out_offset based on original selection window and flip rows
// x, y: top left corner of selection
// width, height: size of selection
// gl_width, gl_height: size of original canvas
export function adjustWebGL(x: i32, y: i32, width: i32, height: i32, gl_width: i32, gl_height: i32): void {
	const DESIRED_WIDTH: i32 = width * 4;
	const XXMAX: i32 = x + width;
	const out_offset: usize = data_offset + gl_height * gl_width * 4;
	const empty_row_offset: usize = out_offset + height * DESIRED_WIDTH;
	// Fill a row in memory with empty pixels for fast copying
	// Webassembly is little endian, so 0xff000000 is saved as 0x00 0x00 0x00 0xff in memory
	store<u32>(0, 0xff000000, reserved_offset);
	memory.repeat(empty_row_offset, reserved_offset, 4, width);
	for (let i: i32 = 0; i < height; i++) {
		let xx: i32 = x;
		let yy: i32 = y + i;
		let cur_row_offset: usize = out_offset + i * DESIRED_WIDTH;
		if (yy < 0 || yy >= gl_height) {
			memory.copy(cur_row_offset, empty_row_offset, DESIRED_WIDTH);
		}
		else {
			if (xx < 0 && xx < XXMAX) {
				let len: u32 = min<i32>(-xx, width) * 4;
				memory.copy(cur_row_offset, empty_row_offset, len);
				cur_row_offset += len;
				xx = min<i32>(0, XXMAX);
			}
			if (xx < XXMAX && xx < gl_width) {
				let len: u32 = (min<i32>(XXMAX, gl_width) - xx) * 4;
				memory.copy(cur_row_offset, out_offset - (yy + 1) * gl_width * 4 + xx * 4, len);
				cur_row_offset += len;
				xx += len / 4;
			}
			if (xx < XXMAX) {
				memory.copy(cur_row_offset, empty_row_offset, (XXMAX - xx) * 4);
			}
		}
	}
}
