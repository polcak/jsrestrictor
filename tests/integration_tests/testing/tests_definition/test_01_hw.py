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

from values_getters import get_device, get_IOdevices

from configuration import get_config

## Setup method - it is run before hw tests execution starts.
#
#  This setup method initialize variable device that contains current data about device and
#  this variable is provided to device tests and values in device variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def device(browser):
	return get_device(browser.driver)


## Setup method - it is run before hw tests execution starts.
#
#  This setup method initialize variable IOdevices that contains current data about IO devices and
#  this variable is provided to device tests and values in IOdevices variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def IOdevices(browser):
    # 2023-09-13: loading of the testing_page added due to Firefox reporting ReferenceError: can't
    # access lexical declaration 'unX' before initialization patchWindow.js line 60 >
    # Function:199:7.
    # The error is not reproducible in browser without selenium. The error is not there during
    # browser.jsr_level setter. The error only appears during the test initialization in start.py
    # during pytest.main. The error goes away after page reload.
	browser.driver.get(get_config("testing_page"))
	return get_IOdevices(browser.driver)


## Test device memory.
def test_device_memory(browser, device, expected):
	if browser.real.device.deviceMemory == None and device['deviceMemory'] == None:
		return # This browser does not support deviceMemory so JShelter should not spoof that value
	elif browser.real.device.deviceMemory == None:
		assert device['deviceMemory'] == None
	if expected.device.deviceMemory[browser.type] == 'SPOOF VALUE':
		assert device['deviceMemory'] in expected.device.deviceMemory['valid_values']
		assert device['deviceMemory'] <= browser.real.device.deviceMemory
	else:
		assert device['deviceMemory'] == browser.real.device.deviceMemory


## Test hardware concurrency.
def test_hardware_concurrency(browser, device, expected):
	if expected.device.hardwareConcurrency['value'] == 'REAL VALUE':
		assert device['hardwareConcurrency'] == browser.real.device.hardwareConcurrency
	elif expected.device.hardwareConcurrency['value'] == 'SPOOF VALUE':
		expectedval = expected.device.hardwareConcurrency['valid_values']
		if expectedval == "UP TO REAL VALUE":
			expectedval = range(browser.real.device.hardwareConcurrency + 1)
		assert device['hardwareConcurrency'] in expectedval
	else:
		assert False # We should not get here


## Test IOdevices.
def test_IOdevices(browser, IOdevices, expected):
	if expected.device.IOdevices == 'REAL VALUE':
		assert len(IOdevices) == len(browser.real.device.IOdevices)
		for i in range(len(IOdevices)):
			assert IOdevices[i]['kind'] == browser.real.device.IOdevices[i]['kind']
	elif expected.device.IOdevices == 'EMPTY':
		if IOdevices == 'ERROR':
			assert IOdevices == 'ERROR'
		else:
			assert IOdevices == []
			assert len(IOdevices) == 0
	else:
		assert len(IOdevices) in expected.device.IOdevices
