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

## Module define class which contains variables that are tested.


## Variables about navigator that are checked during testing.
class Navigator:
    def __init__(self,
                 user_agent,
                 app_version,
                 platform,
                 vendor,
                 language,
                 languages,
                 do_not_track,
                 cookie_enabled,
                 oscpu):
        self.userAgent = user_agent
        self.appVersion = app_version
        self.platform = platform
        self.vendor = vendor
        self.language = language
        self.languages = languages
        self.doNotTrack = do_not_track
        self.cookieEnabled = cookie_enabled
        self.oscpu = oscpu


## Variables about geolocation that are checked during testing.
class Geolocation:
    def __init__(self,
                 accuracy,
                 altitude,
                 altitude_accurac,
                 heading,
                 latitude,
                 longitude,
                 speed,
                 timestamp):
        self.accuracy = accuracy
        self.altitude = altitude
        self.altitudeAccurac = altitude_accurac
        self.heading = heading
        self.latitude = latitude
        self.longitude = longitude
        self.speed = speed
        self.timestamp = timestamp


## Variables about device that are checked during testing.
class Device:
    def __init__(self,
                 device_memory,
                 hardware_concurrency):
        self.deviceMemory = device_memory
        self.hardwareConcurrency = hardware_concurrency


## All variables that are checked during testing.
class TestedValues:
    def __init__(self,
                 user_agent,
                 app_version,
                 platform,
                 vendor,
                 language,
                 languages,
                 do_not_track,
                 cookie_enabled,
                 oscpu,

                 gps_accuracy,
                 altitude,
                 altitude_accurac,
                 heading,
                 latitude,
                 longitude,
                 speed,
                 timestamp,

                 device_memory,
                 hardware_concurrency,

                 referrer,
                 time,
                 performance,
                 protect_canvas
                 ):
        self.navigator = Navigator(
            user_agent,
            app_version,
            platform,
            vendor,
            language,
            languages,
            do_not_track,
            cookie_enabled,
            oscpu
        )
        self.geolocation = Geolocation(
            gps_accuracy,
            altitude,
            altitude_accurac,
            heading,
            latitude,
            longitude,
            speed,
            timestamp
        )
        self.device = Device(
            device_memory,
            hardware_concurrency
        )
        self.referrer = referrer
        self.time = time
        self.performance = performance
        self.protect_canvas = protect_canvas
