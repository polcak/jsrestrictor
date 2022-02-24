#
#  JShelter is a browser extension which increases level
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

from time import sleep

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By

from web_browser_type import BrowserType
from configuration import Config


## Find URL of JShelter option page after JShelter was installed to browser.
def find_options_jsr_page_url(driver, browser_type):
    sleep(1)
    # KNOWN ISSUE: Tab in browser is sometimes not switched by this command.
    # And it leads to error and stopping execution of script. It is driver's issue.
    # Workaround for this issue is wait a while before and after tabs switching.
    driver.switch_to.window(driver.window_handles[-1])
    sleep(1)
    if browser_type == BrowserType.CHROME:
        driver.get('chrome://system/')
        WebDriverWait(driver, 60).until(
            ec.presence_of_element_located((By.ID, 'extensions-value-btn'))
        )
        driver.find_element_by_id('extensions-value-btn').click()
        for elem in driver.find_element_by_id('extensions-value').text.splitlines():
            if 'JavaScript Restrictor' in elem:
                return "chrome-extension://" + elem.split(':')[0][:-1] + "/options.html"


## Set JShelter level in web browser.
def set_jsr_level(driver, browser_type, level):
    options_page = find_options_jsr_page_url(driver, browser_type)
    driver.get(options_page)
    driver.find_element_by_id('level-' + str(level)).click()


## Create web browser driver and start web browser.
def create_driver(browser_type, with_jsr, jsr_level):
    if browser_type == BrowserType.CHROME:
        d = DesiredCapabilities.CHROME
        d['browserName'] = 'chrome'
        d['javascriptEnabled'] = True
        d['loggingPreferences'] = {'browser': 'ALL'}

    o = Options()
    o.add_argument("--start-maximized")
    if with_jsr:
        if browser_type == BrowserType.CHROME:
            o.add_extension(Config.jsr_extension_for_chrome_path)

    driver = webdriver.Remote(
        command_executor='http://' + Config.grid_server_ip_address + ':4444/wd/hub',
        desired_capabilities=d,
        options=o)

    if with_jsr:
        set_jsr_level(driver, browser_type, jsr_level)

    return driver
