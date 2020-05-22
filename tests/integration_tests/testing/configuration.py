from pathlib import Path

from web_browser_type import BrowserType


## Static Config class contains definition for basic variables used during testing.
#
#  Class Config need to be changed for every computer based on current environment.
#  Paths below have to be written as full paths.
#  Follow README.md to get known how to edit this Config.
class __Config:
    # Browsers in which tests will be run.
    tested_browsers = [BrowserType.CHROME, BrowserType.FIREFOX]
    # Default levels of JSR which will be tested.
    tested_jsr_levels = [0, 1, 2, 3]



    ############ OTHER CONFIG PARAMETERS SHOULD BE SET AUTOMATICALLY BY SCRIPT setup_and_run ###############
    ################### IT SHOULD NOT BE NEEDED TO CHANGE THEM, BUT YOU CAN CHECK THEM #####################
    # Full path to Firefox driver.
    firefox_driver = "<<JSR_project_root_directory_path>>/tests/common_files/webbrowser_drivers/geckodriver.exe"
    # Full path to JSR package for Firefox (xpi package).
    firefox_jsr_extension = "<<JSR_project_root_directory_path>>/tests/common_files/JSR/firefox_JSR.xpi"
    # Full path to Firefox ESR (default) profile.
    firefox_profile = "<<Firefox_ESR_default_profile>>"
    # Full path to Chrome driver.
    chrome_driver = "<<JSR_project_root_directory_path>>/tests/common_files/webbrowser_drivers/chromedriver.exe"
    # Full path to JSR package for Chrome (crx package).
    chrome_jsr_extension = "<<JSR_project_root_directory_path>>/tests/common_files/JSR/chrome_JSR.crx"
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
