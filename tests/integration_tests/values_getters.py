from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec

from configuration import Config


## Module contains getters for values from browser.
#
#  Javascript is called and returned values are processed and returned.


## Get geolocation data through JST test page.
#
#  Geolocation data is obtained asynchronously. Interaction with page is needed.
#  We need element on page where geolocation data is shown after its loading.
#  Function waits maximally 10 seconds for loading geolocation data.
def get_position(driver):
    driver.get(Config.testing_page)
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
#  In this case, webpage FIT VUT is opened through Google search and referrer on page FIT VUT is returned.
def get_referrer(driver):
    driver.get('https://www.google.com/')
    search_input = driver.find_element_by_name('q')
    search_input.send_keys("FIT VUT")
    search_input.submit()
    WebDriverWait(driver, 10).until(
        ec.presence_of_element_located((By.ID, 'res'))
    )
    driver.find_elements_by_xpath('//a[@href="https://www.fit.vut.cz/"]')[0].click()
    WebDriverWait(driver, 10).until(
        ec.presence_of_element_located((By.ID, 'main'))
    )
    return driver.execute_script("return document.referrer")


## Check if canvas is spoofed.
#
#  Draw 3 elements to canvas and then get canvas data and test if data is spoofed.
#  Spoofed canvas means that canvas is represented by array with only 0 values.
def is_canvas_spoofed(driver):
    driver.get(Config.testing_page)
    driver.find_element_by_xpath("//button[text()='Add line to canvas']").click()
    driver.find_element_by_xpath("//button[text()='Add circle to canvas']").click()
    driver.find_element_by_xpath("//button[text()='Add text to canvas']").click()
    driver.find_element_by_xpath("//button[text()='Get data and show image in canvas frame']").click()
    return driver.execute_script("var canvas = document.getElementById('canvas1'); return !canvas.getContext('2d')"
                                 ".getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 20)")