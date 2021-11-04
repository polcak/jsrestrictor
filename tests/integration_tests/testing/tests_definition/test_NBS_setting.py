#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
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
from time import sleep


def switch_NBS_setting(browser):
    browser.driver.get(browser._jsr_options_page.replace("/options.html", "/popup.html"))
    browser.driver.find_elements(By.CLASS_NAME, 'switch')[0].click()


def get_NBS_setting(browser):
    browser.driver.get(browser._jsr_options_page.replace("/options.html", "/popup.html"))
    browser.driver.find_elements(By.CLASS_NAME, 'switch')[0]
    return(browser.driver.execute_script("return window.getComputedStyle(document.querySelector('.switch .slider'),':before').getPropertyValue('content')"))


## Test turnning NBS off in popup.
## Sleep 0.5 second to changes take effect.
def test_switching_NBS(browser):
    NBS_setting_values = ['"YES"', '"NO"']
    
    original_setting = get_NBS_setting(browser)
    original_setting_index = NBS_setting_values.index(original_setting)
    sleep(0.5)
    
    # Range is saing how many times should NBS be switched.
    for i in range(4):
        switch_NBS_setting(browser)
        sleep(0.5)    
        assert get_NBS_setting(browser) == NBS_setting_values[(i + 1 + original_setting_index) % 2]
    
    # Return original value
    if get_NBS_setting(browser) != original_setting:
        switch_NBS_setting(browser)
