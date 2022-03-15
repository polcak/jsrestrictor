/** \file
 * \brief Library of functions for the Generic Sensor API wrappers
 *
 * \see https://www.w3.org/TR/generic-sensor/
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

/*
 * Functions for generating pseudorandom numbers.
 * To make the behavior deterministic and same on the same domain,
 * the generator uses domain hash as a seed.
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
    sen_generateSeed(domainHash);


  // PRNG based on Mulberry32 algorithm
  // See: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
	// To the extent possible under law, the author has dedicated all copyright
	// and related and neighboring rights to this software to the public domain
	// worldwide.
  function sen_prng() {
    // expects "seed" variable to be a 32-bit value
    var t = sen_seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Generates a number around the input number
  function sen_generateAround(number, tolerance) {
    let min = number - number * tolerance;
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

/*
 * Functions for simulation of the device orientation.
 * Those allow to create a fake orientation of the device in axis angles
 * and create a rotation matrix. Support for multiplication of a 3D vector
 * with the rotation matrix is included.
 *
 * Note: The code needs supporting function from the
 * "sensorapi_prng_functions" above.
 *
 * In case of a non-rotated phone with a display oriented directly to the
 * face of the user, the device's axes are oriented as follows:
 *   x-axis is oriented from the user's left to the right
 *   y-axis from the bottom side of the display towards the top side
 *   z-axis is perpendicular to the display, it leads from the phone's
 *          display towards the user's face
 *
 * The yaw, pitch, and roll define the rotation of the phone in the Earth's
 * reference coordinate system. In case, all are 0:
 *   x is oriented towards the EAST
 *   y is oriented towards the NORTH (Earth's magnetic)
 *  -z is oriented toward the center of the Earth
 *
 *                   y (roll)
 *                  /  (NORTH if yaw = pitch = 0)
 *                 /
 *          +----------+
 *         /     /    /
 *  (top) / z(yaw)   /
 *       /   |/     /
 *      /    +-----/----> x (pitch)
 *     /          /      (EAST if yaw = roll = 0)
 *    /   _ _    /
 *   /   /__/   /
 *  +----------+
 *  (bottom)
 *
 */
var device_orientation_functions = `
  // Calcultes a rotation matrix for the given yaw, pitch, and roll
  // (in radians) of the device.
  function calculateRotationMatrix(yaw, pitch, roll) {
    var rotMat = [
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
    return rotMat;
  }

  // Initial draw of the (fake) device orientation
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
    orient.rotMat = calculateRotationMatrix(yaw, pitch, roll);

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
