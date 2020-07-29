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

import pytest

from values_getters import get_device


## Setup method - it is run before hw tests execution starts.
#
#  This setup method initialize variable device that contains current data about device and
#  this variable is provided to device tests and values in device variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def device(browser):
	return get_device(browser.driver)


## Test device memory.
def test_device_memory(browser, device, expected):
	if expected.device.deviceMemory[browser.type] == 'REAL VALUE':
		assert device['deviceMemory'] == browser.real.device.deviceMemory
	else:
		assert device['deviceMemory'] == expected.device.deviceMemory[browser.type]


## Test hardware concurrency.
def test_hardware_concurrency(browser, device, expected):
	if expected.device.hardwareConcurrency == 'REAL VALUE':
		assert device['hardwareConcurrency'] == browser.real.device.hardwareConcurrency
	else:
		assert device['hardwareConcurrency'] == expected.device.hardwareConcurrency
