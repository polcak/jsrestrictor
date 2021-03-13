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
##
## This getter return "ERROR" in Google Chrome on JSR level 3 because of known bug:
## selenium.common.exceptions.JavascriptException: Message: javascript error:
## Failed to execute 'getRandomValues' on 'Crypto': parameter 1 is not of type 'ArrayBufferView'.
def is_canvas_spoofed(driver):
    try:
        driver.get(get_config("testing_page"))
        driver.find_element_by_xpath("//button[text()='Add line to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Add circle to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Add text to canvas']").click()
        driver.find_element_by_xpath("//button[text()='Get data and show image in canvas frame']").click()
        is_spoofed = driver.execute_script("var canvas = document.getElementById('canvas1'); return !canvas.getContext('2d')"
                                     ".getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 255)")
    except:
        return "ERROR"
    else:
        return is_spoofed


## Get Date methods.toString().
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_time_toString(driver):
    output = {}
    output['Date.toString()'] = driver.execute_script("return Date.toString()")
    output['Date.now.toString()'] = driver.execute_script("return Date.now.toString()")
    output['Date.parse.toString()'] = driver.execute_script("return Date.parse.toString()")
    output['Date.UTC.toString()'] = driver.execute_script("return Date.UTC.toString()")
    output['Date.prototype.getDate.toString()'] = driver.execute_script("let d = new Date(); return d.getDate.toString()")
    output['Date.prototype.getDay.toString()'] = driver.execute_script("let d = new Date(); return d.getDay.toString()")
    output['Date.prototype.getFullYear.toString()'] = driver.execute_script("let d = new Date(); return d.getFullYear.toString()")
    output['Date.prototype.getHours.toString()'] = driver.execute_script("let d = new Date(); return d.getHours.toString()")
    output['Date.prototype.getMilliseconds.toString()'] = driver.execute_script("let d = new Date(); return d.getMilliseconds.toString()")
    output['Date.prototype.getMinutes.toString()'] = driver.execute_script("let d = new Date(); return d.getMinutes.toString()")
    output['Date.prototype.getMonth.toString()'] = driver.execute_script("let d = new Date(); return d.getMonth.toString()")
    output['Date.prototype.getSeconds.toString()'] = driver.execute_script("let d = new Date(); return d.getSeconds.toString()")
    output['Date.prototype.getTime.toString()'] = driver.execute_script("let d = new Date(); return d.getTime.toString()")
    output['Date.prototype.getTimezoneOffset.toString()'] = driver.execute_script("let d = new Date(); return d.getTimezoneOffset.toString()")
    output['Date.prototype.getUTCDate.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCDate.toString()")
    output['Date.prototype.getUTCDay.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCDay.toString()")
    output['Date.prototype.getUTCFullYear.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCFullYear.toString()")
    output['Date.prototype.getUTCHours.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCHours.toString()")
    output['Date.prototype.getUTCMilliseconds.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCMilliseconds.toString()")
    output['Date.prototype.getUTCMinutes.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCMinutes.toString()")
    output['Date.prototype.getUTCMonth.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCMonth.toString()")
    output['Date.prototype.getUTCSeconds.toString()'] = driver.execute_script("let d = new Date(); return d.getUTCSeconds.toString()")
    output['Date.prototype.getYear.toString()'] = driver.execute_script("let d = new Date(); return d.getYear.toString()")
    output['Date.prototype.setDate.toString()'] = driver.execute_script("let d = new Date(); return d.setDate.toString()")
    output['Date.prototype.setFullYear.toString()'] = driver.execute_script("let d = new Date(); return d.setFullYear.toString()")
    output['Date.prototype.setHours.toString()'] = driver.execute_script("let d = new Date(); return d.setHours.toString()")
    output['Date.prototype.setMilliseconds.toString()'] = driver.execute_script("let d = new Date(); return d.setMilliseconds.toString()")
    output['Date.prototype.setMinutes.toString()'] = driver.execute_script("let d = new Date(); return d.setMinutes.toString()")
    output['Date.prototype.setMonth.toString()'] = driver.execute_script("let d = new Date(); return d.setMonth.toString()")
    output['Date.prototype.setSeconds.toString()'] = driver.execute_script("let d = new Date(); return d.setSeconds.toString()")
    output['Date.prototype.setTime.toString()'] = driver.execute_script("let d = new Date(); return d.setTime.toString()")
    output['Date.prototype.setUTCDate.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCDate.toString()")
    output['Date.prototype.setUTCFullYear.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCFullYear.toString()")
    output['Date.prototype.setUTCHours.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCHours.toString()")
    output['Date.prototype.setUTCMilliseconds.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCMilliseconds.toString()")
    output['Date.prototype.setUTCMinutes.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCMinutes.toString()")
    output['Date.prototype.setUTCMonth.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCMonth.toString()")
    output['Date.prototype.setUTCSeconds.toString()'] = driver.execute_script("let d = new Date(); return d.setUTCSeconds.toString()")
    output['Date.prototype.setYear.toString()'] = driver.execute_script("let d = new Date(); return d.setYear.toString()")
    output['Date.prototype.toDateString.toString()'] = driver.execute_script("let d = new Date(); return d.toDateString.toString()")
    output['Date.prototype.toISOString.toString()'] = driver.execute_script("let d = new Date(); return d.toISOString.toString()")
    output['Date.prototype.toJSON.toString()'] = driver.execute_script("let d = new Date(); return d.toJSON.toString()")
    output['Date.prototype.toGMTString.toString()'] = driver.execute_script("let d = new Date(); return d.toGMTString.toString()")
    output['Date.prototype.toLocaleDateString.toString()'] = driver.execute_script("let d = new Date(); return d.toLocaleDateString.toString()")
    output['Date.prototype.toLocaleString.toString()'] = driver.execute_script("let d = new Date(); return d.toLocaleString.toString()")
    output['Date.prototype.toString.toString()'] = driver.execute_script("let d = new Date(); return d.toString.toString()")
    output['Date.prototype.toTimeString.toString()'] = driver.execute_script("let d = new Date(); return d.toTimeString.toString()")
    output['Date.prototype.toUTCString.toString()'] = driver.execute_script("let d = new Date(); return d.toUTCString.toString()")
    output['Date.prototype.valueOf.toString()'] = driver.execute_script("let d = new Date(); return d.valueOf.toString()")
    return output


## Get performance methods.toString().
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_performance_toString(driver):
    output = {}
    output['performance.now.toString()'] = driver.execute_script("return performance.now.toString()")
    output['performance.clearMarks.toString()'] = driver.execute_script("return performance.clearMarks.toString()")
    output['performance.clearMeasures.toString()'] = driver.execute_script("return performance.clearMeasures.toString()")
    output['performance.clearResourceTimings.toString()'] = driver.execute_script("return performance.clearResourceTimings.toString()")
    output['performance.getEntries.toString()'] = driver.execute_script("return performance.getEntries.toString()")
    output['performance.getEntriesByName.toString()'] = driver.execute_script("return performance.getEntriesByName.toString()")
    output['performance.getEntriesByType.toString()'] = driver.execute_script("return performance.getEntriesByType.toString()")
    output['performance.mark.toString()'] = driver.execute_script("return performance.mark.toString()")
    output['performance.measure.toString()'] = driver.execute_script("return performance.measure.toString()")
    output['performance.setResourceTimingBufferSize.toString()'] = driver.execute_script("return performance.setResourceTimingBufferSize.toString()")
    output['performance.toJSON.toString()'] = driver.execute_script("return performance.toJSON.toString()")
    return output


## Get geo methods.toString().
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_gps_toString(driver):
    output = {}
    output['navigator.geolocation.getCurrentPosition.toString()'] = driver.execute_script("return navigator.geolocation.getCurrentPosition.toString()")
    output['navigator.geolocation.watchPosition.toString()'] = driver.execute_script("return navigator.geolocation.watchPosition.toString()")
    output['navigator.geolocation.clearWatch.toString()'] = driver.execute_script("return navigator.geolocation.clearWatch.toString()")
    return output


## Get canvas.getContext.toString().
#
#  Only executing javascript and geting returned values. Testing page with canvas is needed.
def get_canvas_toString(driver):
    driver.get(get_config("testing_page"))
    output = {}
    output['canvas.getContext.toString()'] = driver.execute_script("var canvas = document.getElementById('canvas1'); return canvas.getContext.toString()")
    return output
