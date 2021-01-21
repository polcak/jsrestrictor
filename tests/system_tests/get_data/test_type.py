#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from enum import Enum


## Types of tests in which tests can be perform.
class TestType(Enum):
    LOGS = 1
    SCREENSHOTS = 2
