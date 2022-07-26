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

import pytest

from web_browser_shared import get_shared_browser
import values_expected


## This module is automatically called by pytest before start executing tests.
#
#  It contains setup method that are called before tests executing.
#  Here is defined variables browser and expected that are given to tests as a parameter.


## Setup method. browser provide shared browser to all tests.
@pytest.fixture(scope="session", autouse=True)
def browser():
    return get_shared_browser()

## Setup method: expected provide expected values to all tests.
#
#  expected values are selected based on testing jsr_level.
@pytest.fixture(scope="session", autouse=True)
def expected():
    if get_shared_browser().jsr_level == 0:
        return values_expected.level0
    elif get_shared_browser().jsr_level == 1:
        return values_expected.level1
    elif get_shared_browser().jsr_level == 2:
        return values_expected.level2
    elif get_shared_browser().jsr_level == 3:
        return values_expected.level3
    elif get_shared_browser().jsr_level == "Experiment":
        return values_expected.level3
    else:
        return values_expected.level3
