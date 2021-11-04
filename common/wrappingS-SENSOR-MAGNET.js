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

  */

  /*
   * Create private namespace
   */
(function() {

/*
  const FIELD_MIN = 30;
  const FIELD_MAX = 70;
  const FLUCTUATION = 0.05; // [0,1)

  class Reading {
    constructor() {
      this.orig_x = null;
      this.orig_y = null;
      this.orig_z = null;
      this.timestamp = null; // To distinguish between readings

      this.fake_x = null;
      this.fake_y = null;
      this.fake_z = null;
    }
  }
*/

/*
  function getRandomDeviceOrientation() {
  }
*/

  var init_data = `
    let currentReading = {orig_x: null, orig_y: null, orig_z: null, timestamp: null,
                      fake_x: null, fake_y: null, fake_z: null};

    let previousReading = JSON.parse(JSON.stringify(currentReading));

    //let previousReading = new Reading;
    //let currentReading = new Reading;

    //let emulateStationaryDevice = args[0];
    //let deviceOrientation = null;
    `;

   var orig_getters = `
    let origGetX = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "x").get;
    let origGetY = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "y").get;
    let origGetZ = Object.getOwnPropertyDescriptor(Magnetometer.prototype, "z").get;
    let origGetTimestamp = Object.getOwnPropertyDescriptor(Sensor.prototype, "timestamp").get;
    `;

  function generateRandomField(previous) {
    const FIELD_MIN = 30;
    const FIELD_MAX = 70;
    const FLUCTUATION = 0.05; // [0,1)

    let maxStep = previous * FLUCTUATION;
    let min = previous - maxStep;
    let max = previous + maxStep;
    min = Math.max(min, FIELD_MIN);
    max = Math.min(max, FIELD_MAX);

    return Math.random() * (max - min) + min;
    // TODO ADD SOME CENTER VALUE
  }


  function fakeReading(current, previous) {
    /*
    current.orig_x = 30;
    current.orig_y = 40;
    current.orig_z = 5;
    current.timestamp = 1000;

    previous.orig_x = 29;
    previous.orig_y = 41;
    previous.orig_z = 5;
    previous.timestamp = 1000;
    */

    //console.log(previous);

    // Get strength of the previously-measured magnetic field in microTesla
    previousM = Math.sqrt(Math.pow(previous.orig_x,2) + Math.pow(previous.orig_y,2) + Math.pow(previous.orig_z,2));

    //console.log(previousM);

    // Generate the new desired (fake) magnetic field
    fakeM = generateRandomField(previousM)

    //console.log(fakeM);

    fakeM2 = Math.pow(fakeM,2);
    //console.log(fakeM2);

    // SPLIT IT
    // TODO:
    portionX = fakeM2 / 3;
    portionY = portionX;
    portionZ = portionX;
    // END TODO

    current.fake_x = Math.sqrt(portionX);
    current.fake_y = Math.sqrt(portionY);
    current.fake_z = Math.sqrt(portionZ);

    //console.log(current);
  }

  function updateReadings(sensorObject) {
    let currentTimestamp = origGetTimestamp.call(sensorObject);
    if (currentTimestamp === previousReading.timestamp) {
      // No new reading, nothing to update
      return;
    }

    // Rotate the readings: previous <- current
    previousReading = JSON.parse(JSON.stringify(currentReading));


    // Update current with
    currentReading.orig_x = origGetX.call(sensorObject);
    currentReading.orig_y = origGetY.call(sensorObject);
    currentReading.orig_z = origGetZ.call(sensorObject);
    currentReading.timestamp = currentTimestamp;

    fakeReading(currentReading, previousReading);
  }

  var helping_functions = generateRandomField + fakeReading + updateReadings;
  var hc = init_data + orig_getters + helping_functions;

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

/*
* ````````````````````````````````````````````````````````````````````````````````````````````````````
* ````````````````````````````````````````````````````````````````````````````````````````````````````
* ``````````````````````````````````````````````.:///+++oo/::.````````````````````````````````````````
* `````````````````````````````````````````.:+sydmNmyo+/oydNMNdo.`````````````````````````````````````
* ```````````````````````````````````.:ooosmNNNNMMMMdhhdydMMMMMMd:````````````````````````````````````
* ``````````````````````````````````-dddyyNMNmmNMMMMMMMMMMMMMMMMMN:```````````````````````````````````
* `````````````````````````````````-mMNNdmMmhddddmNMMMMMMMMMMMMMMMo```````````````````````````````````
* ````````````````````````````````.hMMMMdss:...--:/+shdmNMMMMMMMMMNo``````````````````````````````````
* ````````````````````````````````-NMMm+.`````````..--:/+oyNMMMMMMMm``````````````````````````````````
* `````````````````````````````````sNd:`` ` ``````..--:::/+mMMMMMMMmo`````````````````````````````````
* ``````````````````````````````````:.````````````...-:::/+dMMMMMMMM/`````````````````````````````````
* `````````````````````...``````````-```   ````.-::::::////oNMMMMMMN:`````````````````````````````````
* ``````````````.```..```..`````````:-`.--...:ohmNNmhysoo+//sNMMMMdo+o.```````````````````````````````
* ``````````````..```````.``````````./smmNd../ohmdoyyyy+////+sMMmyy+/h/```````````````````````````````
* ....``````````..``...``...`````````-ssoys`.://:-------://++ohdoddy+y-````````````````````````````` `
* ....``````````.``.....`.```````````.....``.::--......-://++o++sdNd+-````````````````````````````````
* `...```...````...``..``....`````````.`````.-:::-...--://+++++sy++/.`````````````````````````````````
* `..`.````.````````...........````````..```-/oos:---:://++++ooho:.```````````````````````````````````
* ``..````..````````..........``````````..`:hNMMms+/:://++++ooooo.````````````````````````````````````
* ```````.`.``````````.```....`.````````../ymmdNNNNmy+//+++ooosoo.`````````````````````````````` `````
* ````````.`.``````````.`.....```````````.osoo+oooo+///+ooooossos-```````````````````````````````  ```
* `````````````````````````.``````````````--.-/oo+////+oosssyysshs/.``````````````````````````````````
* `````````````````````````````````````````...-----::/osso++/::---..``````````````````````````````````
* ``````````````````````````````````````````....-:/osys+::-.....-/+shy-````````````````````````````` `
* ````````````````````````````````````````````.:/ooo+/://++oshdmNNMMMMd.``````````````````````````````
* ```````````````````.```````````````````..`   `.--::+ydNNMMMMMMMMMMMMMh``````````````````````````````
* `````````````````.```````````````````-/ydh+.`.-/+ymNMMMMMMMMMMMMMMMMMM/`````````````````````````````
* ````````````````````````.`````````.:ohmNNmhooshdmNmNNNNNNNMMMMMMMMMMMMm+````````````````````````````
* `````````````````````````````.-:/+yhddddhhdmhddmNMMNNNNNNMMMMMMMMMMMMMMMh:``````````````````````````
* ````````.```````````````.`../shddhhhyhhdddddddNMMNNNNMMMMMMMMMMMMMMMMMMMMNy-````````````````````````
* ``````....````````````..../dmdddmmmNNNNNNNNNNNNNNmNNNNNNNNMMMMNNMMMNNNNNNmmmo.``````````````````````
* ````````.``.`````````....odhdNMNmmmmmdmdmmmmmmNNNNNNNNNNNMNMMMNNNNNNmNNNNNNNNm+.````````````````````
* ```````..`.`.```````....+hyddhNhyddddmddmmmmmNNNNNNNNNNNNNNNNNNNmmmNNNMMMMMMMMMm/`````````````
* ````````.```````````.../yhdNdmdhddmmdmmmdmmmmmmmmmmmmNNNNNNNNmmdmNNMMMMMMMMMMMMMMy`````````````
* ```````````````````...ohhhdddhdddddmmdddmmmmmmmmdmmmNNNmmmmmmdddddmNNNMMMMMMMMMMMMs````````````````
*/
