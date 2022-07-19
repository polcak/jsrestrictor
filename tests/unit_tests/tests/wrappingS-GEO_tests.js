//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021 Martin Bednar
//
// SPDX-License-Identifier: GPL-3.0-or-later
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

const domainHash = "0000000000000000";

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
		var GeolocationPosition = function() {};
		GeolocationPosition.prototype = {
			coords: {
				latitude: 0,
				longitude: 0,
				altitude: null,
				accuracy: 0,
				altitudeAccuracy: null,
				heading: null,
				speed: null,
				__proto__: Object
			},
			timestamp: 0,
			__proto__: Object
		};
			
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
			tana_river: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -0.02171,
					longitude: 38.57106,
					speed: null
				},
				timestamp: 1610954158112
			},
			cape_town: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -33.9226,
					longitude: 18.4226,
					speed: null
				},
				timestamp: 1610954158112
			},
			christchurch: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -43.531,
					longitude: 172.6328,
					speed: null
				},
				timestamp: 1610954158112
			},
			buenos_aires: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: -34.5880,
					longitude: -58.4390,
					speed: null
				},
				timestamp: 1610954158112
			},
			spitsbergen: {
				coords: {
					accuracy: 150,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					latitude: 80.0177,
					longitude: 21.1954,
					speed: null
				},
				timestamp: 1610954158112
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
		
		//This function takes latitude and longitude of two location and returns the distance between them (in km).
		function calcDistance(lat1, long1, lat2, long2) 
		{
			var earth_radius = 6371; // km
			var distance_lat = toRadians(lat2-lat1); // rad
			var distance_long = toRadians(long2-long1); // rad
			var lat1 = toRadians(lat1); // rad
			var lat2 = toRadians(lat2); // rad

			// Haversine formula  
			var a = Math.sin(distance_lat/2) * Math.sin(distance_lat/2) +
				Math.sin(distance_long/2) * Math.sin(distance_long/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var distance = earth_radius * c;
			return distance;
		}

		// Converts numeric degrees to radians
		function toRadians (angle) {
			return angle * (Math.PI / 180);
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
		/*
		 *
		 * Note: the following tests are commented out for the following reasons:
		 *
		 * * The tests try to use indirect eval to achieve durable changes in the global scope. But the
		 * global scope does not contain the alea object. Hence the tests fail when they try to access
		 * alea.
		 *
		 * * The tests and possibly the tested code should be rewritten to deal with alea.
		it("should return given coordinates when flag provideAccurateGeolocationData is set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = true;
				var original_coords;
				var changed_coords;
				for (const position_key in originalPositions) {
					original_coords = originalPositions[position_key]['coords'];
					changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords'];
					expect(changed_coords).toEqual(original_coords,
					'Returned coords (Latitude: ' + changed_coords['latitude'] + ', Longtitude: ' + changed_coords['longtitude'] + ') are not equal to original coords (Latitude: ' + original_coords['latitude'] + ', Longtitude: ' + original_coords['longtitude'] + ') but non-changed (original) coords were expected.');
				}
			}
		});
		it("should return changed timestamp when flag provideAccurateGeolocationData is set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = true;
				var original_timestamp;
				var changed_timestamp;
				for (const position_key in originalPositions) {
					original_timestamp = originalPositions[position_key]['timestamp'];
					changed_timestamp = processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp'];
					expect(changed_timestamp).not.toEqual(original_timestamp,
					'Timestamp should have been changed but original timestamp (Original timestamp: ' + original_timestamp + ') has been returned (Returned timestamp: ' + changed_timestamp + '). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
				}
			}
		});
		it("should return given coordinates when previouslyReturnedCoords are set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				var original_coords;
				var changed_coords;
				for (const position_key in originalPositions) {
					previouslyReturnedCoords = originalPositions[position_key]['coords'];
					original_coords = originalPositions[position_key]['coords'];
					changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key])['coords'];
					expect(changed_coords).toEqual(original_coords,
					'Returned coords (Latitude: ' + changed_coords['latitude'] + ', Longtitude: ' + changed_coords['longtitude'] + ') are not equal to original coords (Latitude: ' + original_coords['latitude'] + ', Longtitude: ' + original_coords['longtitude'] + ') but non-changed (original) coords were expected.');
				}
			}
		});
		it("should return changed timestamp when previouslyReturnedCoords are set.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				var original_timestamp;
				var changed_timestamp;
				for (const position_key in originalPositions) {
					previouslyReturnedCoords = originalPositions[position_key]['coords'];
					original_timestamp = originalPositions[position_key]['timestamp'];
					changed_timestamp = processOriginalGPSDataObject(undefined, originalPositions[position_key])['timestamp'];
					expect(changed_timestamp).not.toEqual(original_timestamp,
					'Timestamp should have been changed but original timestamp (Original timestamp: ' + original_timestamp + ') has been returned (Returned timestamp: ' + changed_timestamp + '). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
				}
			}
		});
		it("should return coords that are not equal to original coords.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var original_coords;
				var changed_coords;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						original_coords = originalPositions[position_key]['coords'];
						changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key], desiredAccuracy)['coords'];
						expect(changed_coords).not.toEqual(original_coords,
						'Returned coords (Latitude: ' + changed_coords['latitude'] + ', Longtitude: ' + changed_coords['longtitude'] + ') are equal to original coords (Latitude: ' + original_coords['latitude'] + ', Longtitude: ' + original_coords['longtitude'] + ') but spoofed coords were expected.');
						previouslyReturnedCoords = undefined;
					}
				}
			}
		});
		// Required accuracy overview: https://github.com/polcak/jsrestrictor/blob/master/common/levels.js#L254
		it("should return changed coords that are in required accuracy.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var original_coords;
				var changed_coords;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						original_coords = originalPositions[position_key]['coords'];
						changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key], desiredAccuracy)['coords'];
						expect(calcDistance(changed_coords['latitude'],
										changed_coords['longitude'],
										original_coords['latitude'],
										original_coords['longitude'])).toBeLessThan(10*desiredAccuracy,
										'Spoofed position (Latitude: ' + changed_coords['latitude'] + ', Longtitude: ' + changed_coords['longtitude'] + ') are not enough near to original position (Latitude: ' + original_coords['latitude'] + ', Longtitude: ' + original_coords['longtitude'] + ') according to current desiredAccuracy (' + desiredAccuracy + ').');
						previouslyReturnedCoords = undefined;
					}
				}
			}
		});
		it("should return changed timestamp.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				var original_timestamp;
				var changed_timestamp;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						original_timestamp = originalPositions[position_key]['timestamp'];
						changed_timestamp = processOriginalGPSDataObject(undefined, originalPositions[position_key], desiredAccuracy)['timestamp'];
						expect(changed_timestamp).not.toEqual(original_timestamp, 'Timestamp should have been changed but original timestamp (Original timestamp: ' + original_timestamp + ') has been returned (Returned timestamp: ' + changed_timestamp + '). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
					}
				}
			}
		});
		it("should not return nonsence coords.",function() {
			if (typeof processOriginalGPSDataObject !== undefined && typeof processOriginalGPSDataObject_globals !== undefined) {
				// Eval the functions in this function scope using indirect eval call.
				// Look at: http://perfectionkills.com/global-eval-what-are-the-options#evaling_in_global_scope
				(1,eval)(processOriginalGPSDataObject_globals);
				(1,eval)(processOriginalGPSDataObject);
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var desiredAccuracyArray = [ 0.1, 1, 10, 100 ]
				var desiredAccuracy;
				provideAccurateGeolocationData = false;
				previouslyReturnedCoords = undefined;
				var original_coords;
				var changed_coords;
				for (let i = 0; i < desiredAccuracyArray.length; i++) {
					desiredAccuracy = desiredAccuracyArray[i];
					for (const position_key in originalPositions) {
						original_coords = originalPositions[position_key]['coords'];
						changed_coords = processOriginalGPSDataObject(undefined, originalPositions[position_key], desiredAccuracy)['coords'];
						expect(changed_coords['latitude']).not.toBeGreaterThan(90, 'Spoofed latitude (' + changed_coords['latitude'] + '°) greather than the highest possible value (90°). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['longitude']).not.toBeGreaterThan(180, 'Spoofed longitude (' + changed_coords['longitude'] + '°) greather than the highest possible value (180°). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['latitude']).not.toBeLessThan(-90, 'Spoofed latitude (' + changed_coords['latitude'] + '°) less than the lowest possible value (-90°). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['longitude']).not.toBeLessThan(-180, 'Spoofed longitude (' + changed_coords['longitude'] + '°) less than the lowest possible value (-180°). Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['latitude']).not.toBeNull('Spoofed latitude is null, but a number was expected. Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['longitude']).not.toBeNull('Spoofed longitude is null, but a number was expected. Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['latitude']).toBeDefined('Spoofed latitude is not defined, but a number was expected. Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						expect(changed_coords['longitude']).toBeDefined('Spoofed longitude is not defined, but a number was expected. Input position: ' + position_key + ' (Latitude: ' + originalPositions[position_key]['coords']['latitude'] + ', Longtitude: ' + originalPositions[position_key]['coords']['longitude'] + ').');
						previouslyReturnedCoords = undefined;
					}
				}
			}
		});
	*/
	});
});
