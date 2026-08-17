#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2022-2026  Libor Polčák
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

def check(browser, a, b):
    return browser.execute_script("""%s === %s""" % (a, b))

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
