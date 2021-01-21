#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from enum import Enum


## Types of browser in which tests can be run.
class BrowserType(Enum):
    FIREFOX = 1
    CHROME = 2
