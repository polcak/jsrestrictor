import pytest
from datetime import datetime
import time
import random

from math_operations import is_in_accuracy
from configuration import Config


## Setup method - it is run before time tests execution starts.
#
#  This setup method open testing page - it is necessary in Mozilla Firefox.
#  In Mozilla Firefox: Time is spoofed only when page is opened.
@pytest.fixture(scope='module', autouse=True)
def load_test_page(browser):
    browser.driver.get(Config.testing_page)


## Test hours.
#  Hours should be real value. Maximal deviation should be 1 (change hour during command execution or another timezone).
def test_hours_minutes_seconds(browser):
    js_time = browser.driver.execute_script("let d = new Date();"
                                            "return d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds()")
    p_now = datetime.now()
    p_time = p_now.hour * 60 * 60 + p_now.minute * 60 + p_now.second
    # Values do not have to be strictly equal.
    # A deviation of less than 4 is tolerated.
    assert abs(js_time - p_time) < 4


## Test miliseconds.
def test_milliseconds(browser, expected):
    is_millisecond_rounded = True
    # Make 3 measurement.
    for _ in range(3):
        # Wait a while to value of time will be changed.
        time.sleep(random.randint(1, 3))
        time_in_milliseconds = browser.driver.execute_script("let d = new Date(); return d.getTime()")
        if expected.time['accuracy'] == 'EXACTLY':
            if int(time_in_milliseconds / 10) * 10 != time_in_milliseconds:
                # Time was not rounded. At least one of three measurement has to say value was not rounded.
                is_millisecond_rounded = False
        else:
            assert is_in_accuracy(time_in_milliseconds, int(expected.time['accuracy'] * 1000))

    if expected.time['accuracy'] == 'EXACTLY':
        # At least one of three measurement has to say value was not rounded.
        # is_millisecond_rounded should be false if EXACTLY value is required.
        assert not is_millisecond_rounded
