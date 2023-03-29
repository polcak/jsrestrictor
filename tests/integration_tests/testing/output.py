#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
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

from web_browser_type import BrowserType


## Print outputs during testing - called from start.py.


def print_testing_header(browser_type, jsr_level):
    extra_dash = ''
    if browser_type == BrowserType.CHROME:
        extra_dash = '-'
    print()
    print("--------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------")
    print("---------------  TESTING <" + browser_type.name + ", JShelter level = " + str(jsr_level) + "> STARTED   --------------" + extra_dash)
    print()


def print_testing_footer(browser_type, jsr_level):
    extra_dash = ''
    if browser_type == BrowserType.CHROME:
        extra_dash = '-'
    print()
    print("---------------  TESTING <" + browser_type.name + ", JShelter level = " + str(jsr_level) + "> FINISHED  --------------" + extra_dash)
    print("--------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------")
    print()
