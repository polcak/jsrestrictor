#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from web_browser_type import BrowserType


## Print outputs during testing - called from start.py.


def print_testing_header(browser_type, jsr_level):
    extra_dash = ''
    if browser_type == BrowserType.CHROME:
        extra_dash = '-'
    print()
    print("--------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------")
    print("---------------  TESTING <" + browser_type.name + ", JSR level = " + str(jsr_level) + "> STARTED   --------------" + extra_dash)
    print()


def print_testing_footer(browser_type, jsr_level):
    extra_dash = ''
    if browser_type == BrowserType.CHROME:
        extra_dash = '-'
    print()
    print("---------------  TESTING <" + browser_type.name + ", JSR level = " + str(jsr_level) + "> FINISHED  --------------" + extra_dash)
    print("--------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------")
    print()
