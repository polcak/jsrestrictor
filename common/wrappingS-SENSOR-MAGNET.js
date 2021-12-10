/** \file
 * \brief Wrappers for the Magnetometer Sensor
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
  * MOTIVATION
  *
  * Magnetometer is a platform sensor available under the Generic Sensor API.
  * Magnetometer measures strength and direction of the magnetic field at device's
  * location. The interface offers sensor readings using three properties: x, y, and z.
  * Each returns a number that describes the magnetic field aroud the particular axis.
  * The numbers have a double precision and can be positive or negative, depending
  * on the orientation of the field. The total strength of the magnetic field (M)
  * can be calculated as M = sqrt(x^2 + z^2 + y^2). The unit is in microtesla (µT).
  *
  * The Earth's magnetic field ranges between approximately 25 and 65 µT. Concrete
  * values depend on location, altitude, weather, interference made by other electric.
  * devices, etc. While we consider it is unlikely that someone determines the precise
  * location of the device from the  Mangetometer values, its data can be used for
  * fingerprinting. For instance, it can be determined wheter the device is moving or not.
  * In case of a stationary device, we can make a fingerprint from the device's orientation.
  * Another fingerprintable value is the average total strength of the field, which
  * should remain stable if the device is at the same position and in the same environment.
  *
  *
  * WRAPPING
  *
  * To protect the device, we are wrapping the x, y, z getters of the
  * `Magnetometer.prototype` object. Instead of using the original data, we use
  * artificially generated values that look like actual sensor readings.
  *
  * At every moment, our wrapper stores information about the previous reading. Each
  * rewrapped getter first checks the `timestamp` value of the sensor object. If there
  * is no difference from the previous reading's timestamp, the wrapper returns the
  * last measured value. Otherwise, it provides a new fake reading.
  *
  * We designed our fake field generator to fulfill the following properties:
  *
  * - The randomness of the generator should be high enough to prevent attackers from
  *   deducing the sensor values.
  * - Multiple scripts from the same website that access readings with the same
  *   timestamp must get the same results. And thus:
  * - The readings are deterministic - e.g., for a given website and time, we must
  *   be able to say what values to return.
  *
  * For every "random" toss-up, we use the Mulberry32 PRNG that is seeded with a value
  * generated from the `domainHash` which ensures deterministic behavior for the given
  * website. First, we choose the desired total strength `M` of the magnetic field at
  * our simulated location. This is a pseudo-random number from 25 to 60 uT, like on
  * the Earth. In the current implementation, we simulate a stationary device with
  * a pseudo-randomly drawn orientation. Therefore, we choose the orientation of the
  * device by generating a number from -1 to 1 for each axis. Those values we call
  * `baseX`, `baseY`, and `baseZ`. By modifying the above-shown formula, we calculate
  * the `multiplier` that needs to be applied to the base values to get the desired field.
  * The calculation is done as follows:
  * - mult = (M * sqrt(baseX^2 + baseY^2 + baseZ^2) / (baseX^2 + baseY^2 + baseZ^2))
  * Now, we know that for axis `x`, the value should fluctuate around `baseX * mult`, etc.
  *
  * How much the field changes over time is specified by the fluctuation factor (0;1]
  * that can also be configured. For instance, 0.2 means that the magnetic field on
  * the axis may change from the base value by 20% in both positive and negative way.
  *
  * The fluctuation is simulated by using a series of **sine** functions for each axis.
  * Each sine has a unique amplitude, phase shift, and period. The number of sines per
  * axis is chosen pseudorandomly based on the wrapper settings. For initial experiments,
  * we used around 20 to 30 sines for each axis. The optimal configuration is in question.
  * More sines give less predictable results, but also increase the computing complexity
  * that could have a negative impact on the browser's performance.
  *
  * For the given timestamp `t`, we make the sum of all sine values at the point `x=t`.
  * The result is then shifted over the y-axis by adding `base[X|Y|Z] * multiplier` to
  * the sum. The initial configuration of the fake field generator was chosen intuitively
  * to resemble the results of the real measurements. Currently, the generator uses at
  * least one sine with the period around 100 us (with 10% tolerance), which seems to be
  * the minimum sampling rate obtainable using the API on mobile devices. Then, at least
  * one sine around 1 s, around 10 s, 1 minute, and 1 hour. When more than 5 sines are
  * used, the cycle repeats using `modulo 5` and creates a new sine with the period around
  * 100 us, but this time the tolerance is 20%. The same follows for seconds, tens of
  * seconds, minutes, hours. The tolerance grows every 5 sines. For 11+ sines, the tolerance
  * is 30% up to the maximum (currently 50%). The amplitude of each sine is chosen pseudo-
  * randomly based on the **fluctuation factor** described above. The phase shift of each
  * sine is also pseudo-random number from [0;2PI).
  *
  * Based on the results, this heuristic returns belivable values that look like actual
  * sensor readings. Nevertheless, the generator uses a series of constants, whose optimal
  * values should be a subject of future research and improvements. Perphaps, a correlation
  * analysis with real mesurements could help in the future.
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

    // max difference from base period
    const TOLERANCE_MAX = 0.5;

    // What is the typical amplitude for these sines?
    var sineAmplitude = center / cnt;

    var fluctMinMax = flucMin - fluctMax;
    let sines = [];
    let iteration = 0;
    let tolerance = 0.1;

    for (let i = 0; i < cnt; i++) {
      let s = new SineCfg();
      let fluctuationFactor = prng() * (fluctMinMax) + fluctMax;

      s.center = center;
      s.amplitude = sineAmplitude * fluctuationFactor;
      s.shift = prng() * TWOPI;

      let series = i % 5;

      switch(series) {

        case 0:
          iteration += 1;

          // increase tolerance for new iterations
          if (iteration > 1 && tolerance < TOLERANCE_MAX) {
            tolerance += 0.1;
          }

          // Minimal sampling rate (default: 100 miliseconds)
          s.period = generateAround(periodMin, tolerance);
        break;
        case 1: // Seconds
          s.period = generateAround(1000, tolerance);
        break;
        case 2: // Tens of seconds
          s.period = generateAround(10000, tolerance);
        break;
        case 3: // Minutes
          s.period = generateAround(60000, tolerance);
        break;
        case 4: // Hours
          s.period = generateAround(3600000, tolerance);
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
    const FLUCTUATION_MIN = 0.20;
    const FLUCTUATION_MAX = 0.45;
    const AXES_OSCILLATE_DIFFERENTLY = true;

    const NUMBER_OF_SINES_MIN = 25;
    const NUMBER_OF_SINES_MAX = 30;

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
    let previousTimestamp = previousReading.timestamp;
    let currentTimestamp = origGetTimestamp.call(sensorObject);

    if (debugMode) {
      // [!] Debug mode: overriding timestamp
      // This allows test suites to set a custom timestamp externally
      // by modifying the property of the Magnetometer object directly.
      currentTimestamp = sensorObject.timestamp;
    }

    if (currentTimestamp === previousTimestamp) {
      // No new reading, nothing to update
      return;
    }

    // Rotate the readings: previous <- current
    previousReading = JSON.parse(JSON.stringify(currentReading));

    // Update current reading
    // NOTE: Original values are also stored for possible future use
    //       in improvements of the magnetic field generator
    currentReading.orig_x = origGetX.call(sensorObject);
    currentReading.orig_y = origGetY.call(sensorObject);
    currentReading.orig_z = origGetZ.call(sensorObject);
    currentReading.timestamp = currentTimestamp;

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
