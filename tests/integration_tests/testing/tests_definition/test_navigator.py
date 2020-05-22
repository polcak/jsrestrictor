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
