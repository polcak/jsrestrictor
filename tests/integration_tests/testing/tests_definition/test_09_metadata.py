#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
#  Copyright (C) 2026  Libor Polčák
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

from values_getters import get_methods_metadata


## Setup method - it is run before toString tests execution starts.
#
#  This setup method initialize variable methods_toString that contains methods.toString() and
#  this variable is provided to methods_toString test and the methods.toString() in the variable are compared with real values.
@pytest.fixture(scope='module', autouse=True)
def methods_metadata(browser):
    return get_methods_metadata(browser.driver)


## Test methods.toString(). They should be always unchanged by JShelter.
def test_methods_toString(browser, methods_metadata):
    methods_toString = methods_metadata["toString"]
    for method in methods_toString:
        assert methods_toString[method] == browser.real.methods_metadata["toString"][method]

## Test methods.toLocaleString(). They should be always unchanged by JShelter.
def test_methods_toLocaleString(browser, methods_metadata):
    current = methods_metadata["toLocaleString"]
    for method in current:
        assert current[method] == browser.real.methods_metadata["toLocaleString"][method]

## Test methods.name. They should be always unchanged by JShelter.
def test_methods_name(browser, methods_metadata):
    current = methods_metadata["name"]
    for method in current:
        assert current[method] == browser.real.methods_metadata["name"][method]

## Test methods.length. They should be always unchanged by JShelter.
def test_methods_length(browser, methods_metadata):
    current = methods_metadata["length"]
    for method in current:
        assert current[method] == browser.real.methods_metadata["length"][method]
