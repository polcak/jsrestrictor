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

  function initFieldGenerator() {
    // Specifies, how much the values may (pseudorandomly) oscillate,
    // i.e., how much the may relatively differ from the chosen center value
    // in both positiva and negative way
    const FLUCTUATION_MIN = 0.05;
    const FLUCTUATION_MAX = 0.10;
    const AXES_OSCILLATE_DIFFERENTLY = true;

    // Shifts the phase of each axis randomly [0, 2*PI)
    const RANDOM_PHASE_SHIFT = true;

    // TODO: seed from session hash
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
        amplitude: 1,
        shift: 0,
        value: null
      },
      y: {
        base: baseY,
        center: baseY * mult,
        amplitude: 1,
        shift: 0,
        value: null
      },
      z: {
        base: baseZ,
        center: baseZ * mult,
        amplitude: 1,
        shift: 0,
        value: null
      },
      // Update x/y/z values based on timestamp
      update: function(t) {
        // Simulate the magnetic field fluctuation based on settings
        this.x.value = Math.sin(t + this.x.shift) * this.x.amplitude + this.x.center;
        this.y.value = Math.sin(t + this.y.shift) * this.y.amplitude + this.y.center;
        this.z.value = Math.sin(t + this.z.shift) * this.z.amplitude + this.z.center;
      }
    }

    // Define amplitude based on axes oscillation
    var minmaxFluct = FLUCTUATION_MIN - FLUCTUATION_MAX;
    if (AXES_OSCILLATE_DIFFERENTLY) {
      let fluctiationFactor = prng() * (minmaxFluct) + FLUCTUATION_MAX;
      fieldGen.x.amplitude = fieldGen.x.center * fluctiationFactor;
      fluctiationFactor = prng() * (minmaxFluct) + FLUCTUATION_MAX;
      fieldGen.y.amplitude = fieldGen.y.center * fluctiationFactor;
      fluctiationFactor = prng() * (minmaxFluct) + FLUCTUATION_MAX;
      fieldGen.z.amplitude = fieldGen.z.center * fluctiationFactor;
    } else {
      let fluctiationFactor = prng() * (minmaxFluct) + FLUCTUATION_MAX;
      fieldGen.x.amplitude = fieldGen.x.center * fluctiationFactor;
      fieldGen.y.amplitude = fieldGen.y.center * fluctiationFactor;
      fieldGen.z.amplitude = fieldGen.z.center * fluctiationFactor;
    }

    // Define phase shift
    if (RANDOM_PHASE_SHIFT) {
      let twopi = 2 * Math.PI;
      fieldGen.x.shift = prng() * (- twopi) + twopi;
      fieldGen.y.shift = prng() * (- twopi) + twopi;
      fieldGen.z.shift = prng() * (- twopi) + twopi;
    }

    return fieldGen;
  }

  function generateBaseField() {
    // Generate a random base field
    const FIELD_MIN = 30;
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
  }

  var generators = `
    var seed = seed || generateSeed(Hashes.sessionHash);
    var fieldGenerator = fieldGenerator || initFieldGenerator();
    `;

  var helping_functions = generateSeed + prng + initFieldGenerator
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
               //return 10;
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
               //return 30;
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
               //return 50;
             }`,
						},
					],
				}
			],
		},
	]
  	add_wrappers(wrappers);
})()
