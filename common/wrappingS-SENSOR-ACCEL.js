/** \file
 * \brief Wrappers for the Accelerometer Sensor, LinearAccelerationSensor,
 * and GravitySensor
 *
 * \see https://www.w3.org/TR/accelerometer/
 * \see https://www.w3.org/TR/accelerometer/#linearaccelerationsensor
 * \see https://www.w3.org/TR/accelerometer/#gravitysensor
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
  * Readings from the Accelerometer, LinearAccelerationSensor, and GravitySensor
  * of the Generic Sensor API should be secured as they provide a potentially
  * valuable data for creating fingerprints. There are multiple options.
  * A unique fingerprint can be obtained by describing the device's vibrations
  * (See https://link.springer.com/chapter/10.1007/978-3-319-30806-7_7).
  * Using trajectory inference and matching of the model to map data, one may
  * use the readings from the Accelerometer to determing the device's position
  * (See https://www.researchgate.net/publication/220990763_ACComplice_Location_
  * inference_using_accelerometers_on_smartphones).
  * Accelerometer readings can also be used for determining human walking patterns
  * (See https://www.researchgate.net/publication/322835708_Classifying_Human_
  *  Walking_Patterns_using_Accelerometer_Data_from_Smartphone).
  *
  *
  * WRAPPING
  * The wrapper replaces the "XYZ" getters of the Accelerometer sensor,
  * LinearAccelerationSensor, and GravitySensor. The wrapping's goal is to
  * simulate a stationary device that can be possibly rotated. The rotation
  * of the device is represented by the fake rotation matrix "orient.rotMat".
  *
  * The GravitySensor should provide readings of gravity acceleration applied
  * to the device. This is represented by a vector made of x, y, z portions.
  * To get this faked gravity vector for the device, the reference vector
  * [0, 0, 9.8] is multipled with the rotation matrix. Wrappers for the
  * GravitySensor's getters return x, y, z portions of the fake gravity vector.
  *
  * Next, the LinearAccelerationSensor should return acceleration values without
  * the contribution of gravity. For a stationary device, it should be all zeroes.
  * Yet, there could be vibrations that may change values a little bit, e.g.,
  * spin around -0.1 to +0.1, as seen on the examined devices. This usually does
  * not happed with every reading but only in intervals of seconds. And thus,
  * after a few seconds we pseudo-randomly change these values.
  *
  * Finally, the Accelerometer sensor combines the previous two. Our wrappers thus
  * return tha values from the LinearAccelerationSensor with the fake gravity
  * vector portions added.
  *
  *
  * POSSIBLE IMPROVEMENTS
  * Support for simulation of a non-stationary device where the rotation
  * can change. Currently, the calculation of the gravity vector is done
  * only once by the initDataGenerator() where the reference vector is
  * multiplied with the rotation matrix. If orient.rotMat could change,
  * the dataGen would have to be updated periodically.
  * Moreover, such a change should also be taken into account in wrappers
  * for other movement-related sensors (Gyroscope, etc.).
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
                      fake_x: null, fake_y: null, fake_z: null, gVector: null};
    var previousReading = previousReading || {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null, gVector: null};
    var emulateStationaryDevice = (typeof args === 'undefined') ? true : args[0];
    var debugMode = false;

    const TWOPI = 2 * Math.PI;
    `;

  /*
    * \brief Property getters of the original sensor object
  */
  var orig_getters = `
    var origGetX = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "x").get;
    var origGetY = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "y").get;
    var origGetZ = Object.getOwnPropertyDescriptor(Accelerometer.prototype, "z").get;
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
    * \brief The data generator for creating fake accelerometer values
  */
  class DataGenerator {
    constructor() {
      this.NEXT_CHANGE_MS_MIN = 1000;
      this.NEXT_CHANGE_MS_MAX = 10000;

      /* Reference gravity vector
       * For a non-rotated device lying bottom-down on a flat surface,
       * only axis "z" is afected by g.
       */
      let referenceGravityVector = [0, 0, 9.8];

      /*
       * For a rotated device, the reference gravity vector needs to be
       * multiplied by the rotation matrix.
       * Here we calculate and store the device gravity vector
       */
      this.gVector = multVectRot(referenceGravityVector, orient.rotMat);

      /*
       * Values for the linear acceleration are fluctuating
       */
      this.x = {
        name: "x",
        min: 0.0,
        max: 0.11,
        decimalPlaces: 1,
        canBeNegative: true,
        value: null
      };
      this.y = {
        name: "y",
        min: 0.0,
        max: 0.11,
        decimalPlaces: 1,
        canBeNegative: true,
        value: null
      };
      this.z = {
        name: "z",
        min: 0.0,
        max: 0.11,
        decimalPlaces: 1,
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
  }

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
    currentReading.fake_gVector = dataGenerator.gVector;

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

  var helping_functions = sensorapi_prng_functions + device_orientation_functions
      + DataGenerator + shake + updateReadings;
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
                if (this.__proto__.constructor.name === 'GravitySensor') {
                  return fixedNumber(currentReading.fake_gVector[0], 1);
                } else if (this.__proto__.constructor.name === 'LinearAccelerationSensor') {
                  return fixedNumber(currentReading.fake_x, 1);
                }
                return fixedNumber(currentReading.fake_x + currentReading.fake_gVector[0], 1);
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
                if (this.__proto__.constructor.name === 'GravitySensor') {
                  return fixedNumber(currentReading.fake_gVector[1], 1);
                } else if (this.__proto__.constructor.name === 'LinearAccelerationSensor') {
                  return fixedNumber(currentReading.fake_y, 1);
                }
                return fixedNumber(currentReading.fake_y + currentReading.fake_gVector[1], 1);
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
                if (this.__proto__.constructor.name === 'GravitySensor') {
                  return fixedNumber(currentReading.fake_gVector[2], 1);
                } else if (this.__proto__.constructor.name === 'LinearAccelerationSensor') {
                  return fixedNumber(currentReading.fake_z, 1);
                }
                return fixedNumber(currentReading.fake_z + currentReading.fake_gVector[2], 1);
              }`,
            },
          ],
        }
      ],
    },
  ]
    add_wrappers(wrappers);
})()
