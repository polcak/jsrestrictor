#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
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

from pathlib import Path

from web_browser_type import BrowserType


## Static Config class contains definition for basic variables used during testing.
#
#  Class Config is automatically changed for every computer based on current environment.
#  Variables in brackets <<>> are updated by script setup_buildJSR_runTests.ps1/sh.
#  You can change testing browsers and JShelter levels.
class __Config:
    # Browsers in which tests will be run.
    tested_browsers = [BrowserType.CHROME, BrowserType.FIREFOX]
    # Default levels of JShelter which will be tested.
    tested_jsr_levels = [0, 1, 2, 3, "Experiment"]



    ######### OTHER CONFIG PARAMETERS SHOULD BE SET AUTOMATICALLY BY SCRIPT setup_buildJSR_runTests.ps1/sh ########
    # IT SHOULD NOT BE NEEDED TO CHANGE THEM, BUT WHEN ERROR HAPPENED, TRY TO INSERT ABSOLUTE FULL PATHS MANUALLY #
    # Full path to Firefox driver.
    firefox_driver = "<<JSR_project_root_directory_path>>/tests/common_files/webbrowser_drivers/geckodriver.exe"
    # Full path to JShelter package for Firefox (xpi package).
    firefox_jsr_extension = "<<JSR_project_root_directory_path>>/tests/common_files/JShelter/firefox.xpi"
    # Full path to Firefox ESR (default) profile.
    firefox_profile = "<<Firefox_ESR_default_profile>>"
    # Firefox executable to start Firefox, redefine for example if you have a specific version for testing
    firefox_binary_location = "firefox"
    # Full path to Chrome driver.
    chrome_driver = "<<JSR_project_root_directory_path>>/tests/common_files/webbrowser_drivers/chromedriver.exe"
    # Full path to JShelter package for Chrome (crx package).
    chrome_jsr_extension ="<<JSR_project_root_directory_path>>/tests/common_files/JShelter/chrome.crx"
    # Support testing page - do not change without changing script values_getters.py
    # DO NOT SET CUSTOM level of protection FOR THIS SITE. DEFAULT LEVEL TO THIS SITE HAS TO BE APPLIED:
    testing_page = "https://polcak.github.io/jsrestrictor/test/test.html"


## Getter for values in Config class
#
#  Do not use direct access to Config from other modules. Always get values through this getter.
#  It is because of paths. This getter guarantees uniform way of writing paths in Config class for every supported OS.
#  Before getting a path, this path is updated in this getter according current OS.
def get_config(item):
    if item == "tested_browsers" or item == "tested_jsr_levels" or item == "testing_page":
        return getattr(__Config, item)
    else:
        return str(Path(getattr(__Config, item)))
