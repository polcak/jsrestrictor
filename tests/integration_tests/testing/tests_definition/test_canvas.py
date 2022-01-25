#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
#  Copyright (C) 2021  Matus Svancar
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

from values_getters import is_canvas_spoofed
from values_getters import get_dataURL_canvas
from values_getters import get_imageData_canvas
from values_getters import get_blob_canvas
from values_getters import get_point_in_path
from values_getters import get_point_in_stroke


## Test canvas - if canvas is spoofed: Reading from canvas returns white image.
##
## This test fails in Google Chrome on JShelter level 3 - expected failure because of known bug:
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

def test_getImageData(browser, expected):
    image = get_imageData_canvas(browser.driver,"canvasx")
    if image == "ERROR":
        print("\n getImageData error.")
        assert False
    else:
        if expected.canvas_imageData == 'SPOOF VALUE':
            assert image != browser.real.canvas_imageData
        else:
            assert image == browser.real.canvas_imageData


def test_to_data_URL(browser, expected):
    image = get_dataURL_canvas(browser.driver,"canvasx")
    if image == "ERROR":
        print("\n toDataURL error.")
        assert False
    else:
        if expected.canvas_dataURL == 'SPOOF VALUE':
            assert image != browser.real.canvas_dataURL
        else:
            assert image == browser.real.canvas_dataURL


def test_to_blob(browser, expected):
    image = get_blob_canvas(browser.driver,"canvasx")
    if image == "ERROR":
        print("\n toBlob error.")
        assert False
    else:
        if expected.canvas_blob == 'SPOOF VALUE':
            assert image != browser.real.canvas_blob
        else:
            assert image == browser.real.canvas_blob

def test_is_point_in_path(browser, expected):
    point = get_point_in_path(browser.driver,"canvas4", (expected.canvas_point_path == 'FALSE VALUE'))
    if point == "ERROR":
        print("\n isPointInPath error.")
        assert False
    else:
        if expected.canvas_point_path in {'SPOOF VALUE','FALSE VALUE'}:
            assert point == False
        else:
            assert point == True

def test_is_point_in_stroke(browser, expected):
    point = get_point_in_stroke(browser.driver,"canvas5", (expected.canvas_point_stroke == 'FALSE VALUE'))
    if point == "ERROR":
        print("\n isPointInStroke error.")
        assert False
    else:
        if expected.canvas_point_stroke in {'SPOOF VALUE','FALSE VALUE'} :
            assert point == False
        else:
            assert point == True
