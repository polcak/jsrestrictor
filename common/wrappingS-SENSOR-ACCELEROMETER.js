/** \file
 * \brief Wrappers for the Accelerometer Sensor
 *
 * \see https://www.w3.org/TR/accelerometer/
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
  */

  /*
   * Create private namespace
   */
(function() {

  var init_data = `
    var currentReading = currentReading || {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null};
    var previousReading = previousReading || {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null};
    var emulateStationaryDevice = (typeof args === 'undefined') ? true : args[0];
    var debugMode = false;

    const TWOPI = 2 * Math.PI;
    `;

  var orig_getters = `
    var origGetX = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "x").get;
    var origGetY = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "y").get;
    var origGetZ = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "z").get;
    var origGetTimestamp = Object.getOwnPropertyDescriptor(Sensor.prototype, "timestamp").get;
    `;

  // Generates a 32-bit from a string. Inspired by MurmurHash3 algorithm
  // See: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
  function generateSeed(s) {
    var h;
    for(var i = 0, h = 1779033703 ^ s.length; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
    return h;
  }

  // PRNG based on Mulberry32 algorithm
  // See: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
  function prng() {
    // expects "seed" variable to be a 32-bit value
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  function generateAround(number, tolerance) {
    // Generates a number around the input number

    let min = number - tolerance * tolerance;
    let max = number + number * tolerance;

    return prng() * (max - min) + min;
  }


  function shake(axis) {
    val = prng() * (axis.max - axis.min) + axis.max;
    if (axis.canBeNegative) {
      val *= Math.round(prng()) ? 1 : -1;
    }
    axis.value = val.toFixed(axis.decimalPlaces);
  }

  function initDataGenerator() {


    dataGen = {
      x: {
        min: 0.0,
        max: 0.1,
        decimalPlaces: 1,
        canBeNegative: true,
        value: null,
      },
      y: {
        min: 0.0,
        max: 0.1,
        decimalPlaces: 1,
        canBeNegative: true,
        value: null,
      },
      z: {
        min: 9.8,
        max: 9.9,
        decimalPlaces: 1,
        canBeNegative: false,
        value: null,
      },

      // Update x/y/z values based on timestamp
      update: function(t) {
        // Simulate the accelerometer changes

        shake(this.x);
        shake(this.y);
        shake(this.z);

      }
    }


    return dataGen;
  }


  function updateReadings(sensorObject) {
    // We need the original reading's timestamp to see if it differs
    // from the previous sample. If so, we need to update the faked x,y,z
    let currentTimestamp = origGetTimestamp.call(sensorObject);

    if (debugMode) {
      // [!] Debug mode: overriding timestamp
      // This allows test suites to set a custom timestamp externally
      // by modifying the property of the sensor object directly.
      currentTimestamp = sensorObject.timestamp;
    }

    if (currentTimestamp === previousReading.timestamp) {
      // No new reading, nothing to update
      return;
    }

    // Update current reading
    // NOTE: Original values are also stored for possible future use
    //       in improvements of the magnetic field generator
    currentReading.orig_x = origGetX.call(sensorObject);
    currentReading.orig_y = origGetY.call(sensorObject);
    currentReading.orig_z = origGetZ.call(sensorObject);
    currentReading.timestamp = currentTimestamp;

    // Rotate the readings: previous <- current
    previousReading = JSON.parse(JSON.stringify(currentReading));

    dataGenerator.update(currentTimestamp);
    currentReading.fake_x = dataGenerator.x.value;
    currentReading.fake_y = dataGenerator.y.value;
    currentReading.fake_z = dataGenerator.z.value;

    if (debugMode) {
      console.log(fieldGenerator);
    }
  }

  var generators = `
    // Get seed for PRNG: prefer existing seed, then domain hash, session hash
    var seed = seed ||
      ((typeof domainHash === 'undefined') ?
      generateSeed(Hashes.sessionHash) :
      generateSeed(domainHash));

    // Initialize the field generator, if not initialized before
    var dataGenerator = dataGenerator || initDataGenerator();
    `;

  var helping_functions = generateSeed + prng + generateAround
          + initDataGenerator + shake + updateReadings;
  var hc = init_data + orig_getters + helping_functions + generators;

  var wrappers = [
    {
      parent_object: "Accelerometer.prototype",
      parent_object_property: "x",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Accelerometer.prototype",
          parent_object_property: "x",
          wrapped_objects: [],
          /**  \brief replaces Sensor.prototype.x getter to return a faked value
           */
          wrapped_properties: [
            {
              property_name: "get",
              property_value: `
              function() {
               updateReadings(this);
               return currentReading.fake_x;
             }`,
            },
          ],
        }
      ],
    },
    {
      parent_object: "Accelerometer.prototype",
      parent_object_property: "y",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Accelerometer.prototype",
          parent_object_property: "y",
          wrapped_objects: [],
          /**  \brief replaces Sensor.prototype.y getter to return a faked value
           */
          wrapped_properties: [
            {
              property_name: "get",
              property_value: `
              function() {
               updateReadings(this);
               return currentReading.fake_y;
             }`,
            },
          ],
        }
      ],
    },
    {
      parent_object: "Accelerometer.prototype",
      parent_object_property: "z",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Accelerometer.prototype",
          parent_object_property: "z",
          wrapped_objects: [],
          /**  \brief replaces Sensor.prototype.z getter to return a faked value
           */
          wrapped_properties: [
            {
              property_name: "get",
              property_value: `
              function() {
               updateReadings(this);
               return currentReading.fake_z;
             }`,
            },
          ],
        }
      ],
    },
  ]
    add_wrappers(wrappers);
})()
