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
# \bug Known bug: JShelter, Firefox with activated array protections: Uncaught TypeError: Crypto.getRandomValues: Argument 1 does not implement interface ArrayBufferView.
# Bug is caused by passing a proxy object to the function, but the actual object is expected (not the proxy).
def test_crypto_getRandomValues(browser):
    for array_type in ["Uint32Array", "Float32Array", "Float64Array", 'BigInt64Array', 'BigUint64Array']:
        browser.driver.execute_script("""
        document.getElementsByTagName("script")[0].innerText = '\
            var array = new %s(4);\
            window.crypto.getRandomValues(array);\
            \
            var ul = document.getElementById("getRandomValues");\
            ul.replaceChildren();\
            \
            for (var i = 0; i < array.length; i++) {\
                var li = document.createElement("li");\
                li.appendChild(document.createTextNode(array[i]));\
                ul.appendChild(li);\
            }';\
        """ % array_type)
        ul = browser.driver.find_element(By.ID,"getRandomValues")
        nums = ul.text.split()
        if len(nums) > 0:
            assert nums[0] != nums[1] or nums[0] != nums[2] or  nums[0] != nums[3] # It is highly unlikely that all three numbers are the same
            assert nums[1] != nums[0] or nums[1] != nums[2] or  nums[1] != nums[3] # It is highly unlikely that all three numbers are the same
            assert nums[2] != nums[0] or nums[2] != nums[1] or  nums[2] != nums[3] # It is highly unlikely that all three numbers are the same
            assert nums[3] != nums[0] or nums[3] != nums[1] or  nums[3] != nums[2] # It is highly unlikely that all three numbers are the same
        else:
            pytest.fail("No random value generated (%s). Probable JavaScript error: Crypto.getRandomValues: Argument 1 does not implement interface ArrayBufferView." % array_type)
