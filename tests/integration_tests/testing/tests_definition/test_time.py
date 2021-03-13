#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
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
from datetime import datetime
import time
import random

from math_operations import is_in_accuracy
from configuration import get_config
from values_getters import get_time_toString


## Setup method - it is run before time tests execution starts.
#
#  This setup method open testing page - it is necessary in Mozilla Firefox.
#  In Mozilla Firefox: Time is spoofed only when page is opened.
@pytest.fixture(scope='module', autouse=True)
def load_test_page(browser):
    browser.driver.get(get_config("testing_page"))


## Setup method - it is run before time tests execution starts.
#
#  This setup method initialize variable time_toString that contains Date methods.toString() and
#  this variable is provided to time_toString test and the methods.toString() in the variable are compared with real values.
@pytest.fixture(scope='module', autouse=True)
def time_toString(browser):
	return get_time_toString(browser.driver)


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


## Test Date methods.toString(). They should be always unchanged by JSR.
def test_time_toString(browser, time_toString):
    for method in time_toString:
        assert time_toString[method] == browser.real.time_toString[method]
