/** \file
 * \brief Wrappers for the Gyroscope Sensor
 *
 * \see https://www.w3.org/TR/Gyroscope/
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
  * MOTIVATION
  * Gyroscope readings can be used for speech recognition: https://crypto.stanford.edu/gyrophone/
  * and various fingerprinting operations. For stationary devices, the resonance of the unique internal or
  * external sounds affects angular velocities affect the Gyroscope and allow to create a fingerprint:
  * https://www.researchgate.net/publication/356678825_Mobile_Device_Fingerprint_Identification_Using_Gyroscope_Resonance
  * For moving devices, one of the options is using the Gyroscope analyze human walking patterns:
  * https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7071017/
  *
  *
  * WRAPPING
  * The Gyroscope sensor provides readings of the angular velocity of the device alongthe x/y/z axes.
  * For a stationary device, all velocities should be zero in an ideal state. As we observed on the
  * examined devices, device sensor imperfections andlittle vibrations cause the `x`, `y` and `z` to
  * oscillate between -0.002 and 0.002 on the examined devices. The wrapper simulates the same behavior.
  *
  *
  * POSSIBLE IMPROVEMENTS
  * Support for simulation of a non-stationary device. This would require
  * modifications to other movement-related sensors (Accelerometer, etc.)
  *
  */

  /*
   * Create private namespace
   */
