//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020  Libor Polcak
//  Copyright (C) 2020  Peter Marko
//  Copyright (C) 2019  Martin Timko
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

/// See https://www.w3.org/TR/geolocation-API/ for the API description

(function() {
	var processOriginalGPSDataObject_globals = gen_random32 + `
		/**
		 * Make sure that repeated calls shows the same position to reduce
		 * fingerprintablity.
		 */
		var previouslyReturnedCoords = undefined;
		var geoTimestamp = Date.now();
		`;
	var processOriginalGPSDataObject = `
		function processOriginalGPSDataObject(expectedMaxAge, originalPositionObject) {
			if (expectedMaxAge === undefined) {
				expectedMaxAge = 0; // default value
			}
			// Set reasonable expectedMaxAge of 1 hour for later computation
			expectedMaxAge = Math.min(3600000, expectedMaxAge);
			geoTimestamp = Math.max(geoTimestamp, Date.now() - Math.random()*expectedMaxAge);
			if (provideAccurateGeolocationData) {
			  var pos = {
    			coords: originalPositionObject.coords,
			    timestamp: geoTimestamp // Limit the timestamp accuracy
			  };	
				successCallback(pos);
				return;
			}
			if (previouslyReturnedCoords !== undefined) {
				var pos = {
					coords: previouslyReturnedCoords,
					timestamp: geoTimestamp
				};
				successCallback(pos);
				return;
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
			var newx = xmin + gen_random32()/2**32 * 3 * DESIRED_ACCURACY_KM - DESIRED_ACCURACY_KM;
			var newy = ymin + gen_random32()/2**32 * 3 * DESIRED_ACCURACY_KM - DESIRED_ACCURACY_KM;

			if (newy > (HALF_MERIDIAN)) {
				newy = HALF_MERIDIAN - (newy - HALF_MERIDIAN);
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

			const editedPositionObject = {
				coords: {
					latitude: newLatitude,
					longitude: newLongitude,
					altitude: null,
					accuracy: newAccuracy,
					altitudeAccuracy: null,
					heading: null,
					speed: null,
					__proto__: originalPositionObject.coords.__proto__
				},
				timestamp: geoTimestamp,
				__proto__: originalPositionObject.__proto__
			};
			Object.freeze(editedPositionObject.coords);
			previouslyReturnedCoords = editedPositionObject.coords;
			successCallback(editedPositionObject);
		}
	`;
	setArgs = `
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
			parent_object: "navigator",
			parent_object_property: "geolocation",
			wrapped_objects: [],
			helping_code: setArgs,
			post_wrapping_code: [
				{
					code_type: "delete_properties",
					parent_object: "navigator",
					apply_if: "!enableGeolocation",
					delete_properties: ["geolocation"],
				}
			],
			nofreeze: true,
		},
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "getCurrentPosition",

			wrapped_objects: [
				{
					original_name: "navigator.geolocation.getCurrentPosition",
					wrapped_name: "originalGetCurrentPosition",
				},
			],
			helping_code: setArgs + processOriginalGPSDataObject_globals,
			wrapping_function_args: "successCallback, errorCallback, origOptions",
			wrapping_function_body: processOriginalGPSDataObject + `
				var options = {
					enableHighAccuracy: false,
				};
				try {
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
			parent_object: "navigator.geolocation",
			parent_object_property: "watchPosition",
			wrapped_objects: [
				{
					original_name: "navigator.geolocation.watchPosition",
					wrapped_name: "originalWatchPosition",
				},
			],
			helping_code: setArgs + processOriginalGPSDataObject_globals + "let watchPositionCounter = 0;",
			wrapping_function_args: "successCallback, errorCallback, origOptions",
			/**
			 * navigator.geolocation.watchPosition intended use concerns tracking user position changes.
			 * JSR provides four modes of operaion:
			 * * current position approximation: Always return the same data, the same as getCurrentPosition()
			 * * accurate data: Return exact position but fake timestamp
			 */
			wrapping_function_body: `
				if (provideAccurateGeolocationData) {
					function wrappedSuccessCallback(originalPositionObject) {
						geoTimestamp = Date.now(); // Limit the timestamp accuracy by calling possibly wrapped function
				  	var pos = {
    					coords: originalPositionObject.coords,
				  	  timestamp: geoTimestamp
				  	};	
						successCallback(pos);
					}
					originalWatchPosition.call(this, wrappedSuccessCallback, errorCallback, origOptions);
				}
				else {
					// Re-use the wrapping of n.g.getCurrentPosition()
					navigator.geolocation.getCurrentPosition(successCallback, errorCallback, origOptions);
					watchPositionCounter++;
					return watchPositionCounter;
				}
			`,
		},
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "clearWatch",
			wrapped_objects: [
				{
					original_name: "navigator.geolocation.clearWatch",
					wrapped_name: "originalClearWatch",
				},
			],
			helping_code: "",
			wrapping_function_args: "id",
			/**
			 * If the Geolocation API provides correct data, call the original implementation,
			 * otherwise do nothing as the watchPosition object was not created.
			 */
			wrapping_function_body: `
				if (provideAccurateGeolocationData) {
					originalClearWatch.call(navigator.geolocation, id);
				}
			`,
		}
	]
	add_wrappers(wrappers);
})();
