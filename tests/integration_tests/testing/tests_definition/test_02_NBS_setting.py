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
from time import sleep
from web_browser_type import BrowserType


def switch_NBS_setting(browser):
    browser.driver.get(browser._jsr_options_page.replace("/options.html", "/popup.html"))
    sleep(1)
    browser.driver.find_elements(By.CLASS_NAME, 'slider')[1].click()
    sleep(1)


def get_NBS_setting(browser):
    browser.driver.get(browser._jsr_options_page.replace("/options.html", "/popup.html"))
    sleep(2)
    return(browser.driver.execute_script("return window.getComputedStyle(document.querySelector('#nbs_whitelist .switch_wrapper .switch .slider'),':before').getPropertyValue('content')"))


## Test turnning NBS off in popup.
## Sleep 0.5 second to changes take effect.
def test_switching_NBS(browser):
    if browser.type == BrowserType.CHROME:
        # Not able to test NBS switch in Google Chrome.
        # Can not show popup.html in Chrome. Popup.html is not accesible and testable.
        return
    NBS_setting_values = ['"ON"', '"OFF"']
    
    original_setting = get_NBS_setting(browser)
    original_setting_index = NBS_setting_values.index(original_setting)
    
    # Range is saing how many times should NBS be switched.
    for i in range(4):
        switch_NBS_setting(browser)
        assert get_NBS_setting(browser) == NBS_setting_values[(i + 1 + original_setting_index) % 2]
    
    # Return original value
    if get_NBS_setting(browser) != original_setting:
        switch_NBS_setting(browser)
