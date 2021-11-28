/** \file
 * \brief Wrappers for Magnetometer Sensor
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
  * TODO: document
  * TODO: add movement simulation of non-stationary devices
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
    var origGetX = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "x").get;
    var origGetY = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "y").get;
    var origGetZ = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "z").get;
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

  function SineCfg() {
    this.center = 0;
    this.amplitude = 1;
    this.shift = 0;
    this.period = 1;
  }

  function configureSines(cntMin, cntMax, center, flucMin, fluctMax, periodMin, periodMax) {
    // This is helping function for the field generator
    // Configures an array of sines for the given settings

    // How many sines we have?
    var cnt = Math.floor(prng() * (cntMax - cntMin + 1) + cntMin);

    // What is the typical amplitude for these sines?
    var sineAmplitude = center / cnt;

    var fluctMinMax = flucMin - fluctMax;

    let sines = [];
    for (let i = 0; i < cnt; i++) {
      let s = new SineCfg();
      let fluctuationFactor = prng() * (fluctMinMax) + fluctMax;

      s.center = center;
      s.amplitude = sineAmplitude * fluctuationFactor;
      s.shift = prng() * (- TWOPI) + TWOPI;

      let series = i % 5;
      switch(series) {
        case 0: // Minimal sampling rate (default: 100 miliseconds)
          s.period = generateAround(periodMin, 0.1);
        break;
        case 1: // Seconds
          s.period = generateAround(1000, 0.1);
        break;
        case 2: // Tens of seconds
          s.period = generateAround(10000, 0.1);
        break;
        case 3: // Minutes
          s.period = generateAround(60000, 0.1);
        break;
        case 4: // Hours
          s.period = generateAround(3600000, 0.1);
        break;
      }
      sines.push(s);
    }
    return sines;
  }

  function initFieldGenerator() {
    // Specifies, how much the values may (pseudorandomly) oscillate,
    // i.e., how much the may relatively differ from the chosen center value
    // in both positiva and negative way
    const FLUCTUATION_MIN = 0.05;
    const FLUCTUATION_MAX = 0.10;
    const AXES_OSCILLATE_DIFFERENTLY = true;

    const NUMBER_OF_SINES_MIN = 5;
    const NUMBER_OF_SINES_MAX = 20;

    // Shifts the phase of each axis randomly [0, 2*PI)
    const RANDOM_PHASE_SHIFT = true;

    // Minimum sampling rate of the device(s)
    // Motivation: It does not have sense to waste computing resources
    // by oscillating in periods smaller than this value
    const MIN_SAMPLING_RATE = 100; // [ms]

    // Period
    const PERIOD_MIN = MIN_SAMPLING_RATE;
    const PERIOD_MAX = 60000 // 1 minute


    let m = generateBaseField();
    baseX = generateAxisBase();
    baseY = generateAxisBase();
    baseZ = generateAxisBase();

    baseX2 = Math.pow(baseX,2)
    baseY2 = Math.pow(baseY,2)
    baseZ2 = Math.pow(baseZ,2)

    // The total magnetic field strength is calculated as:
    //   m = sqrt(x^2, y^2, z^2)
    // where x,y,z are strengs in individual directions (axes).
    //
    // For x,y,z, the algorithm generates a sine-based fluctuation around
    // a center value for each axis. For axis x, it is calculated as:
    //   x = baseX * multiplier
    //
    // At this moment, we have calculate the basis (-1,1) for each axis.
    // Now, we calculate the multiplier:
    //
    //                   m + sqrt(baseX^2 + baseY^2 + baseZ^2)
    // multiplier = +/- -------------------------------------
    //                       baseX^2 + baseY^2 + baseZ^2
    //
    // Values at axis X will oscillate around: baseX * multiplier, etc.

    mult = (m * Math.sqrt(baseX2 + baseY2 + baseZ2))
                       / (baseX2 + baseY2 + baseZ2);

    fieldGen = {
      baseField: m,
      multiplier: mult,
      x: {
        base: baseX,
        center: baseX * mult,
        sines: [],
        value: null
      },
      y: {
        base: baseY,
        center: baseY * mult,
        sines: [],
        value: null
      },
      z: {
        base: baseZ,
        center: baseZ * mult,
        sines: [],
        value: null
      },
      // Update x/y/z values based on timestamp
      update: function(t) {
        // Simulate the magnetic field fluctuation based on settings
        // Center is added only once - we want to y-shift the result, not individial sines
        this.x.value = this.x.center + this.x.sines.reduce(function (val, s) {
          return val + (Math.sin(t * (TWOPI/s.period) + s.shift) * s.amplitude);
        }, 0);
        this.y.value = this.y.center + this.y.sines.reduce(function (val, s) {
          return val + (Math.sin(t * (TWOPI/s.period) + s.shift) * s.amplitude);
        }, 0);
        this.z.value = this.z.center + this.z.sines.reduce(function (val, s) {
          return val + (Math.sin(t * (TWOPI/s.period) + s.shift) * s.amplitude);
        }, 0);
      }
    }

    fieldGen.x.sines = configureSines(NUMBER_OF_SINES_MIN, NUMBER_OF_SINES_MAX, fieldGen.x.center,
                                  FLUCTUATION_MIN, FLUCTUATION_MAX, PERIOD_MIN, PERIOD_MAX);
    fieldGen.y.sines = configureSines(NUMBER_OF_SINES_MIN, NUMBER_OF_SINES_MAX, fieldGen.y.center,
                                  FLUCTUATION_MIN, FLUCTUATION_MAX, PERIOD_MIN, PERIOD_MAX);
    fieldGen.z.sines = configureSines(NUMBER_OF_SINES_MIN, NUMBER_OF_SINES_MAX, fieldGen.z.center,
                                  FLUCTUATION_MIN, FLUCTUATION_MAX, PERIOD_MIN, PERIOD_MAX);

    return fieldGen;
  }

  function generateBaseField() {
    // Generate a random base field
    const FIELD_MIN = 25;
    const FIELD_MAX = 60;
    return prng() * (FIELD_MIN - FIELD_MAX) + FIELD_MAX;
  }

  function generateAxisBase() {
    // Returns a number in (-1,1)
    var v = prng(); // Random in [0,1)
    v *= Math.round(prng()) ? 1 : -1; // 50% change for positive / negative
    return v;
  }

  function updateReadings(sensorObject) {
    // We need the original reading's timestamp to see if it differs
    // from the previous sample. If so, we need to update the faked x,y,z
    let currentTimestamp = origGetTimestamp.call(sensorObject);

    if (debugMode) {
      // [!] Debug mode: overriding timestamp
      // This allows test suites to set a custom timestamp externally
      // by modifying the property of the Magnetometer object directly.
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

    fieldGenerator.update(currentTimestamp);
    currentReading.fake_x = fieldGenerator.x.value;
    currentReading.fake_y = fieldGenerator.y.value;
    currentReading.fake_z = fieldGenerator.z.value;

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
    var fieldGenerator = fieldGenerator || initFieldGenerator();
    `;

  var helping_functions = generateSeed + prng + generateAround
          + SineCfg + configureSines + initFieldGenerator
          + generateBaseField + generateAxisBase + updateReadings;
  var hc = init_data + orig_getters + helping_functions + generators;

  var wrappers = [
    {
      parent_object: "Magnetometer.prototype",
      parent_object_property: "x",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Magnetometer.prototype",
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
      parent_object: "Magnetometer.prototype",
      parent_object_property: "y",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Magnetometer.prototype",
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
      parent_object: "Magnetometer.prototype",
      parent_object_property: "z",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Magnetometer.prototype",
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
