#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Matus Svancar
#  Copyright (C) 2022  Martin Bednar
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

from values_getters import get_navigator


## Setup method - it is run before navigator tests execution starts.
#
#  This setup method initialize variable navigator that contains current data about navigator and
#  this variable is provided to navigator tests and values in device variable are compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def navigator(browser):
    return get_navigator(browser.driver)


## Test user agent.
def test_user_agent(browser, navigator, expected):
    if expected.navigator.userAgent[browser.type] == 'REAL VALUE':
        assert navigator['userAgent'] == browser.real.navigator.userAgent
    else:
        assert navigator['userAgent'] == expected.navigator.userAgent[browser.type]


## Test app version.
def test_app_version(browser, navigator, expected):
    if expected.navigator.appVersion == 'REAL VALUE':
        assert navigator['appVersion'] == browser.real.navigator.appVersion
    else:
        assert navigator['appVersion'] == expected.navigator.appVersion


## Test platform.
def test_platform(browser, navigator, expected):
    if expected.navigator.platform == 'REAL VALUE':
        assert navigator['platform'] == browser.real.navigator.platform
    else:
        assert navigator['platform'] == expected.navigator.platform


## Test vendor.
def test_vendor(browser, navigator, expected):
    if expected.navigator.vendor[browser.type] == 'REAL VALUE':
        assert navigator['vendor'] == browser.real.navigator.vendor
    else:
        assert navigator['vendor'] == expected.navigator.vendor[browser.type]


## Test language.
def test_language(browser, navigator, expected):
    if expected.navigator.language == 'REAL VALUE':
        assert navigator['language'] == browser.real.navigator.language
    else:
        assert navigator['language'] == expected.navigator.language


## Test languages.
def test_languages(browser, navigator, expected):
    if expected.navigator.languages == 'REAL VALUE':
        assert navigator['languages'] == browser.real.navigator.languages
    else:
        assert navigator['languages'] == expected.navigator.languages


## Test cookie enabled.
def test_cookie_enabled(browser, navigator, expected):
    if expected.navigator.cookieEnabled == 'REAL VALUE':
        assert navigator['cookieEnabled'] == browser.real.navigator.cookieEnabled
    else:
        assert navigator['cookieEnabled'] == expected.navigator.cookieEnabled


## Test doNotTrack flag.
def test_do_not_track(browser, navigator, expected):
    if expected.navigator.doNotTrack == 'REAL VALUE':
        assert navigator['doNotTrack'] == browser.real.navigator.doNotTrack
    else:
        assert navigator['doNotTrack'] == expected.navigator.doNotTrack


## Test oscpu
def test_oscpu(browser, navigator, expected):
    if expected.navigator.oscpu == 'REAL VALUE':
        assert navigator['oscpu'] == browser.real.navigator.oscpu
    else:
        assert navigator['oscpu'] == expected.navigator.oscpu

# See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/plugins
LIVING_STANDARD_PLUGINS = [
            {'description': 'Portable Document Format', 'filename': 'internal-pdf-viewer', 'name': 'PDF Viewer'},
            {'description': 'Portable Document Format', 'filename': 'internal-pdf-viewer', 'name': 'Chrome PDF Viewer'},
            {'description': 'Portable Document Format', 'filename': 'internal-pdf-viewer', 'name': 'Chromium PDF Viewer'},
            {'description': 'Portable Document Format', 'filename': 'internal-pdf-viewer', 'name': 'Microsoft Edge PDF Viewer'},
            {'description': 'Portable Document Format', 'filename': 'internal-pdf-viewer', 'name': 'WebKit built-in PDF'},
        ]

## Test plugins count
def test_plugins_count(browser, navigator, expected):
    if navigator['plugins'] == LIVING_STANDARD_PLUGINS and browser.real.navigator.plugins == LIVING_STANDARD_PLUGINS:
        return # JShelter should not modify the plugins that are the same in all conformant browsers
    if expected.navigator.plugins['count'][browser.type] == 'IGNORE':
        return
    elif expected.navigator.plugins['count'][browser.type] == 'REAL VALUE':
        assert len(navigator['plugins']) == len(browser.real.navigator.plugins)
    elif expected.navigator.plugins['count'][browser.type] == 'PLUS_2':
        assert len(navigator['plugins']) == len(browser.real.navigator.plugins) + 2
    else:
        assert len(navigator['plugins']) == expected.navigator.plugins['count'][browser.type]

## Test plugins array value
def test_plugins(browser, navigator, expected):
    if navigator['plugins'] == LIVING_STANDARD_PLUGINS and browser.real.navigator.plugins == LIVING_STANDARD_PLUGINS:
        return # JShelter should not modify the plugins that are the same in all conformant browsers
    if expected.navigator.plugins['count'][browser.type] == 'IGNORE':
        return
    elif expected.navigator.plugins['value'][browser.type] == 'REAL VALUE':
        assert navigator['plugins'] == browser.real.navigator.plugins
    elif expected.navigator.plugins['value'][browser.type] == 'EMPTY':
        assert not navigator['plugins']
    else:
        assert navigator['plugins'] != browser.real.navigator.plugins

# See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mimeTypes
LIVING_STANDARD_MIME_TYPES = [
            {'description': 'Portable Document Format', 'enabledPlugin': 'PDF Viewer', 'suffixes':
             'pdf', 'type': 'application/pdf'},
            {'description': 'Portable Document Format', 'enabledPlugin': 'PDF Viewer', 'suffixes':
             'pdf', 'type': 'text/pdf'},
        ]

## Test mimeTypes
def test_mime_types(browser, navigator, expected):
    if navigator['mimeTypes'] == LIVING_STANDARD_MIME_TYPES and browser.real.navigator.mimeTypes == LIVING_STANDARD_MIME_TYPES:
        return # JShelter should not modify the plugins that are the same in all conformant browsers
    if expected.navigator.mimeTypes == 'IGNORE':
        return
    elif expected.navigator.mimeTypes == 'EMPTY':
        assert navigator['mimeTypes'] == []
    elif expected.navigator.mimeTypes == 'SPOOF VALUE':
        if browser.real.navigator.mimeTypes == []:
            assert navigator['mimeTypes'] == []
        else:
            assert navigator['mimeTypes'] != browser.real.navigator.mimeTypes
    else:
        assert navigator['mimeTypes'] == browser.real.navigator.mimeTypes
