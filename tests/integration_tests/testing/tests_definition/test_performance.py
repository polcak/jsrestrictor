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
import time
import random

from math_operations import is_in_accuracy
from values_getters import get_performance_toString


## Setup method - it is run before performance tests execution starts.
#
#  This setup method initialize variable performance_toString that contains performance methods.toString() and
#  this variable is provided to performance_toString test and the methods.toString() in the variable are compared with real values.
@pytest.fixture(scope='module', autouse=True)
def performance_toString(browser):
	return get_performance_toString(browser.driver)


## Test performance.
def test_performance(browser, expected):
    is_performance_rounded = True
    # Make 3 measurement.
    for _ in range(3):
        # Wait a while to value of performance will be changed.
        time.sleep(random.randint(1, 3))
        performance = browser.driver.execute_script("return window.performance.now()")
        if expected.performance['accuracy'] == 'EXACTLY':
            if int(performance / 10) * 10 != performance:
                # Performance was not rounded. At least one of three measurement has to say value was not rounded.
                is_performance_rounded = False
        else:
            assert is_in_accuracy(performance, expected.performance['accuracy'])

    if expected.performance['accuracy'] == 'EXACTLY':
        # At least one of three measurement has to say value was not rounded.
        # is_performance_rounded should be false if EXACTLY value is required.
        assert not is_performance_rounded


## Test performance methods.toString(). They should be always unchanged by JSR.
def test_performance_toString(browser, performance_toString):
    for method in performance_toString:
        assert performance_toString[method] == browser.real.performance_toString[method]
