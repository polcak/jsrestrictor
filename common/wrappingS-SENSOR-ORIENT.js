/** \file
 * \brief Wrappers for the AbsoluteOrientationSensor and RelativeOrientationSensor
 *
 * \see https://www.w3.org/TR/orientation-sensor
 * \see https://www.w3.org/TR/orientation-sensor/#absoluteorientationsensor-model
 * \see https://www.w3.org/TR/orientation-sensor/#relativeorientationsensor-model
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
   * Device orientation sensors can be easily used for fingerprinting. As it highly
   * unlikely that two devices visiting the same site will be oriented exactly
   * the same, the orientation itself can serve as a fingerprint.
   *
   *
   * WRAPPING
   * AbsoluteOrientationSensor returns a quaterion decribing the physical
   * orientation of the device in relation to the Earth's reference coordinate
   * system. The faked orientation of the device is saved inside the "orient"
   * global variable that is accessible to all wrappers. The value is chosen
   * pseudorandomly from the domain hash. The wrappper supports possible change
   * of orientation. With each reading, it loads the "orient"'s contents,
   * converts the rotation matrix to a quaternion that is returned by the wrapped
   * getter.
   *
   * RelativeOrientationSensor also describes the orientation, but without
   * regard to the Earth's reference coordinate system. We suppose the coordinate
   * system is chosen at the beginning of the sensor instance creation.
   * As we observed, no matter how the device is oriented, there is always a slight
   * difference from the AbsoluteOrientationSensor's in at least one axis.
   * When the device moves, both sensors' readings change. But their difference
   * should be always constant. And thus, we pseudorandomly generate a deviation
   * from the Earth's reference coordinate system. And for each reading, we
   * take the values from the fake AbsoluteOrientationSensor and modify them
   * by the constant deviation.
   *
   * POSSIBLE IMPROVEMENTS
   * Study the supported coordinate systems of the RelativeOrientationSensor
   * and modify the wrapper behavior if needed.
   */

   /*
    * Create private namespace
    */
