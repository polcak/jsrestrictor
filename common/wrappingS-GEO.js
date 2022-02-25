/** \file
 * \brief This file contains wrappers for the Geolocation API
 *
 * \see https://www.w3.org/TR/geolocation-API/
 *
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2020  Libor Polcak
 *  \author Copyright (C) 2020  Peter Marko
 *  \author Copyright (C) 2021  Giorgio Maone
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
 * The goal is to prevent leaks of user current position. The Geolocation API also provides access
 * to high precision timestamps which can be used to various web attacks (see for example,
 * http://www.jucs.org/jucs_21_9/clock_skew_based_computer,
 * https://lirias.kuleuven.be/retrieve/389086).
 *
 * Although it is true that the user needs to specificaly approve access to location facilities,
 * these wrappers aim on improving the control of the precision of the geolocation.
 *
 * The wrappers support the following controls:
 *
 * * Accurate data: the extension provides precise geolocation position but modifies the time
 *   precision in conformance with the Date and Performance wrappers.
 * * Modified position: the extension modifies the time precision of the time stamps in
 *   conformance with the Date and Performance wrappers, and additionally,  allows to limit the
 *   precision of the current position to hundered of meters, kilometers, tens, or hundereds of
 *   kilometers.
 *
 * When modifying position:
 *
 * * Repeated calls of `navigator.geolocation.getCurrentPosition()` return the same position
 * without page load and typically return another position after page reload.
 * * `navigator.geolocation.watchPosition()` does not change position.
 */

