#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
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