(function() {
  /*
   * \brief Initialization of data for storing sensor readings
   */
  var init_data = `
    var currentReading = currentReading || {quaternion: null, fake_quaternion: null, fake_quaternion_rel: null, timestamp: null};
    var previousReading = previousReading || {quaternion: null, fake_quaternion: null, fake_quaternion_rel: null, timestamp: null};
    var debugMode = false;

    const TWOPI = 2 * Math.PI;
    `;

  /*
   * \brief Property getters of the original sensor object
   */
  var orig_getters = `
    var origGetQuaternion = Object.getOwnPropertyDescriptor(OrientationSensor.prototype, "quaternion").get;
    var origGetTimestamp = Object.getOwnPropertyDescriptor(Sensor.prototype, "timestamp").get;
    `;

  /*
   * \brief Convert a given 3D rotation matrix to quaternion
   *
   * \param Rotation matrix
   */
  function matrixToQuaternion(rot) {
    var q = {x: null, y: null, z: null, w: null};
    var m;
    if (rot[2][2] < 0) {
      if (rot[0][0] > rot[1][1]) {
        m = 1 + rot[0][0] -rot[1][1] -rot[2][2];
        q.x = m;
        q.y = rot[0][1]+rot[1][0];
        q.z = rot[2][0]+rot[0][2];
        q.w = rot[1][2]-rot[2][1];
      } else {
        m = 1 -rot[0][0] + rot[1][1] -rot[2][2];
        q.x = rot[0][1]+rot[1][0];
        q.y = m;
        q.z = rot[1][2]+rot[2][1];
        q.w = rot[2][0]-rot[0][2];
      }
    } else {
      if (rot[0][0] < -rot[1][1]) {
        m = 1 -rot[0][0] -rot[1][1] + rot[2][2];
        q.x = rot[2][0]+rot[0][2];
        q.y = rot[1][2]+rot[2][1];
        q.z = m;
        q.w = rot[0][1]-rot[1][0];
      } else {
        m = 1 + rot[0][0] + rot[1][1] + rot[2][2];
        q.x = rot[1][2]-rot[2][1];
        q.y = rot[2][0]-rot[0][2];
        q.z = rot[0][1]-rot[1][0];
        q.w = m;
      }
    }
    var multiplier = 0.5 / Math.sqrt(m);

    q.x *= multiplier;
    q.y *= multiplier;
    q.z *= multiplier;
    q.w *= multiplier;

    return q;
  }

  /*
   * \brief The fake quaternion generator class
   * Note: Requires "orient" global var to be set.
  */
  class QuaternionGenerator {
    constructor() {
      this.DEVIATION_MIN = 0;
      this.DEVIATION_MAX = (Math.PI / 2) / 90 * 10; // 10°

      this.quaternion = null;
      this.quaternion_rel = null;

      this.yawDeviation = this.generateDeviation();
      this.pitchDeviation = this.generateDeviation();
      this.rollDeviation = this.generateDeviation();
    }

    /*
     * \brief Generates the rotation deviation
    */
    generateDeviation() {
      var devi = sen_prng() * (this.DEVIATION_MAX - this.DEVIATION_MIN) + this.DEVIATION_MIN;
      devi *= Math.round(sen_prng()) ? 1 : -1;
      return devi;
    }

    /*
     * \brief Updates the fake quaternions
     *
     * \param Current timestamp from the sensor object
     */
    update(t) {
      // Calculate quaternion for absolute orientation
      var rotMat = orient.rotMat; // Get the device rotation matrix

      var q = matrixToQuaternion(rotMat);
      this.quaternion = [
        fixedNumber(q.x, 3),
        fixedNumber(q.y, 3),
        fixedNumber(q.z, 3),
        fixedNumber(q.w, 3)
      ];

      // Calculate quaternion for relative orientation
      var relYaw = (orient.yaw + this.yawDeviation) % TWOPI;
      var relPitch = (orient.pitch + this.pitchDeviation) % TWOPI;
      var relRoll = (orient.roll + this.rollDeviation) % TWOPI;

      var relMat = calculateRotationMatrix(relYaw, relPitch, relRoll);

      var qr = matrixToQuaternion(relMat);
      this.quaternion_rel = [
        fixedNumber(qr.x, 3),
        fixedNumber(qr.y, 3),
        fixedNumber(qr.z, 3),
        fixedNumber(qr.w, 3)
      ];
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
    // from the previous sample. If so, we need to update the faked quaternion
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
    currentReading.orig_quaterion = origGetQuaternion.call(sensorObject);
    currentReading.timestamp = currentTimestamp;
    quaternionGenerator.update(currentTimestamp);
    currentReading.fake_quaternion = quaternionGenerator.quaternion;
    currentReading.fake_quaternion_rel = quaternionGenerator.quaternion_rel;

    if (debugMode) {
      console.debug(quaternionGenerator);
    }
  }

  /*
   * \brief Initializes the related generators
   */
  var generators = `
    // Initialize the quaternion generator, if not initialized before
    var quaternionGenerator = quaternionGenerator || new QuaternionGenerator();
    `;

  var helping_functions = sensorapi_prng_functions + device_orientation_functions
          + matrixToQuaternion + QuaternionGenerator + updateReadings;
  var hc = init_data + orig_getters + helping_functions + generators;

  var wrappers = [
  {
    parent_object: "OrientationSensor.prototype",
    parent_object_property: "quaternion",
    wrapped_objects: [],
    helping_code: hc,
    post_wrapping_code: [
      {
        code_type: "object_properties",
        parent_object: "OrientationSensor.prototype",
        parent_object_property: "quaternion",
        wrapped_objects: [],
        /**  \brief replaces OrientationSensor.quaternion getter to return a faked value
         */
        wrapped_properties: [
        {
          property_name: "get",
          property_value: `
          function() {
            updateReadings(this);
            if (this.__proto__.constructor.name === 'AbsoluteOrientationSensor') {
              // AbsoluteOrientationSensor
              return currentReading.fake_quaternion;
            } else {
              // RelativeOrientationSensor
              return currentReading.fake_quaternion_rel;
            }
          }`,
        },
        ],
      }
    ],
  }
  ]
  add_wrappers(wrappers);
})()
