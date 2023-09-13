#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Matus Svancar
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


## Get geolocation data through JShelter test page.
#
#  Geolocation data is obtained asynchronously. Interaction with page is needed.
#  We need element on page where geolocation data is shown after its loading.
#  Function waits maximally 10 seconds for loading geolocation data.
def get_position(driver):
    position = {}
    driver.get(get_config("testing_page"))
    driver.find_element(By.XPATH, "//button[text()='Show GPS data']").click()
    try:
        WebDriverWait(driver, 10).until(
            ec.presence_of_element_located((By.ID, 'mapnavi'))
        )
        location = driver.find_element(By.ID, 'placeToWriteGPSDetails').text
        location = location.replace(" ", "").split()
        for property in location:
            property = property.split(':')
            position[property[0].lower()] = property[1]
    except:
        # return empty position in case of error (like Chromium not supporting the API)
        position['timestamp'] = "null"
        position['accuracy'] = "null"
        position['altitude'] = "null"
        position['altitudeaccurac'] = "null"
        position['heading'] = "null"
        position['latitude'] = "null"
        position['longitude'] = "null"
        position['speed'] = "null"
        position['invalid'] = True
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
                 'oscpu': driver.execute_script("return window.navigator.oscpu"),
                 'plugins': driver.execute_script("return Array.from(navigator.plugins).map(({filename,name,description}) => ({filename,name,description}));"),
                 'mimeTypes': driver.execute_script("return Array.from(navigator.mimeTypes).map(a => ({'type':a.type, 'description':a.description, 'suffixes':a.suffixes, 'enabledPlugin':a.enabledPlugin.name}));")}
    return navigator


## Get device data.
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_device(driver):
    device = {'deviceMemory': driver.execute_script("return window.navigator.deviceMemory"),
              'hardwareConcurrency': driver.execute_script("return window.navigator.hardwareConcurrency")}
    return device


## Get IO devices.
#
#  Only executing javascript and geting returned values. No support page is needed.
def get_IOdevices(driver):
    return driver.execute_async_script("""
        var callback = arguments[arguments.length - 1];

        navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                callback(devices);
            });

        /* Set timeout for getting IO devices. If no timeout is set, driver would be waiting forever. */
        setTimeout(function(){
          callback("ERROR");
        }, 5000);
    """)


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
## This getter return "ERROR" in Google Chrome on JShelter level 3 because of known bug:
## selenium.common.exceptions.JavascriptException: Message: javascript error:
## Failed to execute 'getRandomValues' on 'Crypto': parameter 1 is not of type 'ArrayBufferView'.
def is_canvas_spoofed(driver):
    try:
        driver.get(get_config("testing_page"))
        driver.find_element(By.XPATH, "//button[text()='Add line to canvas']").click()
        driver.find_element(By.XPATH, "//button[text()='Add circle to canvas']").click()
        driver.find_element(By.XPATH, "//button[text()='Add text to canvas']").click()
        driver.find_element(By.XPATH, "//button[text()='Get data and show image in canvas frame']").click()
        is_spoofed = driver.execute_script("var canvas = document.getElementById('canvas1'); return !canvas.getContext('2d')"
                                     ".getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 255)")
    except:
        return "ERROR"
    else:
        return is_spoofed

## returns output of CanvasRenderingContext2D.getImageData where name is id of chosen canvas
def get_imageData_canvas(driver, name):
    try:
        driver.get(get_config("testing_page"))
        sleep(1)
        img = driver.execute_script("var canvas = document.getElementById('"+name+"'); return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data")
    except:
        return "ERROR"
    else:
        return img

## returns output of HTMLCanvasElement.toDataURL where name is id of chosen canvas
def get_dataURL_canvas(driver, name):
    try:
        driver.get(get_config("testing_page"))
        sleep(1)
        img = driver.execute_script("var canvas = document.getElementById('"+name+"'); return canvas.toDataURL()")
    except:
        return "ERROR"
    else:
        return img

