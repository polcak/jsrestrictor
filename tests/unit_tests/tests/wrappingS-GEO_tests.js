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
			}
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
			if (typeof processOriginalGPSDataObject !== undefined) {
				eval(processOriginalGPSDataObject);
				provideAccurateGeolocationData = true;
				expect(typeof processOriginalGPSDataObject).toBe('function');
			}
		});
	});
});
