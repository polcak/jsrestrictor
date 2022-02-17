/** \file
 * \brief Wrappers for the Ambient Light Sensor
 *
 * \see https://www.w3.org/TR/ambient-light/
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
  * The AmbientLightSensor returns illuminance of the device's environment. This
  * is another value that describes the nearby physical surrounding of the device,
  * and can thus be used together with other readings for creating a unique fingerprint.
  *
  * WRAPPING
  * On examined stationary devices inside an office, the illuminance measured
  * was between 500 and 900, depending on the concrete position's light conditions.
  * All measured values were rounded to nearest 50 illuminance value.
  * The wrapper silumlates the same behavior. At start, a pseudorandom illuminance
  * value is drawn. As we simulate a stationary device, this value remains constant
  * for all AmbientLightSensor.prototype.illuminance calls.
  *
  * POSSIBLE IMPROVEMENTS
  * Simulation of changes in the illuminance.
  */

  /*
   * Create private namespace
   */
(function() {
  /*
    * \brief Generates a pseudorandom faked illuminance value
  */
  function drawIlluminance() {
    const ILLUMINANCE_MIN = 500
    const ILLUMINANCE_MAX = 900
    const ILLUMINANCE_NEAREST = 50

    var ilu = sen_prng() * (ILLUMINANCE_MAX - ILLUMINANCE_MIN) + ILLUMINANCE_MIN;
    return Math.round(ilu / ILLUMINANCE_NEAREST) * ILLUMINANCE_NEAREST;
  }
  /*
    * \brief Initialization of the illuminance;
  */
  var init_data = `
    var illuminance = illuminance || drawIlluminance();
    `;

  var hc = sensorapi_prng_functions + drawIlluminance + init_data;

  var wrappers = [
    {
      parent_object: "AmbientLightSensor.prototype",
      parent_object_property: "illuminance",
      wrapped_objects: [],
      helping_code: hc,
      post_wrapping_code: [
        {
          code_type: "object_properties",
          parent_object: "AmbientLightSensor.prototype",
          parent_object_property: "illuminance",
          wrapped_objects: [],
          /**  \brief replaces AmbientLightSensor.prototype.illuminance getter to return a faked value
           */
          wrapped_properties: [
            {
              property_name: "get",
              property_value: `
              function() {
                return illuminance;
              }`,
            },
          ],
        }
      ],
    },
  ]
  add_wrappers(wrappers);
})()
