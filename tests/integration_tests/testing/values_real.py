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
import values_getters


## Init and return real values.
#
#  Get values from browser without JSR installed.
#  Object of class TestedValues is created and returned.
#  Returned object contains real values that are compared during testing with values from browser with JSR installed.
def init(driver):
    position = values_getters.get_position(driver)
    navigator = values_getters.get_navigator(driver)
    device = values_getters.get_device(driver)
    return TestedValues(
        user_agent=navigator['userAgent'],
        app_version=navigator['appVersion'],
        platform=navigator['platform'],
        vendor=navigator['vendor'],
        language=navigator['language'],
        languages=navigator['languages'],
        cookie_enabled=navigator['cookieEnabled'],
        do_not_track=navigator['doNotTrack'],
        oscpu=navigator['oscpu'],
        gps_accuracy=position['accuracy'],
        altitude=position['altitude'],
        altitude_accurac=position['altitudeaccurac'],
        heading=position['heading'],
        latitude=position['latitude'],
        longitude=position['longitude'],
        speed=position['speed'],
        timestamp=None,
        device_memory=device['deviceMemory'],
        hardware_concurrency=device['hardwareConcurrency'],
        referrer=values_getters.get_referrer(driver),
        time=None,
        time_toString=values_getters.get_time_toString(driver),
        performance=None,
        performance_toString=values_getters.get_performance_toString(driver),
        protect_canvas=None
    )
