#
#  JShelter is a browser extension which increases level
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
from time import time

from configuration import get_config
from web_browser_type import BrowserType

## Setup method - it is run before time tests execution starts.
#
#  This setup method open testing page.
@pytest.fixture(scope='module', autouse=True)
def load_test_page(browser):
    browser.driver.get(get_config("testing_page"))

def test_prevent_regression_ghsa_page_steals_configuration(browser):
    assert browser.execute_script("""\
        window.__jshelter_leak = {};\
        var attackerPortId = "attacker_controlled_port_id_1234";\
        window.dispatchEvent(new CustomEvent("jshelter-bootstrap", { detail: { portId: attackerPortId } }));\
        window.addEventListener(attackerPortId + ":return:extension", function(e){\
          window.__jshelter_leak.got = true;\
          window.__jshelter_leak.config = e.detail && e.detail.value;\
        }, true);\
        window.dispatchEvent(new CustomEvent(attackerPortId + ":page", { detail: { msg: { init: true } } }));\
        propagate_outside(JSON.stringify(window.__jshelter_leak.config, null, 2));\
    """, "propagate_outside") == None
