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

    return sen_prng() * (max - min) + min;
  }

  // Rounds a number to a fixed amount of decimal places
  // Returns a NUMBER
  function fixedNumber(num, digits, base) {
    var pow = Math.pow(base||10, digits);
    return Math.round(num*pow) / pow;
  }
`;

var device_orientation_functions = `
  // Initial draw of the device orientation
  // TODO: Limit to oriententations that make sense for a mobile device
  function generateDeviceOrientation() {
    var orient = {};
    /*
     * Yaw (couterclockwise rotation of the Z-axis)
     * Pitch (counterclockwise rotation of the Y-axis)
     * Roll (counterclockwise rotation of the X-axis)
     */
    var yaw = Math.floor(sen_prng() * 2 * Math.PI);
    var pitch = Math.floor(sen_prng() * 2 * Math.PI);
    var roll = Math.floor(sen_prng() * 2 * Math.PI);

    orient.yaw = yaw;
    orient.pitch = pitch;
    orient.roll = roll;

    // Calculate the rotation matrix
    orient.rotMat = [
      [Math.cos(yaw) * Math.cos(pitch),
       Math.cos(yaw) * Math.sin(pitch) * Math.sin(roll) - Math.sin(yaw) * Math.cos(roll),
       Math.cos(yaw) * Math.sin(pitch) * Math.cos(roll) + Math.sin(yaw) * Math.sin(roll)
      ],
      [Math.sin(yaw) * Math.cos(pitch),
       Math.sin(yaw) * Math.sin(pitch) * Math.sin(roll) + Math.cos(yaw) * Math.cos(roll),
       Math.sin(yaw) * Math.sin(pitch) * Math.cos(roll) - Math.cos(yaw) * Math.sin(roll)
      ],
      [(-1) * Math.sin(pitch),
       Math.cos(pitch) * Math.sin(roll),
       Math.cos(pitch) * Math.cos(roll)
     ]
    ];

    return orient;
  }

  var orient = orient || generateDeviceOrientation();

  // Multiplies a 3D strength vector (1x3) with a 3D rotation matrix (3x3)
  // Returns the resulting 3D vector (1x3)
  function multVectRot(vec, mat) {
    var result = [
      vec[0]*mat[0][0] + vec[1]*mat[0][1] + vec[2]*mat[0][2],
      vec[0]*mat[1][0] + vec[1]*mat[1][1] + vec[2]*mat[1][2],
      vec[0]*mat[2][0] + vec[1]*mat[2][1] + vec[2]*mat[2][2]
    ]
    return result;
  }
`;
