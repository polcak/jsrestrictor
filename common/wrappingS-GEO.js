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

(function() {
	var processOriginalGPSDataObject = `
		function processOriginalGPSDataObject(originalPositionObject) {
			var newLatitude = 0;
			var newLongitude = 0;
			var newAltitude = 0;
			var newAccuracy = 0;
			var newAltitudeAccuracy = 0;
			var newHeading = 0;
			var newSpeed = 0;
			var newTimestamp = 0;

			if (!setAllGPSDataToZero) {
				if (originalPositionObject.coords.latitude != null && originalPositionObject.coords.latitude != Infinity && originalPositionObject.coords.latitude >= 0) {
						newLatitude = func(originalPositionObject.coords.latitude, latitudePrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.longitude != null && originalPositionObject.coords.longitude != Infinity && originalPositionObject.coords.longitude >= 0) {
					newLongitude = func(originalPositionObject.coords.longitude, longitudePrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.altitude != null && originalPositionObject.coords.altitude != Infinity && originalPositionObject.coords.altitude >= 0) {
					newAltitude = func(originalPositionObject.coords.altitude, altitudePrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.accuracy != null && originalPositionObject.coords.accuracy != Infinity && originalPositionObject.coords.accuracy >= 0) {
					newAccuracy = func(originalPositionObject.coords.accuracy, accuracyPrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.altitudeAccuracy != null && originalPositionObject.coords.altitudeAccuracy != Infinity && originalPositionObject.coords.altitudeAccuracy >= 0) {
					newAltitudeAccuracy = func(originalPositionObject.coords.altitudeAccuracy, altitudeAccuracyPrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.heading != null && originalPositionObject.coords.heading != Infinity && originalPositionObject.coords.heading >= 0) {
					newHeading = func(originalPositionObject.coords.heading, headingPrecisionInDecimalPlaces);
				}
				if (originalPositionObject.coords.speed != null && originalPositionObject.coords.speed != Infinity && originalPositionObject.coords.speed >= 0) {
					newSpeed = func(originalPositionObject.coords.speed, speedPrecisionInDecimalPlaces);
				}
				if (originalPositionObject.timestamp != null && originalPositionObject.timestamp != Infinity && originalPositionObject.timestamp >= 0) {
					newTimestamp = func(originalPositionObject.timestamp, timestampPrecisionInDecimalPlaces);
				}
			}

			const editedPositionObject = {
				coords: {
					latitude: newLatitude,
					longitude: newLongitude,
					altitude: newAltitude,
					accuracy: newAccuracy,
					altitudeAccuracy: newAltitudeAccuracy,
					heading: newHeading,
					speed: newSpeed,
					__proto__: originalPositionObject.coords.__proto__
				},
				timestamp: newTimestamp,
				__proto__: originalPositionObject.__proto__
			};
			successCallback(editedPositionObject);
		}
	`;
	setArgs = `
		var setAllGPSDataToZero = args[0];
		var latitudePrecisionInDecimalPlaces = args[1];
		var longitudePrecisionInDecimalPlaces = args[2];
		var altitudePrecisionInDecimalPlaces = args[3];
		var accuracyPrecisionInDecimalPlaces = args[4];
		var altitudeAccuracyPrecisionInDecimalPlaces = args[5];
		var headingPrecisionInDecimalPlaces = args[6];
		var speedPrecisionInDecimalPlaces = args[7];
		var timestampPrecisionInDecimalPlaces = args[8];
		var func = rounding_function;
		if (args[9]) {
			func = geolocation_noise_function;
		}
	`;

	/**
	 * Randomize Geolocation data
	 */
	var geolocation_noise_function = `
	function geolocation_noise_function(numberToChange, precision) {
		var rounded = rounding_function(numberToChange, precision);
		return rounded + Math.random() * Math.pow(10, 3 - precision);
	}`;

	var wrappers = [
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "getCurrentPosition",

			wrapped_objects: [
				{
					original_name: "navigator.geolocation.getCurrentPosition",
					wrapped_name: "originalGetCurrentPosition",
				},
			],
			helping_code: rounding_function + geolocation_noise_function + setArgs,
			wrapping_function_args: "successCallback",
			wrapping_function_body: processOriginalGPSDataObject + `
				function error(err) {
						console.warn('ERROR(' + err.code + '): ' + err.message);
				}

				function error(err) {
						console.warn('ERROR(' + err.code + '): ' + err.message);
				}

				var options = {
					enableHighAccuracy: false,
					timeout: 5000,
					maximumAge: 0
				};
				originalGetCurrentPosition.call(navigator.geolocation, processOriginalGPSDataObject, error, options);

				
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
			helping_code: rounding_function + geolocation_noise_function + setArgs + "let watchPositionCounter = 0;",
			wrapping_function_args: "successCallback, errorCallback, origOptions",
			/**
			 * navigator.geolocation.watchPosition intended use concerns tracking user position changes.
			 * JSR provides four modes of operaion:
			 * * GEO OFF: navigator.geolocation is undefined. FIXME implement
			 * * current position approximation: Always return the same data, the same as getCurrentPosition()
			 * * accurate data: Return exact position but fake timestamp FIXME implement
			 */
			wrapping_function_body: `
				if (provideAccurateGeolocationData) {
					let wrappedSuccessCallback = successCallback; // FIXME wrap successCallback to return timestamp with the precision as performance.now()
					return originalWatchPosition.call(navigator.geolocation, wrappedSuccessCallback, errorCallback, origOptions);
				}
				navigator.geolocation.getCurrentPosition(successCallback, errorCallback, origOptions);
				watchPositionCounter++;
				return watchPositionCounter;
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
			helping_code: setArgs,
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
