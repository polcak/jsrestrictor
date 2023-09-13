#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2022  Libor Polčák
#  Copyright (C) 2022  Martin Bednar
#  Copyright (C) 2020  Peter Hornak
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
import time

from web_browser_type import BrowserType

from configuration import get_config
from web_browser_shared import get_shared_browser
from web_browser_type import BrowserType

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
        browser.execute_script("""\
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
            };\
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

################################################################################
# 
# Helping code to evaluate arrays code used in the test cases below
#
COMMON_HELPERS = """ \
    BigInt.prototype.toJSON = function() { \
      return this.toString() + "n"; /* Used by deepEqual below, this generates an invalid JSON file but it does not matter for the test cases */ \
    }; \
    \
    function deepEqual(a, b) {\
        try { \
            let jsona = JSON.stringify(a);\
            let jsonb = JSON.stringify(b);\
            if (a === b || jsona === jsonb) { /* Make the comparison better if you encounter problems with this approach */ \
                document.getElementsByTagName("p")[0].innerText = "";\
            } \
            else { \
                document.getElementsByTagName("p")[0].innerText = jsona + "\\\\n\\\\n" + jsonb;\
            } \
        } \
        catch (e) { \
            document.getElementsByTagName("p")[0].innerText = "Exception!" + String(e);\
        } \
    }\
    function arrayEqual(a, b) {\
        function toArray(arr) {\
            var resultArr = [];\
            for (let i = 0; i < arr.length; ++i) {\
                resultArr[i] = arr[i];\
            }\
            return resultArr;\
        }\
        deepEqual(toArray(a), toArray(b));\
    }\
"""

def check(browser, a, b, func="deepEqual"):
    browser.execute_script(""" \
            try { \
                %s(%s, %s); \
            } \
            catch (e) { \
                document.getElementsByTagName("p")[0].innerText = "Exception!" + String(e);\
            }""" % (func, a, b))
    x = browser.driver.find_element(By.TAG_NAME, "p").text
    assert x == ""

def check_arrays(browser, a, b):
    return check(browser, a, b, func="arrayEqual")

@pytest.fixture(scope='module', autouse=True)
def setup_jsevironment(browser):
    browser.execute_script(COMMON_HELPERS)
################################################################################

def test_ArrayBufferViews(browser):
    browser.execute_script(""" \
        let buffer = new ArrayBuffer(56);\
        let typedArr = new Uint32Array(buffer, 16);\
        typedArr.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);\
        """)
    check(browser, "typedArr.buffer", "buffer")
    check(browser, "typedArr.buffer", "buffer")
    check(browser, "typedArr.byteOffset", 16)
    check(browser, "typedArr.byteLength", 40)
    browser.execute_script('var dataView = new DataView(buffer, 32)')
    check(browser, "dataView.buffer", "buffer")
    check(browser, "dataView.byteOffset", 32)
    check(browser, "dataView.byteLength", 24)

def test_TypedArraysInit(browser):
    browser.execute_script("var typedArray =new Uint32Array([1, 100, 1000, 2, 200]);")
    check_arrays(browser, "typedArray", "[1, 100, 1000, 2, 200]")

def test_TypedArraysParams32(browser):
    browser.execute_script("var typedArray =new Uint32Array([1, 100, 1000, 2, 200]);")
    check(browser, "typedArray.BYTES_PER_ELEMENT", 4)
    check(browser, "typedArray.length * typedArray.BYTES_PER_ELEMENT", "typedArray.byteLength")
    check(browser, "typedArray.length", 5)
    check(browser, "typedArray.byteOffset", 0)

def test_TypedArraysInitByLength(browser):
    num = 10**5;
    browser.execute_script("var typedArray = new Uint8Array(%d);" % num)
    check_arrays(browser, "typedArray", repr([0] * num))

def test_TypedArraysOverwriteElement(browser):
    browser.execute_script("var typedArray =new Uint32Array([1, 100, 1000, 2, 200]);")
    browser.execute_script("typedArray[0] = 10;")
    check_arrays(browser, "typedArray", "[10, 100, 1000, 2, 200]")

def test_TypedArraysOverwriteFull(browser):
    browser.execute_script("var typedArray = new Uint8Array(5);")
    browser.execute_script("typedArray.set([1, 2, 3, 4, 5]);")
    check_arrays(browser, "typedArray", "[1, 2, 3, 4, 5]")

def test_TypedArraysParams8(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    check(browser, "typedArray.BYTES_PER_ELEMENT", 1)
    check(browser, "typedArray.length * typedArray.BYTES_PER_ELEMENT", "typedArray.byteLength")
    check(browser, "typedArray.length", 5)
    check(browser, "typedArray.byteOffset", 0)

def test_TypedArrayFromBuffer(browser):
    browser.execute_script("var arrayBuffer = new ArrayBuffer(5);")
    browser.execute_script("var typedArray  = new Uint8Array(arrayBuffer);")
    browser.execute_script("typedArray.set([1, 2, 3, 4, 5]);")
    check_arrays(browser, "typedArray", "[1, 2, 3, 4, 5]")
    browser.execute_script("typedArray[0] = 100")
    check_arrays(browser, "typedArray", "[100, 2, 3, 4, 5]")
    check(browser, "typedArray.BYTES_PER_ELEMENT", 1)
    check(browser, "typedArray.length * typedArray.BYTES_PER_ELEMENT", "typedArray.byteLength")
    check(browser, "typedArray.length", 5)
    check(browser, "typedArray.byteOffset", 0)

def test_TypedArraysMethods_set(browser):
    browser.execute_script(""" \
           var defaultVals = [1, 2, 3, 4, 5]; \
           var typedArray = new Uint8Array(5); \
           typedArray.set(defaultVals); \
        """)
    check_arrays(browser, "typedArray", "defaultVals")

def test_TypedArraysMethods_reverse(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("typedArray.reverse();")
    check_arrays(browser, "typedArray", [5, 4, 3, 2, 1])

def test_TypedArraysMethods_sort(browser):
    browser.execute_script("var typedArray = new Uint8Array([5, 4, 3, 2, 1]);")
    browser.execute_script("typedArray.sort();")
    check_arrays(browser, "typedArray", "[1, 2, 3, 4, 5]")

def test_TypedArraysMethods_fill(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("typedArray.fill(10, 0, 2);")
    check_arrays(browser, "typedArray", "[10, 10, 3, 4, 5]");

def test_TypedArraysMethods_copyWithin(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("typedArray.copyWithin(2, 0, 2,);")
    check_arrays(browser, "typedArray", "[1, 2, 1, 2, 5]")

def test_TypedArraysMethods_subarray(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("var sub = typedArray.subarray(0, 4);")
    check_arrays(browser, "sub", "[1, 2, 3, 4]")
    browser.execute_script("sub[0] = 1;")
    check(browser, "sub[0]", "typedArray[0]")

def test_TypedArraysMethods_slice(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("var slice = typedArray.slice(0, 2);")
    check_arrays(browser, "slice", "[1, 2]");
    browser.execute_script("slice[0] = 100;")
    check(browser, "slice[0]", 100);
    check_arrays(browser, "typedArray", "[1, 2, 3, 4, 5]")

def test_TypedArraysMethods_map(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("var map = typedArray.map(x => x * 2);")
    check_arrays(browser, "map", "[2, 4, 6, 8, 10]");

def test_TypedArraysMethods_filter(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("var filter = typedArray.filter(x => x > 2);")
    check_arrays(browser, "filter", "[3, 4, 5]");

def test_TypedArraysMethods_reduce(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("""var reduce = typedArray.reduce(function (prev, curr) { \
            return prev + curr; \
        });""")
    check(browser, "reduce", 15);

def test_TypedArraysMethods_reduceR(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("""reduceR = typedArray.reduce(function (prev, curr) { \
            return prev + curr; \
        });""")
    check(browser, "reduceR", 15);

def test_TypedArraysMethods_lastIndexOf(browser):
    browser.execute_script("var typedArray = new Uint8Array([10, 10, 10, 4, 5]);")
    check(browser, "typedArray.lastIndexOf(10)", 2);

def test_TypedArraysMethods_forEach(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("""var forEachArr = []; \
        typedArray.forEach(x => forEachArr.push(x));""")
    check_arrays(browser, "forEachArr", "[1, 2, 3, 4, 5]");

def test_TypedArraysMethods_find(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("""var find = typedArray.find(function (value, index, obj) { \
            return value > 1; \
        });""")
    check(browser, "find", 2)

def test_TypedArraysMethods_join(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    check(browser, "typedArray.join()", '"1,2,3,4,5"')

def test_TypedArraysMethods_entrieskeysvalues(browser):
    browser.execute_script("var typedArray = new Uint8Array([1, 2, 3, 4, 5]);")
    browser.execute_script("var iter_entries = typedArray.entries();")
    browser.execute_script("var iter_keys    = typedArray.keys();")
    browser.execute_script("var iter_values  = typedArray.values();")
    check_arrays(browser, "iter_entries.next().value", "[0, 1]")
    check(browser, "iter_keys.next().value", 0)
    check(browser, "iter_values.next().value", 1)
    check_arrays(browser, "iter_entries.next().value", "[1, 2]")
    check(browser, "iter_keys.next().value", 1)
    check(browser, "iter_values.next().value", 2)

def test_TypedArraysMethods_from(browser):
    check_arrays(browser, "Uint8Array.from([1, 2, 3])", "[1, 2, 3]")

def test_TypedArraysMethods_of(browser):
    check_arrays(browser, "Uint8Array.of(1, 2, 3, 4)", "[1, 2, 3, 4]")

def test_DataViewInit(browser):
    browser.execute_script("""var buff = new ArrayBuffer(16); \
        var dataView_test_DataViewInit = new DataView(buff);""")
    check(browser, "dataView_test_DataViewInit.byteLength", 16)
    check(browser, "dataView_test_DataViewInit.byteOffset", 0)
    check(browser, "dataView_test_DataViewInit.buffer", "buff")
    browser.execute_script("dataView_test_DataViewInit = new DataView(buff, 4, 8);")
    check(browser, "dataView_test_DataViewInit.byteLength", 8)
    check(browser, "dataView_test_DataViewInit.byteOffset", 4)

DATA_VIEW_ACCESSORS = [
        ('getInt8', 'setInt8', "Number"),
        ('getInt16', 'setInt16', "Number"),
        ('getInt32', 'setInt32', "Number"),
        ('getUint8', 'setUint8', "Number"),
        ('getUint16', 'setUint16', "Number"),
        ('getUint32', 'setUint32', "Number"),
        ('getFloat32', 'setFloat32', "Number"),
        ('getFloat64', 'setFloat64', "Number"),
        ('getBigInt64', 'setBigInt64', "BigInt"),
        ('getBigUint64', 'setBigUint64', "BigInt"),
    ];

def test_DataViewAccessors(browser):
    browser.execute_script(""" \
            buff = new ArrayBuffer(128); \
            dataView = new DataView(buff); \
            """)
    n = 1
    for getter, setter, t in DATA_VIEW_ACCESSORS:
        n += 10
        # Big endian
        browser.execute_script('dataView["%s"](0, %s(%d));' % (setter, t, n))
        check(browser, 'dataView["%s"](0)' % getter, "%s(%d)" % (t, n))
        # Little endian
        browser.execute_script('dataView["%s"](0, %s(%s), true);' % (setter, t, n))
        check(browser, 'dataView["%s"](0, true)' % getter, "%s(%d)" % (t, n))
    # Try specific values (float)
    browser.execute_script('dataView.setFloat64(1, 123456.7891);')
    check(browser, "dataView.getFloat64(1)", "123456.7891")
    # Try specific values (negative number)
    browser.execute_script('dataView.setInt32(2, -12345);')
    check(browser, "dataView.getInt32(2)", "-12345")
    # Try specific values (signed bigint)
    browser.execute_script('dataView.setBigInt64(0, -1234567890123456789n);')
    check(browser, 'dataView.getBigInt64(0)', '-1234567890123456789n')

def test_OneBufferMoreViews(browser):
    browser.execute_script(""" \
        var aBuff = new ArrayBuffer(12); \
        var typedArray = new Int8Array(aBuff); \
        var dataView = new DataView(aBuff); \
        typedArray[0] = 10; \
    """)
    check(browser, "typedArray[0]", "dataView.getInt8(0)")

@pytest.mark.xfail(get_shared_browser().type == BrowserType.CHROME, reason="See https://pagure.io/JShelter/webextension/issue/80")
def test_worker_basic(browser, expected):
    if expected.worker == "REMOVED":
        check(browser, "Worker", "undefined")
        return
    browser.execute_script('var worker = new Worker("");')
    check(browser, "worker.onmessage", "null")
    check(browser, "worker.onerror", "null")
    if (browser.type == BrowserType.FIREFOX):
        check(browser, "worker.onmessageerror", "null")
    check(browser, "typeof worker.addEventListener", '"function"')
    check(browser, "typeof worker.postMessage", '"function"')
    check(browser, "typeof worker.removeEventListener", '"function"')
    check(browser, "typeof worker.terminate", '"function"')

@pytest.mark.xfail(reason="Unfortunately current implementation of Worker does not implement EventTarget interface")
def test_worker_implements_dispatchEvent(browser):
    browser.execute_script('var worker = new Worker("");')
    check(browser, "typeof worker.dispatchEvent", '"function"')

@pytest.mark.xfail(reason="See https://pagure.io/JShelter/webextension/issue/80")
def test_worker_check_communication_handler(browser):
    """ There is a bug in both Firefox and Chrome implementation of Worker wrapper. """
    browser.execute_script("""\
        var multiply_result = 0;\
        var worker = new Worker("data:text/javascript;base64," + btoa("\
            onmessage = function(e) {\
                const result = e.data[0] * e.data[1];\
                postMessage(result);\
            }\
        "));\