## returns output of HTMLCanvasElement.toBlob where name is id of chosen canvas
def get_blob_canvas(driver, name):
    try:
        driver.get(get_config("testing_page"))
        sleep(1)
        img = driver.execute_script("var canvas = document.getElementById('"+name+"'); return new Promise(function(resolve, reject) { canvas.toBlob(function(blob) { resolve(blob.arrayBuffer().then(a => Array.from(new Int8Array(a))))})});")
    except:
        return "ERROR"
    else:
        return img

## returns output of HTMLCanvasElement.toDataURL where name is id of chosen canvas
def get_point_in_path(driver, name, alwaysFalse):
    try:
        driver.get(get_config("testing_page"))
        sleep(0.3)
        op = "||" if alwaysFalse else "&&"
        initial = "false" if alwaysFalse else "true"
        img = driver.execute_script("var ret = "+initial+" ; var canvas = document.getElementById('"+name+"');var ctx = canvas.getContext('2d');"
                                    "const circle = new Path2D();circle.arc(100, 75, 50, 0, 2 * Math.PI);"
                                    "for (var i = 0; i < 200; i++) {"
                                          "ret = ret "+op+" ctx.isPointInPath(circle, 100, 100) "
                                      "}"
                                    "return ret")
    except:
        return "ERROR"
    else:
        return img

## returns output of HTMLCanvasElement.toDataURL where name is id of chosen canvas
def get_point_in_stroke(driver, name, alwaysFalse):
    try:
        driver.get(get_config("testing_page"))
        sleep(0.3)
        op =  "||" if alwaysFalse else "&&"
        initial = "false" if alwaysFalse else "true"
        img = driver.execute_script("var ret =  "+initial+" ; var canvas = document.getElementById('"+name+"');var ctx = canvas.getContext('2d');"
                                    "const ellipse = new Path2D(); ellipse.ellipse(100, 75, 40, 60, Math.PI * .25, 0, 2 * Math.PI);"
                                    "ctx.lineWidth = 20;"
                                    "for (var i = 0; i < 200; i++) {"
                                          "ret = ret "+op+" ctx.isPointInStroke(ellipse, 100, 25) "
                                      "}"
                                    "return ret")
    except:
        return "ERROR"
    else:
        return img

## returns object with various attributes returned by WebGLRenderingContext.getParameter
def get_webgl_params(driver, name):
    driver.get(get_config("testing_page"))
    sleep(1)
    gl = "var canvas = document.getElementById('"+name+"'); var gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('moz-webgl'); gl.getExtension('WEBGL_debug_renderer_info');"
    parameters = {'unmaskedVendor': driver.execute_script(gl+"return gl.getParameter(0x9245);"),
                  'unmaskedRenderer': driver.execute_script(gl+"return gl.getParameter(0x9246);"),
                  'MAX_VERTEX_UNIFORM_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8B4A);"),
                  'MAX_VERTEX_UNIFORM_BLOCKS': driver.execute_script(gl+"return gl.getParameter(0x8A2B);"),
                  'MAX_VERTEX_OUTPUT_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x9122);"),
                  'MAX_VARYING_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8B4B);"),
                  'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8C8A);"),
                  'MAX_FRAGMENT_UNIFORM_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8B49);"),
                  'MAX_FRAGMENT_UNIFORM_BLOCKS': driver.execute_script(gl+"return gl.getParameter(0x8A2D);"),
                  'MAX_FRAGMENT_INPUT_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x9125);"),
                  'MAX_UNIFORM_BUFFER_BINDINGS': driver.execute_script(gl+"return gl.getParameter(0x8A2F);"),
                  'MAX_COMBINED_UNIFORM_BLOCKS': driver.execute_script(gl+"return gl.getParameter(0x8A2E);"),
                  'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8A31);"),
                  'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS': driver.execute_script(gl+"return gl.getParameter(0x8A33);"),
                  'MAX_VERTEX_ATTRIBS': driver.execute_script(gl+"return gl.getParameter(0x8869);"),
                  'MAX_VERTEX_UNIFORM_VECTORS': driver.execute_script(gl+"return gl.getParameter(0x8DFB);"),
                  'MAX_VERTEX_TEXTURE_IMAGE_UNITS': driver.execute_script(gl+"return gl.getParameter(0x8B4C);"),
                  'MAX_TEXTURE_SIZE': driver.execute_script(gl+"return gl.getParameter(0x0D33);"),
                  'MAX_CUBE_MAP_TEXTURE_SIZE': driver.execute_script(gl+"return gl.getParameter(0x851C);"),
                  'MAX_3D_TEXTURE_SIZE': driver.execute_script(gl+"return gl.getParameter(0x8073);"),
                  'MAX_ARRAY_TEXTURE_LAYERS': driver.execute_script(gl+"return gl.getParameter(0x88FF);"),
                  }
    return parameters

