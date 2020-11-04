#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
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

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep

from configuration import get_config


## Module contains getters for values from browser.
#
#  Javascript is called and returned values are processed and returned.


## Get geolocation data through JST test page.
#
#  Geolocation data is obtained asynchronously. Interaction with page is needed.
#  We need element on page where geolocation data is shown after its loading.
#  Function waits maximally 10 seconds for loading geolocation data.
def get_position(driver):
    driver.get(get_config("testing_page"))
    driver.find_element_by_xpath("//button[text()='Show GPS data']").click()
    WebDriverWait(driver, 10).until(
        ec.presence_of_element_located((By.ID, 'mapnavi'))
    )
    location = driver.find_element_by_id('placeToWriteGPSDetails').text
    location = location.replace(" ", "").split()
    position = {}
    for property in location:
        property = property.split(':')
        position[property[0].lower()] = property[1]
    return position


## Get navigator data.
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_navigator(driver):
    navigator = {'userAgent': driver.execute_script("return window.navigator.userAgent"),
                 'appVersion': driver.execute_script("return window.navigator.appVersion"),
                 'platform': driver.execute_script("return window.navigator.platform"),
                 'vendor': driver.execute_script("return window.navigator.vendor"),
                 'language': driver.execute_script("return window.navigator.language"),
                 'languages': driver.execute_script("return window.navigator.languages"),
                 'cookieEnabled': driver.execute_script("return window.navigator.cookieEnabled"),
                 'doNotTrack': driver.execute_script("return window.navigator.doNotTrack"),
                 'oscpu': driver.execute_script("return window.navigator.oscpu")}
    return navigator


## Get device data.
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_device(driver):
    device = {'deviceMemory': driver.execute_script("return window.navigator.deviceMemory"),
              'hardwareConcurrency': driver.execute_script("return window.navigator.hardwareConcurrency")}
    return device


## Get referrer - where the page was navigated from.
#
#  In this case, webpage amiunique.org is opened through test page and referrer on page amiunique.org is returned.
def get_referrer(driver):
    driver.get(get_config("testing_page"))
    actions = ActionChains(driver)
    actions.send_keys(Keys.TAB)
    actions.perform()
    actions.perform()
    actions = ActionChains(driver)
    actions.send_keys(Keys.RETURN)
    actions.perform()
    sleep(4)
    return driver.execute_script("return document.referrer")


## Check if canvas is spoofed.
#
#  Draw 3 elements to canvas and then get canvas data and test if data is spoofed.
#  Spoofed canvas means that canvas is represented by array with only 0 values.
def is_canvas_spoofed(driver):
    try:
        driver.get(get_config("testing_page"))
        driver.find_element_by_xpath("//button[text()='Add line to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Add circle to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Add text to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Get data and show image in canvas frame']").click()
        is_spoofed = driver.execute_script("var canvas = document.getElementById('canvas1'); return !canvas.getContext('2d')"
                                     ".getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)")
    except:
        return "ERROR"
    else:
        return is_spoofed