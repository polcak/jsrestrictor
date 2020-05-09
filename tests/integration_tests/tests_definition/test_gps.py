import pytest
from time import time

from values_getters import get_position
from math_operations import is_in_accuracy

## Setup method - it is run before gps tests execution starts.
#
#  This setup method initialize variable position that contains current data about position and
#  this variable is provided to gps tests and values in position variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def position(browser):
    return get_position(browser.driver)


## Test accuracy of the latitude and longitude properties in meters.
def test_accuracy(browser, position, expected):
    if expected.geolocation.accuracy['value'] == 'REAL VALUE':
        if position['accuracy'] == "null":
            # If current value is null, real value has to be null too.
            assert position['accuracy'] == browser.real.geolocation.accuracy
        else:
            if expected.geolocation.accuracy['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 50 meters is tolerated.
                assert abs(float(position['accuracy']) - float(browser.real.geolocation.accuracy)) < 50
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['accuracy'], expected.geolocation.accuracy['accuracy'])
    else:
        # Should be spoofed value.
        assert position['accuracy'] == expected.geolocation.accuracy['value']


## Test accuracy of the latitude and longitude properties in meters.
def test_accuracy(browser, position, expected):
    if expected.geolocation.accuracy['value'] == 'REAL VALUE':
        if position['accuracy'] == "null":
            # If current value is null, real value has to be null too.
            assert position['accuracy'] == browser.real.geolocation.accuracy
        else:
            if expected.geolocation.accuracy['accuracy'] == 'EXACTLY':
                # Values do not have to be strictly equal.
                # A deviation of less than 50 meters is tolerated.
                assert abs(float(position['accuracy']) - float(browser.real.geolocation.accuracy)) < 50
            else:
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(position['accuracy'], expected.geolocation.accuracy['accuracy'])
    else:
        # Should be spoofed value.
        assert position['accuracy'] == expected.geolocation.accuracy['value']


## Test position's altitude in meters, relative to sea level.
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
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(round(float(position['latitude']), 3) * 1000,
                                      expected.geolocation.latitude['accuracy'] * 1000)
    else:
        # Should be spoofed value.
        assert position['latitude'] == expected.geolocation.latitude['value']


## Test position's longitude in decimal degrees.
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
                # Should be rounded real value in accuracy.
                assert is_in_accuracy(round(float(position['longitude']), 3) * 1000,
                                      expected.geolocation.longitude['accuracy'] * 1000)
    else:
        # Should be spoofed value.
        assert position['longitude'] == expected.geolocation.longitude['value']


## Test speed (velocity) of the device in meters per second. This value can be null.
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
def test_timestamp(position, expected):
    if expected.geolocation.timestamp['value'] == 'REAL VALUE':
        if expected.geolocation.timestamp['accuracy'] == 'EXACTLY':
            # Values do not have to be strictly equal because executing command takes some time.
            # A deviation of less than 2 seconds is tolerated.
            assert abs(time() - int(position['timestamp'])/1000) < 2
        else:
            # Should be rounded real value in accuracy.
            assert is_in_accuracy(position['timestamp'], expected.geolocation.timestamp['accuracy']*1000)
    else:
        # Should be spoofed value.
        assert position['timestamp'] == expected.geolocation.timestamp['value']
