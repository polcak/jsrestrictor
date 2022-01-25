#
#  JavaScript Restrictor is a browser extension which increases level
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

import pytest
import output

from web_browser import Browser
from web_browser_type import BrowserType
from web_browser_shared import set_shared_browser
from configuration import get_config


## Main module - it starts and control testing.
#
#  To start testing call this module from PowerShell, CommandPrompt, Terminal or Bash: python start.py
#  For every browser and for every jsr_level defined in configuration.py set of all tests is run.
def main():
    #  For every browser from configuration.py run set of test.
    for browser_type in get_config("tested_browsers"):
        # create new browser of given type (Chrome, Firefox, etc.)
        my_browser = Browser(browser_type)
        # set current browser as shared browser for all testing levels (do not create new browser
        # for every JShelter_level)
        set_shared_browser(my_browser)
        # for every browser from configuration.py run set of test.
        for jsr_level in get_config("tested_jsr_levels"):
            output.print_testing_header(browser_type, jsr_level)
            # set jsr_level to given level
            my_browser.jsr_level = jsr_level
            # run set of tests
            pytest.main(['-s'])
            output.print_testing_footer(browser_type, jsr_level)
        # Close browser.
        my_browser.quit()


if __name__ == "__main__":
    main()