(function() {
  /*
    * \brief Initialization of data for storing sensor readings
  */
  var init_data = `
    var currentReading = currentReading || {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null};
    var previousReading = previousReading || {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null};
    var emulateStationaryDevice = (typeof args === 'undefined') ? true : args[0];
    var debugMode = false;

    const TWOPI = 2 * Math.PI;
    `;

  /*
    * \brief Property getters of the original sensor object
  */
  var orig_getters = `
    var origGetX = Object.getOwnPropertyDescriptor(Gyroscope.prototype, "x").get;
    var origGetY = Object.getOwnPropertyDescriptor(Gyroscope.prototype, "y").get;
    var origGetZ = Object.getOwnPropertyDescriptor(Gyroscope.prototype, "z").get;
    var origGetTimestamp = Object.getOwnPropertyDescriptor(Sensor.prototype, "timestamp").get;
    `;

  /*
    * \brief Changes the value on the given axis to a new one from the given interval
    *
    * \param the axis object (min, max, value, and decimalPlaces properties required)
  */
  function shake(axis) {
    val = sen_prng() * (axis.max - axis.min) + axis.min;

    var precision = Math.pow(10, -1 * axis.decimalPlaces);
    if (val < precision) {
      val = 0;
    }

    if (axis.canBeNegative) {
      val *= Math.round(sen_prng()) ? 1 : -1;
    }

    if (val == 0) {
      axis.value = 0;
    } else {
      axis.value = fixedNumber(val, axis.decimalPlaces);
    }
  }

  /*
    * \brief The data generator for creating fake Gyroscope values
  */
  class DataGenerator {
    constructor() {
      this.NEXT_CHANGE_MS_MIN = 500;
      this.NEXT_CHANGE_MS_MAX = 2000;
      this.x = {
        name: "x",
        min: 0.0,
        max: 0.0021,
        decimalPlaces: 3,
        canBeNegative: true,
        value: null
      };
      this.y = {
        name: "y",
        min: 0.0,
        max: 0.0021,
        decimalPlaces: 3,
        canBeNegative: true,
        value: null
      };
      this.z = {
        name: "z",
        min: 0.0,
        max: 0.0021,
        decimalPlaces: 3,
        canBeNegative: true,
        value: null
      };
      this.nextChangeTimeX = null; // miliseconds
      this.nextChangeTimeY = null;
      this.nextChangeTimeZ = null;
    }

    /*
      * \brief Updates the  x/y/z axes values based on the current timestamp
      *
      * \param Current timestamp from the sensor object
    */
    update(currentTimestamp) {
    // Simulate the Gyroscope changes
      if (this.shouldWeUpdateX(currentTimestamp)) {
        shake(this.x);
        this.setNextChangeX(currentTimestamp);
      };
      if (this.shouldWeUpdateY(currentTimestamp)) {
        shake(this.y);
        this.setNextChangeY(currentTimestamp);
      };
      if (this.shouldWeUpdateZ(currentTimestamp)) {
        shake(this.z);
        this.setNextChangeZ(currentTimestamp);
      };
    }

    /*
      * \brief Boolean function that decides if the value on the axis X
      *        should be updated. Returns true if update is needed.
      *
      * \param Current timestamp from the sensor object
    */
    shouldWeUpdateX(currentTimestamp) {
      if (currentTimestamp === null || this.nextChangeTimeX === null) {
        return true;
      }
      if (currentTimestamp >= this.nextChangeTimeX) {
        return true;
      } else {
        return false;
      }
    }

    /*
      * \brief Boolean function that decides if the value on the axis Y
      *        should be updated. Returns true if update is needed.
      *
      * \param Current timestamp from the sensor object
    */
    shouldWeUpdateY(currentTimestamp) {
      if (currentTimestamp === null || this.nextChangeTimeY === null) {
        return true;
      }
      if (currentTimestamp >= this.nextChangeTimeY) {
        return true;
      } else {
        return false;
      }
    }

    /*
      * \brief Boolean function that decides if the value on the axis Z
      *        should be updated. Returns true if update is needed.
      *
      * \param Current timestamp from the sensor object
    */
    shouldWeUpdateZ(currentTimestamp) {
      if (currentTimestamp === null || this.nextChangeTimeZ === null) {
        return true;
      }
      if (currentTimestamp >= this.nextChangeTimeZ) {
        return true;
      } else {
        return false;
      }
    }

    /*
      * \brief Sets the timestamp of the next update of value on the axis X.
      *
      * \param Current timestamp from the sensor object
    */
    setNextChangeX(currentTimestamp) {
      let interval_ms = Math.floor(
        sen_prng() * (this.NEXT_CHANGE_MS_MAX - this.NEXT_CHANGE_MS_MIN + 1)
        + this.NEXT_CHANGE_MS_MIN
      );
      this.nextChangeTimeX = currentTimestamp + interval_ms;
    }

    /*
      * \brief Sets the timestamp of the next update of value on the axis Y.
      *
      * \param Current timestamp from the sensor object
    */
    setNextChangeY(currentTimestamp) {
      let interval_ms = Math.floor(
        sen_prng() * (this.NEXT_CHANGE_MS_MAX - this.NEXT_CHANGE_MS_MIN + 1)
        + this.NEXT_CHANGE_MS_MIN
      );
      this.nextChangeTimeY = currentTimestamp + interval_ms;
    }

    /*
      * \brief Sets the timestamp of the next update of value on the axis Z.
      *
      * \param Current timestamp from the sensor object
    */
    setNextChangeZ(currentTimestamp) {
      let interval_ms = Math.floor(
        sen_prng() * (this.NEXT_CHANGE_MS_MAX - this.NEXT_CHANGE_MS_MIN + 1)
        + this.NEXT_CHANGE_MS_MIN
      );
      this.nextChangeTimeZ = currentTimestamp + interval_ms;
    }
  };

  /*
    * \brief Updates the stored (both real and fake) sensor readings
    *        according to the data from the sensor object.
    *
    * \param The sensor object
  */
  function updateReadings(sensorObject) {

    // We need the original reading's timestamp to see if it differs
    // from the previous sample. If so, we need to update the faked x,y,z
    let previousTimestamp = previousReading.timestamp;
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

    // Rotate the readings: previous <- current
    previousReading = JSON.parse(JSON.stringify(currentReading));

    // Update current reading
    // NOTE: Original values are also stored for possible future use
    currentReading.orig_x = origGetX.call(sensorObject);
    currentReading.orig_y = origGetY.call(sensorObject);
    currentReading.orig_z = origGetZ.call(sensorObject);
    currentReading.timestamp = currentTimestamp;

    dataGenerator.update(currentTimestamp);

    currentReading.fake_x = dataGenerator.x.value;
    currentReading.fake_y = dataGenerator.y.value;
    currentReading.fake_z = dataGenerator.z.value;

    if (debugMode) {
      console.debug(dataGenerator);
    }
  }

  /*
    * \brief Initializes the related generators
  */
  var generators = `
    // Initialize the data generator, if not initialized before
    var dataGenerator = dataGenerator || new DataGenerator();
    `;

  var helping_functions = sensorapi_prng_functions
      + DataGenerator + shake + updateReadings;
  var hc = init_data + orig_getters + helping_functions + generators;

  var wrappers = [
    {
      parent_object: "Gyroscope.prototype",
      parent_object_property: "x",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Gyroscope.prototype",
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
      parent_object: "Gyroscope.prototype",
      parent_object_property: "y",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Gyroscope.prototype",
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
      parent_object: "Gyroscope.prototype",
      parent_object_property: "z",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "Gyroscope.prototype",
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