(function() {
	var processOriginalGPSDataObject_globals = `
		let geo_prng = alea(domainHash, "Geolocation");
		let randomx = geo_prng();
		let randomy = geo_prng();
		/**
		 * Make sure that repeated calls shows the same position (BUT different objects, via cloning)
		 * to reduce fingerprintablity.
		 */
		let previouslyReturnedCoords;
		let clone = obj => Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));

		/**
		 * \brief Store the limit for the returned timestamps.
		 *
		 * This is used to avoid returning older readings compared to the previous readings.
		 * The timestamp needs to be the same as was last time or newser.
		 */
		var geoTimestamp = Date.now();
		`;
	/**
	 * \brief Modifies the given PositionObject according to settings
	 *
	 * \param expectedMaxAge The maximal age of the returned time stamps as defined by the wrapped API
	 *        (https://www.w3.org/TR/geolocation-API/#max-age)
	 * \param originalPositionObject the position object to be returned without this wrapper, see the
	 *        Position interface (https://www.w3.org/TR/geolocation-API/#position)
	 *
	 * The function modifies the originalPositionObject and stores it for later readins. The returned
	 * position does not modify during the life time of a pages. The returned postion can be different
	 * after a page reload.
	 *
	 * The goal of the behavoiur is to prevent learning the current position so that different
	 * original postion can be mapped to the same position and the same position should generally
	 * yield a different outcome to prevent correlation of user activities.
	 *
	 * The algorithm works as follows:
	 * 1. The Earth surface is partitioned into squares (tiles) with the edge derived from the desired
	 * accuracy.
	 * 2. The position from the originalPositionObject is mapped to its tile and eight adjacent tiles.
	 * 3. A position in the current tile and the eight adjacent tiles is selected randomly.
	 *
	 * The returned timestamp is not older than 1 hour and it is the same as was during the last call
	 * or newer. Different calls to the function can yield different timestamps.
	 *
	 * \bug The tile-based approach does not work correctly near poles but:
	 * * The function returns fake locations near poles.
	 * * As there are not many people near poles, we do not believe this wrapping is useful near poles
	 * so we do not consider this bug as important.
	 */

		function spoofCall(fakeData, originalPositionObject, successCallback) {
			// proxying the original object lessens the fingerprintable weirdness
				// (e.g. accessors on the instance rather than on the prototype)
				fakeData = clone(fakeData);
				let pos = new Proxy(originalPositionObject, {
					get(target, key) {
						return (key in fakeData) ? fakeData[key] : target[key];
					},
					getPrototypeOf(target) {
						return Object.getPrototypeOf(target);
					}
				});
				successCallback(pos);
		}

		function processOriginalGPSDataObject(expectedMaxAge, originalPositionObject) {
			if (expectedMaxAge === undefined) {
				expectedMaxAge = 0; // default value
			}
			// Set reasonable expectedMaxAge of 1 hour for later computation
			expectedMaxAge = Math.min(3600000, expectedMaxAge);
			geoTimestamp = Math.max(geoTimestamp, Date.now() - Math.random()*expectedMaxAge);

			let spoofPos = coords => {
				let pos = { timestamp: geoTimestamp };
				if (coords) pos.coords = coords;
				spoofCall(pos, originalPositionObject, successCallback);
			};

			if (provideAccurateGeolocationData) {
				return spoofPos();
			}
			if (previouslyReturnedCoords) {
				return spoofPos(clone(previouslyReturnedCoords));
			}

			const EQUATOR_LEN = 40074;
			const HALF_MERIDIAN = 10002;
			const DESIRED_ACCURACY_KM = desiredAccuracy*2;

			var lat = originalPositionObject.coords.latitude;
			var lon = originalPositionObject.coords.longitude;
			// Compute (approximate) distance from 0 meridian [m]
			var x = (lon * (EQUATOR_LEN * Math.cos((lat/90)*(Math.PI/2))) / 180);
			// Compute (approximate) distance from equator [m]
			var y = (lat / 90) * (HALF_MERIDIAN);

			// Compute the coordinates of the left bottom corner of the tile in which the orig position is
			var xmin = Math.floor(x / DESIRED_ACCURACY_KM) * DESIRED_ACCURACY_KM;
			var ymin = Math.floor(y / DESIRED_ACCURACY_KM) * DESIRED_ACCURACY_KM;

			// The position to be returned should be in the original tile and the 8 adjacent tiles:
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			// |    |orig|    |
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			var newx = xmin + randomx * 3 * DESIRED_ACCURACY_KM - DESIRED_ACCURACY_KM;
			var newy = ymin + randomy * 3 * DESIRED_ACCURACY_KM - DESIRED_ACCURACY_KM;

			if (Math.abs(newy) > (HALF_MERIDIAN)) {
				newy = (HALF_MERIDIAN + HALF_MERIDIAN - Math.abs(newy)) * (newy < 0 ? -1 : 1);
				newx = -newx;
			}

			var newLatitude = newy / HALF_MERIDIAN * 90;
			var newLongitude = newx * 180 / (EQUATOR_LEN * Math.cos((newLatitude/90)*(Math.PI/2)));

			while (newLongitude < -180) {
				newLongitude += 360;
			}
			while (newLongitude > 180) {
				newLongitude -= 360;
			}

			var newAccuracy = DESIRED_ACCURACY_KM * 1000 * 2.5; // in meters

			previouslyReturnedCoords = {
				latitude: newLatitude,
				longitude: newLongitude,
				altitude: null,
				accuracy: newAccuracy,
				altitudeAccuracy: null,
				heading: null,
				speed: null,
				__proto__: originalPositionObject.coords.__proto__
			};
			spoofPos(previouslyReturnedCoords);
		};
	/**
	 * \brief process the parameters of the wrapping function
	 *
	 * Checks if the wrappers should be active, and the position modified. Transforms the desired
	 * precision into kilometers.
	 */
	var setArgs = `
		var enableGeolocation = (args[0] !== 0);
		var provideAccurateGeolocationData = (args[0] === -1);
		let desiredAccuracy = 0;
		switch (args[0]) {
			case 2:
				desiredAccuracy = 0.1;
				break;
			case 3:
				desiredAccuracy = 1;
				break;
			case 4:
				desiredAccuracy = 10;
				break;
			case 5:
				desiredAccuracy = 100;
				break;
		}
	`;

	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "geolocation",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "Navigator.prototype",
					apply_if: "!enableGeolocation",
					delete_properties: ["geolocation"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "Geolocation",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					apply_if: "!enableGeolocation",
					delete_properties: ["Geolocation"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "GeolocationCoordinates",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					apply_if: "!enableGeolocation",
					delete_properties: ["GeolocationCoordinates"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "GeolocationPosition",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					apply_if: "!enableGeolocation",
					delete_properties: ["GeolocationPosition"],
				}
			],
		},
		{
			parent_object: "window",
			parent_object_property: "GeolocationPositionError",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "window",
					apply_if: "!enableGeolocation",
					delete_properties: ["GeolocationPositionError"],
				}
			],
		},
		{
			parent_object: "Geolocation.prototype",
			parent_object_property: "getCurrentPosition",

			wrapped_objects: [
				{
					original_name: "Geolocation.prototype.getCurrentPosition",
					callable_name: "originalGetCurrentPosition",
				},
			],
			helping_code: setArgs + processOriginalGPSDataObject_globals,
			wrapping_function_args: "successCallback, errorCallback, origOptions",
			/** \fn fake Geolocation.prototype.getCurrentPosition
			 * \brief Provide a fake geolocation position
			 */
			wrapping_function_body: `
				${spoofCall}
				${processOriginalGPSDataObject}
				var options = {
					enableHighAccuracy: false,
				};
				if (origOptions) try {
					if ("timeout" in origOptions) {
						options.timeout = origOptions.timeout;
					}
					if ("maximumAge" in origOptions) {
						option.maximumAge = origOptions.maximumAge;
					}
				}
				catch { /* Undefined or another error */}
				originalGetCurrentPosition.call(this, processOriginalGPSDataObject.bind(null, options.maximumAge), errorCallback, options);
			`,
		},
		{
			parent_object: "Geolocation.prototype",
			parent_object_property: "watchPosition",
			wrapped_objects: [
				{
					original_name: "Geolocation.prototype.watchPosition",
					wrapped_name: "originalWatchPosition",
				},
			],
			helping_code: setArgs + processOriginalGPSDataObject_globals + "let watchPositionCounter = 0;",
			wrapping_function_args: "successCallback, errorCallback, origOptions",
			/** \fn fake Geolocation.prototype.watchPosition
			 * Geolocation.prototype.watchPosition intended use concerns tracking user position changes.
			 * JShelter provides four modes of operaion:
			 * * current position approximation: Always return the same data, the same as getCurrentPosition()
			 * * accurate data: Return exact position but fake timestamp
			 */
			wrapping_function_body: `
				if (provideAccurateGeolocationData) {
					function wrappedSuccessCallback(originalPositionObject) {
						geoTimestamp = Date.now(); // Limit the timestamp accuracy by calling possibly wrapped function
						return spoofCall({ timestamp: geoTimestamp }, originalPositionObject, succesCallback);
					}
					originalWatchPosition.call(this, wrappedSuccessCallback, errorCallback, origOptions);
				}
				else {
					// Re-use the wrapping of n.g.getCurrentPosition()
					Geolocation.prototype.getCurrentPosition(successCallback, errorCallback, origOptions);
					watchPositionCounter++;
					return watchPositionCounter;
				}
			`,
		},
		{
			parent_object: "Geolocation.prototype",
			parent_object_property: "clearWatch",
			wrapped_objects: [
				{
					original_name: "Geolocation.prototype.clearWatch",
					wrapped_name: "originalClearWatch",
				},
			],
			helping_code: setArgs,
			wrapping_function_args: "id",
			/** \fn fake_or_original Geolocation.prototype.clearWatch
			 * If the Geolocation API provides correct data, call the original implementation,
			 * otherwise do nothing as the watchPosition object was not created.
			 */
			wrapping_function_body: `
				if (provideAccurateGeolocationData) {
					originalClearWatch.call(Geolocation.prototype, id);
				}
			`,
		}
	]
	add_wrappers(wrappers);
})();
