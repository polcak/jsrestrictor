#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from web_browser_type import BrowserType
from test_type import TestType

## Static MetaConfig class contains declaration of basic variables used during testing.
class MetaConfig(type):
    @property
    def sites_to_test_csv_path(self):
        return self._sites_to_test_csv_path
    @property
    def number_of_sites_for_testing(self):
        return self._number_of_sites_for_testing
    @property
    def tested_browsers(self):
        return self._tested_browsers
    @property
    def jsr_level(self):
        return self._jsr_level
    @property
    def perform_tests(self):
        return self._perform_tests
    @property
    def grid_server_ip_address(self):
        return self._grid_server_ip_address
    @property
    def number_of_grid_nodes_on_this_device(self):
        return self._number_of_grid_nodes_on_this_device
    @property
    def number_of_concurrent_sites_testing(self):
        return self._number_of_concurrent_sites_testing
    @property
    def get_page_data_timeout(self):
        return self._get_page_data_timeout
    @property
    def wait_between_checks_if_page_data_loaded(self):
        return self._wait_between_checks_if_page_data_loaded
    @property
    def selenium_server_jar_path(self):
        return self._selenium_server_jar_path
    @property
    def chrome_driver_path(self):
        return self._chrome_driver_path
    @property
    def jsr_extension_for_chrome_path(self):
        return self._jsr_extension_for_chrome_path


## Static Config class contains value assignment of basic variables declared in MetaConfig class.
class Config(metaclass=MetaConfig):
    # Relative or absolute path to top sites csv file.
    _sites_to_test_csv_path = './top_sites/tranco.csv'
    # Number of sites from beggining of the top sites list taken for testing.
    _number_of_sites_for_testing = 100
    # Run tests in this browsers.
    _tested_browsers = [BrowserType.CHROME]
    # Run tests with JSR on this level.
    _jsr_level = 3
    # Perform this tests for every website.
    _perform_tests = [TestType.LOGS, TestType.SCREENSHOTS]

    # IP address of Selenium Grid server in distributed environment.
    _grid_server_ip_address = 'localhost'
    # Number of Selenium Grid nodes on this device.
    _number_of_grid_nodes_on_this_device = 1
    # Degree of paralelism. It should be the same number as total number of grid nodes.
    _number_of_concurrent_sites_testing = 1

    # Timeout during loading one site in seconds.
    _get_page_data_timeout = 240
    # Waiting in seconds between checking website if is alreadz loaded.
    _wait_between_checks_if_page_data_loaded = 10

    # Paths to files neccessary for testing.
    _selenium_server_jar_path = './selenium/selenium-server-standalone.jar'
    _chrome_driver_path = '../../common_files/webbrowser_drivers/chromedriver.exe'
    _jsr_extension_for_chrome_path = '../../common_files/JSR/chrome_JSR.crx'
