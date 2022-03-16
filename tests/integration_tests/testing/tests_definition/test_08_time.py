#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2022  Martin Bednar
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
from datetime import datetime
import time
import random

from math_operations import is_in_accuracy
from configuration import get_config


## Setup method - it is run before time tests execution starts.
#
#  This setup method open testing page - it is necessary in Mozilla Firefox.
#  In Mozilla Firefox: Time is spoofed only when page is opened.
@pytest.fixture(scope='module', autouse=True)
def load_test_page(browser):
    browser.driver.get(get_config("testing_page"))


## Test hours.
#  Hours should be real value. Maximal deviation should be 1 (change hour during command execution or another timezone).
def test_hours_minutes_seconds(browser):
    js_time = browser.driver.execute_script("let d = new Date();"
                                            "return d.getHours()*60*60 + d.getMinutes()*60 + d.getSeconds()")
    p_now = datetime.now()
    p_time = p_now.hour * 60 * 60 + p_now.minute * 60 + p_now.second
    # Values do not have to be strictly equal.
    # A deviation of less than or equal 1 is tolerated.
    assert abs(js_time - p_time) <= 1


## Test time accuracy.
def test_accuracy(browser, expected):
    #Suppose time is rounded.
    is_time_rounded = True
    # Make 3 measurement.
    for _ in range(3):
        # Wait a while to value of time will be changed.
        time.sleep(random.randint(1, 3))
        miliseconds = browser.driver.execute_script("let d = new Date();"
                                                    "return d.getMilliseconds()")
        if expected.time['accuracy'] == 'EXACTLY':
            if int(miliseconds / 10) * 10 != miliseconds:
                # miliseconds was not rounded. At least one of three measurement has to say value was not rounded.
                is_time_rounded = False
        else:
            assert is_in_accuracy(miliseconds, expected.time['accuracy'])
 
    if expected.time['accuracy'] == 'EXACTLY':
        # At least one of three measurement has to say value was not rounded.
        # is_time_rounded should be false if EXACTLY value is required.
        assert not is_time_rounded