## returns output of WebGLRenderingContext.readPixels where name is id of chosen canvas
def get_webgl_pixels(driver, name):
    try:
        driver.get(get_config("testing_page"))
        sleep(1)
        gl = "var canvas = document.getElementById('"+name+"'); var gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true}) || canvas.getContext('experimental-webgl2', {preserveDrawingBuffer: true}) || canvas.getContext('webgl', {preserveDrawingBuffer: true}) || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true}) || canvas.getContext('moz-webgl', {preserveDrawingBuffer: true});"
        image = driver.execute_script(gl+"var imageData = new Uint8Array(gl.canvas.width*gl.canvas.height*4);gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, imageData); return imageData;")
    except:
        return "ERROR"
    else:
        return image

def transformTextToFloatList(text):
    if not text:
        return []
    elif "," == text[-1]:
        text = text[:-1]
    return [float(s) for s in text.split(",")]

def transformTextToIntList(text):
    if not text:
        return []
    elif "," == text[-1]:
        text = text[:-1]
    return [int(s) for s in text.split(",")]

## returns array of precisions outputed by WebGLRenderingContext.getShaderPrecisionFormat
def get_webgl_precisions(driver, name):
    driver.get(get_config("testing_page"))
    sleep(1)
    gl = "var canvas = document.getElementById('"+name+"'); var gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('moz-webgl');"
    precisions = driver.execute_script(gl+"var arr = []; var shaderTypes = ['FRAGMENT_SHADER', 'VERTEX_SHADER'];var precisionTypes = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT', 'LOW_INT', 'MEDIUM_INT', 'HIGH_INT'];"
                                      "for (var i = 0; i < shaderTypes.length; i++) {"
                                            "for (var j = 0; j < precisionTypes.length; j++) {"
                                                "arr.push(gl.getShaderPrecisionFormat(gl[shaderTypes[i]], gl[precisionTypes[j]]));"
                                            "}"
                                        "}"
                                        "return arr")
    precisions = [[a["rangeMin"], a["rangeMax"], a["precision"]] if a != {} else {} for a in precisions] # Although the JS array is the same, it is extracted differently to python, normalize the differences
    return precisions

## returns object with attributes output by AudioContext.getChannelData, AudioContext.copyFromChannel, AnalyserNode.getFloatFrequencyData, AnalyserNode.getByteFrequencyData, AnalyserNode.getFloatTimeDomainData, AnalyserNode.getByteTimeDomainData which are saved in testing page
def get_audio(driver):
    driver.get(get_config("testing_page"))
    driver.find_element(By.XPATH, "//button[text()='Test audio']").click()
    sleep(3)
    audio = {
                'get_channel': transformTextToFloatList(driver.execute_script("return document.getElementById('channel_data_result').innerHTML;")),
                'get_channel2': transformTextToFloatList(driver.execute_script("return document.getElementById('channel_data_result2').innerHTML;")),
                'copy_channel': transformTextToFloatList(driver.execute_script("return document.getElementById('copy_result').innerHTML;")),
                'copy_channel2': transformTextToFloatList(driver.execute_script("return document.getElementById('copy_result2').innerHTML;")),
                'byte_time_domain': transformTextToIntList(driver.execute_script("return document.getElementById('byte_time_result').innerHTML;")),
                'float_time_domain': transformTextToFloatList(driver.execute_script("return document.getElementById('float_time_result').innerHTML;")),
                'byte_frequency': transformTextToIntList(driver.execute_script("return document.getElementById('byte_frequency_result').innerHTML;")),
                'float_frequency': transformTextToFloatList(driver.execute_script("return document.getElementById('float_frequency_result').innerHTML;"))
            }
    return audio

