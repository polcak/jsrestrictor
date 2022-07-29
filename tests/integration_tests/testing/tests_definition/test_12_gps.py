#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

import pytest
from time import time

from values_getters import get_position
from math_operations import is_in_accuracy, calc_distance

from web_browser_shared import get_shared_browser

## Setup method - it is run before gps tests execution starts.
#
#  This setup method initialize variable position that contains current data about position and
#  this variable is provided to gps tests and values in position variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def position(browser):
    position = {
        'accuracy'        : "null",
        'altitude'        : "null",
        'altitudeaccurac' : "null",
        'heading'         : "null",
        'latitude'        : "null",
        'longitude'       : "null",
        'speed'           : "null",
        'timestamp'       : "null"
    }
    try:
        position = get_position(browser.driver)
    except:
        print("\nCan not read GPS data.")
    return position

geolocation_available = pytest.mark.skipif("invalid" in
        get_position(get_shared_browser().driver).keys(),
        reason = "This browser does not allow getting location"
        )


## Test accuracy of the latitude and longitude properties in meters.
@geolocation_available
def test_accuracy(browser, position, expected):
    if expected.geolocation.accuracy['value'] == 'REAL VALUE':
        if position['accuracy'] == "null":
            # If current value is null, real value has to be null too.
            assert position['accuracy'] == browser.real.geolocation.accuracy
        else:
            if expected.geolocation.accuracy['accuracy'] == 'EXACTLY':                
                # x is real position (position returned without JShelter)
                # y should be real position too (position returned with JShelter level 0)
                #
                # It is clear that x and y will not be exact same values. This is due to the netural GPS inaccuracy.
				# A small difference is tolerated.
                # x.accuracy and y.accuracy will be probably different.
                # But distance between x and y should be less than (x.accuracy + y.accuracy).               
                assert calc_distance(float(browser.real.geolocation.latitude),
                                    float(browser.real.geolocation.longitude),
                                    float(position['latitude']),
                                    float(position['longitude'])) < (float(browser.real.geolocation.accuracy) + float(position['accuracy']))
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['accuracy'], expected.geolocation.accuracy['accuracy'])
    else:
        # Should be spoofed value.
        assert position['accuracy'] == expected.geolocation.accuracy['value']


## Test position's altitude in meters, relative to sea level.
@geolocation_available
def test_altitude(browser, position, expected):
    if expected.geolocation.altitude['value'] == 'REAL VALUE':
        if position['altitude'] == "null":
            # If current value is null, real value has to be null too.
            assert position['altitude'] == browser.real.geolocation.altitude
        else:
            if expected.geolocation.altitude['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 10 meters is tolerated.
                assert abs(float(position['altitude']) - float(browser.real.geolocation.altitude)) < 10
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['altitude'], expected.geolocation.altitude['accuracy'])
    else:
        # Should be spoofed value.
        assert position['altitude'] == expected.geolocation.altitude['value']


## Test accuracy of the altitude property in meters.
@geolocation_available
def test_altitudeaccurac(browser, position, expected):
    if expected.geolocation.altitudeAccurac['value'] == 'REAL VALUE':
        if position['altitudeaccurac'] == "null":
            # If current value is null, real value has to be null too.
            assert position['altitudeaccurac'] == browser.real.geolocation.altitudeAccurac
        else:
            if expected.geolocation.altitudeAccurac['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 10 meters is tolerated.
                assert abs(float(position['altitudeaccurac']) - float(browser.real.geolocation.altitudeAccurac)) < 10
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['altitudeaccurac'],
                                      expected.geolocation.altitudeAccurac['accuracy'])
    else:
        # Should be spoofed value.
        assert position['altitudeaccurac'] == expected.geolocation.altitudeAccurac['value']