\
        worker.onmessage = function(e) {\
            multiply_result = e.data;\
        };\
        worker.postMessage([5,8]);\
    """)
    time.sleep(1) # Note that the code is possibly asynchronous (e.g. without JShelter), give the worker time to respond
    check(browser, "multiply_result", 40)

@pytest.mark.xfail(reason="See https://pagure.io/JShelter/webextension/issue/80")
def test_worker_error(browser):
    browser.execute_script("""\
        var worker_error = 0;\
        var worker = new Worker("data:text/javascript;base64," + btoa("\
            onmessage = function(e) {\
                postMessage(variabledoesnotexist_and_it_is_intentional);\
            }\
        "));\
\
        worker.onmessage = function(e) {\
            worker_error++;\
        };\
        worker.onerror = function() {\
            worker_error--;\
        };\
        worker.postMessage([6,7]);\
    """)
    time.sleep(1) # Note that the code is possibly asynchronous (e.g. without JShelter), give the worker time to respond
    check(browser, "worker_error", -1)

@pytest.mark.xfail(reason="See https://pagure.io/JShelter/webextension/issue/80")
def test_worker_check_communication_listener(browser):
    """ There is a bug in both Firefox and Chrome implementation of Worker wrapper. """
    browser.execute_script("""\
        var multiply_result = 0;\
        var worker = new Worker("data:text/javascript;base64," + btoa("\
            onmessage = function(e) {\
                const result = e.data[0] * e.data[1];\
                postMessage(result);\
            }\
        "));\
