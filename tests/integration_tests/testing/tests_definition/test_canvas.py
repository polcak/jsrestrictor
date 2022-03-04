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

from values_getters import is_canvas_spoofed


## Test canvas - if canvas is spoofed: Reading from canvas returns white image.
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
