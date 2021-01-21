#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
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


## Find URL of JSR option page after JSR was installed to browser.
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


## Set JSR level in web browser.
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
