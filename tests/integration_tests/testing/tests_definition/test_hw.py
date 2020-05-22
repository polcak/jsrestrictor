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
	if expected.device.deviceMemory == 'REAL VALUE':
		assert device['deviceMemory'] == browser.real.device.deviceMemory
	else:
		assert device['deviceMemory'] == expected.device.deviceMemory


## Test hardware concurrency.
def test_hardware_concurrency(browser, device, expected):
	if expected.device.hardwareConcurrency == 'REAL VALUE':
		assert device['hardwareConcurrency'] == browser.real.device.hardwareConcurrency
	else:
		assert device['hardwareConcurrency'] == expected.device.hardwareConcurrency
