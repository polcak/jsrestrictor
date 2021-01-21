#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from values_tested import TestedValues
from web_browser_type import BrowserType


## Module contains definitions for expected values of default levels od JSR.
#
#  Expected values are comparing during testing with current values of variables.
#  'REAL VALUE' means that current value should not be spoofed.
#  'EXACTLY' means that current value should not be rounded
#       (the small deviation caused by the script runtime is neglected)
#  This module can be edited when definition of default levels will be changed.


## Expected values for default level 0 of JSR.
level0 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 'EXACTLY'},
    altitude={'value': 'REAL VALUE',
              'accuracy': 'EXACTLY'},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 'EXACTLY'},
    heading={'value': 'REAL VALUE',
             'accuracy': 'EXACTLY'},
    latitude={'value': 'REAL VALUE',
              'accuracy': 'EXACTLY'},
    longitude={'value': 'REAL VALUE',
               'accuracy': 'EXACTLY'},
    speed={'value': 'REAL VALUE',
           'accuracy': 'EXACTLY'},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 'EXACTLY'},
    device_memory={BrowserType.FIREFOX: 'REAL VALUE',
                   BrowserType.CHROME: 'REAL VALUE'},
    hardware_concurrency='REAL VALUE',
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 'EXACTLY'},
    performance={'value': 'REAL VALUE',
                 'accuracy': 'EXACTLY'},
    protect_canvas=False
)

## Expected values for default level 1 of JSR.
level1 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 10},
    altitude={'value': 'REAL VALUE',
              'accuracy': 10},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 10},
    heading={'value': 'REAL VALUE',
             'accuracy': 10},
    latitude={'value': 'REAL VALUE',
              'accuracy': 0.01},
    longitude={'value': 'REAL VALUE',
               'accuracy': 0.01},
    speed={'value': 'REAL VALUE',
           'accuracy': 10},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 0.01},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.01},
    performance={'value': 'REAL VALUE',
                 'accuracy': 10},
    protect_canvas=False
)

## Expected values for default level 2 of JSR.
level2 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 100},
    altitude={'value': 'REAL VALUE',
              'accuracy': 100},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 100},
    heading={'value': 'REAL VALUE',
             'accuracy': 100},
    latitude={'value': 'REAL VALUE',
              'accuracy': 0.1},
    longitude={'value': 'REAL VALUE',
               'accuracy': 0.1},
    speed={'value': 'REAL VALUE',
           'accuracy': 100},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 0.1},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.1},
    performance={'value': 'REAL VALUE',
                 'accuracy': 100},
    protect_canvas=True
)

## Expected values for default level 3 of JSR.
level3 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': '0',
                  'accuracy': 'EXACTLY'},
    altitude={'value': '0',
              'accuracy': 'EXACTLY'},
    altitude_accurac={'value': '0',
                      'accuracy': 'EXACTLY'},
    heading={'value': 'REAL VALUE',
             'accuracy': 100},
    latitude={'value': 'REAL VALUE',
              'accuracy': 0.1},
    longitude={'value': 'REAL VALUE',
               'accuracy': 0.1},
    speed={'value': 'REAL VALUE',
           'accuracy': 100},
    timestamp={'value': '0',
               'accuracy': 'EXACTLY'},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 1.0},
    performance={'value': 'REAL VALUE',
                 'accuracy': 1000},
    protect_canvas=True
)
