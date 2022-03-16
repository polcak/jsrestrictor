#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2022  Martin Bednar
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
from selenium.webdriver.common.by import By

from configuration import get_config

## Setup method - it is run before time tests execution starts.
#
#  This setup method open testing page.
@pytest.fixture(scope='module', autouse=True)
def load_test_page(browser):
    browser.driver.get(get_config("testing_page"))


## Test crypto.getRandomValues.
#  Random values should be generated. No error in Javascript runtime should appear.
# \bug Known bug: JShelter, Firefox, level 3: Uncaught TypeError: Crypto.getRandomValues: Argument 1 does not implement interface ArrayBufferView.
# Bug is caused by passing a proxy object to the function, but the actual object is expected (not the proxy).
@pytest.mark.xfail
def test_crypto_getRandomValues(browser):
    ul = browser.driver.find_element(By.ID,"getRandomValues")
    if len(ul.text) > 0:
        items = ul.find_elements(By.TAG_NAME,"li")
        assert len(items) > 0
    else:
        pytest.fail("No random value generated. Probable JavaScript error: Crypto.getRandomValues: Argument 1 does not implement interface ArrayBufferView.")
