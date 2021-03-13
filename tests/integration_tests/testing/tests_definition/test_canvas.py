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

from values_getters import is_canvas_spoofed, get_canvas_toString


## Setup method - it is run before canvas tests execution starts.
#
#  This setup method initialize variable canvas_toString that contains method canvas.getContext.toString() and
#  this variable is provided to canvas_toString test and the method canvas.getContext.toString() in the variable is compared with real value.
@pytest.fixture(scope='module', autouse=True)
def canvas_toString(browser):
	return get_canvas_toString(browser.driver)


## Test canvas - if canvas is spoofed: Reading from canvas returns white image.
##
## This test fails in Google Chrome on JSR level 3 - expected failure because of known bug:
## selenium.common.exceptions.JavascriptException: Message: javascript error:
## Failed to execute 'getRandomValues' on 'Crypto': parameter 1 is not of type 'ArrayBufferView'.
def test_canvas(browser, expected):
    is_spoofed = is_canvas_spoofed(browser.driver)
    if is_spoofed == "ERROR":
        print("\nCan not read Canvas data.")
        assert False
    else:
        if expected.protect_canvas:
            assert is_spoofed
        else:
            assert not is_spoofed


## Test method canvas.getContext.toString(). It should be always unchanged by JSR.
def test_canvas_toString(browser, canvas_toString):
    for method in canvas_toString:
        assert canvas_toString[method] == browser.real.canvas_toString[method]
