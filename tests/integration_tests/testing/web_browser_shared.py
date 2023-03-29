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

from web_browser_type import BrowserType
from web_browser import Browser


## During testing multiple levels of JShelter are tested.
#  Variable _shared_browser is for testing all levels of JShelter in one browser.
#  If _shared_browser would not exists, a new browser for every tests set has to be created.
#  Shared browser can save time of creating new browser because one browser is reused for more tested JST levels.
#  Use getter and setter. Do not acces directly private variable _shared_browser.
_shared_browser = None


## Setter for _shared_browser.
def set_shared_browser(browser):
    global _shared_browser
    _shared_browser = browser


## Getter for _shared_browser.
def get_shared_browser():
    global _shared_browser
    return _shared_browser