\
        worker.addEventListener("message", function(e) {\
            multiply_result = e.data;\
        });\
        worker.postMessage([4,5]);\
    """)
    time.sleep(1) # Note that the code is possibly asynchronous (e.g. without JShelter), give the worker time to respond
    check(browser, "multiply_result", 20)

def test_worker_terminate(browser):
    browser.execute_script("""\
        var multiply_result = 0;\
        var worker = new Worker("data:text/javascript;base64," + btoa("\
            onmessage = function(e) {\
                const result = e.data[0] * e.data[1];\
                postMessage(result);\
            }\
        "));\
        worker.terminate();\
\
        worker.addEventListener("message", function(e) {\
            multiply_result = e.data;\
        });\
        worker.postMessage([7,6]);\
    """)
    time.sleep(1) # Note that the code is possibly asynchronous (e.g. without JShelter), give the worker time to respond
    check(browser, "multiply_result", 0)

@pytest.mark.xfail(reason="See https://pagure.io/JShelter/webextension/issue/80")
def test_worker_dispatchEvent(browser):
    """ Unfortunately current implementation of Worker does not implement EventTarget interface """
    browser.execute_script("""\
        var correct_order_check = 1;\
        var test_event = new Event("test");\
        var worker = new Worker("data:text/javascript;base64," + btoa(""));\
\
        worker.ontest = function() { /* Will not be called */ \
            correct_order_check *= 2;\
        };\
        worker.addEventListener("test", function(e) {\
            correct_order_check *= 3;\
        });\
        worker.addEventListener("test", function(e) {\
            correct_order_check *= 5;\
        });\
        worker.addEventListener("test", function(e) {\
            correct_order_check *= 7;\
        });\
        worker.dispatchEvent(test_event);\
    """)
    check(browser, "correct_order_check", 105) # dispatchEvent is synchronous
