#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
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
	return get_IOdevices(browser.driver)


## Test device memory.
def test_device_memory(browser, device, expected):
	if expected.device.deviceMemory[browser.type] == 'REAL VALUE':
		assert device['deviceMemory'] == browser.real.device.deviceMemory
	elif expected.device.deviceMemory['value'] == 'SPOOF VALUE':
		assert device['deviceMemory'] in expected.device.deviceMemory['valid_values']
	else:
		assert device['deviceMemory'] == expected.device.deviceMemory[browser.type]


## Test hardware concurrency.
def test_hardware_concurrency(browser, device, expected):
	if expected.device.hardwareConcurrency['value'] == 'REAL VALUE':
		assert device['hardwareConcurrency'] == browser.real.device.hardwareConcurrency
	elif expected.device.hardwareConcurrency['value'] == 'SPOOF VALUE':
		assert device['hardwareConcurrency'] in expected.device.hardwareConcurrency['valid_values']
	else:
		assert device['hardwareConcurrency'] == expected.device.hardwareConcurrency


## Test IOdevices.
def test_IOdevices(browser, IOdevices, expected):
	if expected.device.IOdevices == 'REAL VALUE':
		assert len(IOdevices) == len(browser.real.device.IOdevices)
		for device in IOdevices:
			assert any(realIOdevice['deviceId'] == device['deviceId'] for realIOdevice in browser.real.device.IOdevices)
	else:
		assert len(IOdevices) == expected.device.IOdevices
