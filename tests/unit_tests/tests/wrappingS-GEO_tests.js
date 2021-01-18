//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021 Martin Bednar
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

/// <reference path="../../common/wrappingS-GEO.js">

describe("GEO", function() {
	describe("processOriginalGPSDataObject_globals", function() {
		it("should be defined.",function() {
			expect(processOriginalGPSDataObject_globals).toBeDefined();
		});
		it("previouslyReturnedCoords should be undefined.",function() {
			if (typeof previouslyReturnedCoords !== undefined) {
				eval(processOriginalGPSDataObject_globals);
				expect(typeof previouslyReturnedCoords).toBe('undefined');
			}
		});
		it("geoTimestamp should be defined.",function() {
			if (typeof previouslyReturnedCoords !== undefined) {
				eval(processOriginalGPSDataObject_globals);
				expect(geoTimestamp).toBeDefined();
			}
		});
		it("geoTimestamp should be number.",function() {
			if (typeof previouslyReturnedCoords !== undefined) {
				eval(processOriginalGPSDataObject_globals);
				expect(geoTimestamp).toEqual(jasmine.any(Number));
			}
		});
		it("geoTimestamp should be current datetime.",function() {
			if (typeof previouslyReturnedCoords !== undefined) {
				eval(processOriginalGPSDataObject_globals);
				now = Date.now();
				// max 3 second deviation
				expect(Math.abs(now-geoTimestamp)).toBeLessThanOrEqual(3000);
			}
		});
	});
	describe("processOriginalGPSDataObject", function() {
		var originalPositions = {
			fit_vut: {
				coords: {
					accuracy: 37,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 49.2263284,
					longitude: 16.598606399999998,
					speed: null
				},
				timestamp: 1610704131841
			},
			san_francisco: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 37.774929,
					longitude: -122.419416,
					speed: null
				},
				timestamp: 1610954150037
			},
			tokyo: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 35.689487,
					longitude: 139.691706,
					speed: null
				},
				timestamp: 1610954214124
			},
			london: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 51.507351,
					longitude: -0.127758,
					speed: null
				},
				timestamp: 1610954058112
			},
			equator_0meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 0,
					longitude: 0,
					speed: null
				},
				timestamp: 1610954419061
			},
			equator_180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 0,
					longitude: 180,
					speed: null
				},
				timestamp: 1610954419061
			},
			equator_neg180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 0,
					longitude: -180,
					speed: null
				},
				timestamp: 1610954419061
			},
			npole_0meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 90,
					longitude: 0,
					speed: null
				},
				timestamp: 1610954419061
			},
			npole_180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 90,
					longitude: 180,
					speed: null
				},
				timestamp: 1610954419061
			},
			npole_neg180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 90,
					longitude: -180,
					speed: null
				},
				timestamp: 1610954419061
			},
			spole_0meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -90,
					longitude: 0,
					speed: null
				},
				timestamp: 1610954419061
			},
			spole_180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -90,
					longitude: 180,
					speed: null
				},
				timestamp: 1610954419061
			},
			spole_neg180meridian: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -90,
					longitude: -180,
					speed: null
				},
				timestamp: 1610954419061
			}
		}
		
		//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
		//Source: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
		function calcCrow(lat1, lon1, lat2, lon2) 
		{
		  var R = 6371; // km
		  var dLat = toRad(lat2-lat1);
		  var dLon = toRad(lon2-lon1);
		  var lat1 = toRad(lat1);
		  var lat2 = toRad(lat2);

		  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c;
		  return d;
		}

		// Converts numeric degrees to radians
		//Source: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
		function toRad(Value) 
		{
			return Value * Math.PI / 180;
		}
		
		it("should be defined.",function() {
			expect(processOriginalGPSDataObject).toBeDefined();
		});
		it("should be function.",function() {
			if (typeof processOriginalGPSDataObject !== undefined) {
				eval(processOriginalGPSDataObject);
				expect(typeof processOriginalGPSDataObject).toBe('function');
			}
		});
		it("should return given coordinates when flag provideAccurateGeolocationData is set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = true;
				for (const position_key in originalPositions) {
					expect(processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords']).toEqual(originalPositions[position_key]['coords']);
					expect(processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp']).not.toEqual(originalPositions[position_key]['timestamp']);
				}
			}
		});
		it("should return changed timestamp when flag provideAccurateGeolocationData is set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = true;
				for (const position_key in originalPositions) {
					expect(processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp']).not.toEqual(originalPositions[position_key]['timestamp']);
				}
			}
		});
		it("should return given coordinates when previouslyReturnedCoords are set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = false;
				for (const position_key in originalPositions) {
					previouslyReturnedCoords = originalPositions[position_key]['coords'];
					expect(processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords']).toEqual(originalPositions[position_key]['coords']);
				}
			}
		});
		it("should return changed timestamp when previouslyReturnedCoords are set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = false;
				for (const position_key in originalPositions) {
					previouslyReturnedCoords = originalPositions[position_key]['coords'];
					expect(processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp']).not.toEqual(originalPositions[position_key]['timestamp']);
				}
			}
		});
		it("should return coords that are not equal to original coords.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var changed_coords;
				var original_coords;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords'];
						original_coords = originalPositions[position_key]['coords'];
						expect(changed_coords).not.toEqual(original_coords);
						previouslyReturnedCoords = undefined;
					}
				}
			}
		});
		it("should return changed coords that are in required accuracy.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var changed_coords;
				var original_coords;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords'];
						original_coords = originalPositions[position_key]['coords'];
						expect(calcCrow(changed_coords['latitude'], changed_coords['longitude'], original_coords['latitude'], original_coords['longitude'])).toBeLessThan(10*desiredAccuracy);
						previouslyReturnedCoords = undefined;
					}
				}
			}
		});
		it("should return changed timestamp.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				eval(processOriginalGPSDataObject);
				eval(processOriginalGPSDataObject_globals);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						let changed_timestamp = processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp'];
						let original_timestamp = originalPositions[position_key]['timestamp'];
						expect(changed_timestamp).not.toEqual(original_timestamp);
					}
				}
			}
		});
	});
});