## Test heading.
#
# Heading is the direction in which the device is traveling. This value, specified in degrees,
# indicates how far off from heading true north the device is. 0 degrees represents true north,
# and the direction is determined clockwise (east is 90 degrees and west is 270 degrees).
# If speed is 0, heading is NaN. If the device is unable to provide heading information, this value is null
@geolocation_available
def test_heading(browser, position, expected):
    if expected.geolocation.heading['value'] == 'REAL VALUE':
        if position['heading'] == "null":
            # If current value is null, real value has to be null too.
            assert position['heading'] == browser.real.geolocation.heading
        else:
            if expected.geolocation.heading['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 30 degrees is tolerated.
                assert abs(float(position['heading']) - float(browser.real.geolocation.heading)) < 30
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['heading'], expected.geolocation.heading['accuracy'])
    else:
        # Should be spoofed value.
        assert position['heading'] == expected.geolocation.heading['value']


## Test position's latitude in decimal degrees.
@geolocation_available
def test_latitude(browser, position, expected):
    if expected.geolocation.latitude['value'] == 'REAL VALUE':
        if position['latitude'] == "null":
            # If current value is null, real value has to be null too.
            assert position['latitude'] == browser.real.geolocation.latitude
        else:
            if expected.geolocation.latitude['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 1 degrees is tolerated.
                assert abs(float(position['latitude']) - float(browser.real.geolocation.latitude)) < 1
            else:
                real_latitude = float(browser.real.geolocation.latitude)
                spoofed_latitude = float(position['latitude'])
                max_allowed_deviation = expected.geolocation.latitude['accuracy']
                assert abs(real_latitude - spoofed_latitude) < max_allowed_deviation
    else:
        # Should be spoofed value.
        assert position['latitude'] == expected.geolocation.latitude['value']


## Test position's longitude in decimal degrees.
@geolocation_available
def test_longitude(browser, position, expected):
    if expected.geolocation.longitude['value'] == 'REAL VALUE':
        if position['longitude'] == "null":
            # If current value is null, real value has to be null too.
            assert position['longitude'] == browser.real.geolocation.longitude
        else:
            if expected.geolocation.longitude['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 1 degrees is tolerated.
                assert abs(float(position['longitude']) - float(browser.real.geolocation.longitude)) < 1
            else:
                real_longitude = float(browser.real.geolocation.longitude)
                spoofed_longitude = float(position['longitude'])
                max_allowed_deviation = expected.geolocation.longitude['accuracy']
                assert abs(real_longitude - spoofed_longitude) < max_allowed_deviation
    else:
        # Should be spoofed value.
        assert position['longitude'] == expected.geolocation.longitude['value']


## Test speed (velocity) of the device in meters per second. This value can be null.
@geolocation_available
def test_speed(browser, position, expected):
    if expected.geolocation.speed['value'] == 'REAL VALUE':
        if position['speed'] == "null":
            # If current value is null, real value has to be null too.
            assert position['speed'] == browser.real.geolocation.speed
        else:
            if expected.geolocation.speed['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 5 meters per second is tolerated.
                assert abs(float(position['speed']) - float(browser.real.geolocation.speed)) < 5
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['speed'], expected.geolocation.speed['accuracy'])
    else:
        # Should be spoofed value.
        assert position['speed'] == expected.geolocation.speed['value']


## Test timestamp.
@geolocation_available
def test_timestamp(position, expected):
    if expected.geolocation.timestamp['value'] == 'REAL VALUE':
        if expected.geolocation.timestamp['accuracy'] == 'EXACTLY':
            # Values do not have to be strictly equal because executing command takes some time.
            # A deviation of less than 2 seconds is tolerated.
            assert abs(time() - int(position['timestamp'])/1000) < 2
        else:
            timestamp_accuracy = expected.geolocation.timestamp['accuracy']*1000
            # Should be rounded real value in accuracy.
            assert is_in_accuracy(position['timestamp'], timestamp_accuracy)
    else:
        # Should be spoofed value.
        assert position['timestamp'] == expected.geolocation.timestamp['value']
