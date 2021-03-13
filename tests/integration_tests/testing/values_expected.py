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
    gps_toString='REAL VALUE',
    device_memory={BrowserType.FIREFOX: 'REAL VALUE',
                   BrowserType.CHROME: 'REAL VALUE'},
    hardware_concurrency='REAL VALUE',
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 'EXACTLY'},
    time_toString='REAL VALUE',
    performance={'value': 'REAL VALUE',
                 'accuracy': 'EXACTLY'},
    performance_toString='REAL VALUE',
    protect_canvas=False,
    canvas_toString='REAL VALUE'
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
    gps_toString='REAL VALUE',
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.01},
    time_toString='REAL VALUE',
    performance={'value': 'REAL VALUE',
                 'accuracy': 10},
    performance_toString='REAL VALUE',
    protect_canvas=False,
    canvas_toString='REAL VALUE'
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
    gps_toString='REAL VALUE',
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.1},
    time_toString='REAL VALUE',
    performance={'value': 'REAL VALUE',
                 'accuracy': 100},
    performance_toString='REAL VALUE',
    protect_canvas=True,
    canvas_toString='REAL VALUE'
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
    gps_toString='REAL VALUE',
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 1.0},
    time_toString='REAL VALUE',
    performance={'value': 'REAL VALUE',
                 'accuracy': 1},
    performance_toString='REAL VALUE',
    protect_canvas=True,
    canvas_toString='REAL VALUE'
)
