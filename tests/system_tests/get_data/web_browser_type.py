#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from enum import Enum


## Types of browsers in which tests can be perform.
class BrowserType(Enum):
    def __str__(self):
        return str(self.name).title()

    CHROME = 1
