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

from values_getters import get_referrer


## Setup method - it is run before referrer test execution starts.
#
#  This setup method initialize variable referrer that contains current data about referrer and
#  this variable is provided to referrer test and value in referrer variable is compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def referrer(browser):
    return get_referrer(browser.driver)


## Test referrer - where the page was navigated from.
def test_referrer(browser, referrer, expected):
    if expected.referrer == 'REAL VALUE':
        assert referrer == browser.real.referrer
    else:
        assert referrer == expected.referrer