## Get methods.toString().
#
#  Only executing javascript and geting returned values. Testing page is needed.
def get_methods_toString(driver):
	APIs = {
		"Date": {
			"static_methods": [
				"now",
				"parse",
				"UTC"
			],
			"instance_methods": {
				"getDate",
				"getDay",
				"getFullYear",
				"getHours",
				"getMilliseconds",
				"getMinutes",
				"getMonth",
				"getSeconds",
				"getTime",
				"getTimezoneOffset",
				"getUTCDate",
				"getUTCDay",
				"getUTCFullYear",
				"getUTCHours",
				"getUTCMilliseconds",
				"getUTCMinutes",
				"getUTCMonth",
				"getUTCSeconds",
				"getYear",
				"setDate",
				"setFullYear",
				"setHours",
				"setMilliseconds",
				"setMinutes",
				"setMonth",
				"setSeconds",
				"setTime",
				"setUTCDate",
				"setUTCFullYear",
				"setUTCHours",
				"setUTCMilliseconds",
				"setUTCMinutes",
				"setUTCMonth",
				"setUTCSeconds",
				"setYear",
				"toDateString",
				"toISOString",
				"toJSON",
				"toGMTString",
				"toLocaleDateString",
				"toLocaleString",
				"toString",
				"toTimeString",
				"toUTCString",
				"valueOf"
			}
		},
		"performance": {
			"static_methods": [
				"now",
				"clearMarks",
				"clearMeasures",
				"clearResourceTimings",
				"getEntries",
				"getEntriesByName",
				"getEntriesByType",
				"mark",
				"measure",
				"setResourceTimingBufferSize",
				"toJSON"
			]
		},
		"navigator": {
			"static_methods": [
				"getCurrentPosition",
				"watchPosition",
				"clearWatch"
			]
		},
		"canvas": {
			"inject_code": "var canvas = document.getElementById('canvas1');",
			"static_methods": [
				"getContext"
			]
		}
	}

	driver.get(get_config("testing_page"))

	output = {}


	for API in APIs:
		if 'static_methods' in APIs[API]:
			inject_code = ""
			if 'inject_code' in APIs[API]:
				inject_code = APIs[API]['inject_code']

			for method in APIs[API]['static_methods']:
				method_toString = ""
				try:
					method_toString = driver.execute_script(inject_code + "return " + API + "." + method + ".toString()")
				except:
					output[API + '.' + method] = None
				else:
					output[API + '.' + method] = method_toString


		if 'instance_methods' in APIs[API]:
			constructor_toString = ""
			try:
				constructor_toString = driver.execute_script("return " + API + ".toString()")
			except:
				output[API] = None
			else:
				output[API] = constructor_toString


			for method in APIs[API]['instance_methods']:
				method_toString = ""
				try:
					method_toString = driver.execute_script("return " + API + "." + method + ".toString()")
				except:
					output[API + '.prototype.' + method] = None
				else:
					output[API + '.prototype.' + method] = method_toString


				method_toString = ""
				try:
					method_toString = driver.execute_script("return new " + API + "()." + method + ".toString()")
				except:
					output[API + '.' + method] = None
				else:
					output[API + '.' + method] = method_toString

	return output
