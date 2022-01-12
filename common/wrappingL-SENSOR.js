/** \file
 * \brief Library of functions for the Generic Sensor API wrappers
 *
 * \see https://www.w3.org/TR/magnetometer/
 *
 *  \author Copyright (C) 2021  Radek Hranicky
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
  * Supporting fuctions for Generic Sensor API Wrappers
  */
var sensorapi_prng_functions = `
  // Generates a 32-bit from a string. Inspired by MurmurHash3 algorithm
  // See: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
  function sen_generateSeed(s) {
    var h;
    for(var i = 0, h = 1779033703 ^ s.length; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
    return h;
  }

  // Get seed for PRNG: prefer existing seed, then domain hash, session hash
  var sen_seed = sen_seed ||
    ((typeof domainHash === 'undefined') ?
    sen_generateSeed(Hashes.sessionHash) :
    sen_generateSeed(domainHash));


  // PRNG based on Mulberry32 algorithm
  // See: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
  function sen_prng() {
    // expects "seed" variable to be a 32-bit value
    var t = sen_seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  function sen_generateAround(number, tolerance) {
    // Generates a number around the input number

    let min = number - tolerance * tolerance;
    let max = number + number * tolerance;

    return prng() * (max - min) + min;
  }
`;
