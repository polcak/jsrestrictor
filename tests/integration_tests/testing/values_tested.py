#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
#  Copyright (C) 2021  Matus Svancar
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
                 oscpu,
                 plugins,
                 mimeTypes):
        self.userAgent = user_agent
        self.appVersion = app_version
        self.platform = platform
        self.vendor = vendor
        self.language = language
        self.languages = languages
        self.doNotTrack = do_not_track
        self.cookieEnabled = cookie_enabled
        self.oscpu = oscpu
        self.plugins = plugins
        self.mimeTypes = mimeTypes


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
                 hardware_concurrency,
                 IOdevices):
        self.deviceMemory = device_memory
        self.hardwareConcurrency = hardware_concurrency
        self.IOdevices = IOdevices

## Variables about audio that are checked during testing.
class Audio:
    def __init__(self,
                 get_channel,
                 copy_channel,
                 byte_time_domain,
                 float_time_domain,
                 byte_frequency,
                 float_frequency):
        self.get_channel = get_channel
        self.copy_channel = copy_channel
        self.byte_time_domain = byte_time_domain
        self.float_time_domain = float_time_domain
        self.byte_frequency = byte_frequency
        self.float_frequency = float_frequency

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
                 plugins,
                 mimeTypes,

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
                 IOdevices,

                 get_channel,
                 copy_channel,
                 byte_time_domain,
                 float_time_domain,
                 byte_frequency,
                 float_frequency,

                 referrer,
                 time,
                 performance,
                 protect_canvas,

                 canvas_imageData,
                 canvas_dataURL,
                 canvas_blob,
                 canvas_point_path,
                 canvas_point_stroke,

                 webgl_parameters,

                 webgl_precisions,
                 webgl_pixels,
                 webgl_dataURL,

                 worker,

                 methods_toString
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
            oscpu,
            plugins,
            mimeTypes
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
            hardware_concurrency,
            IOdevices
        )
        self.audio = Audio(
            get_channel,
            copy_channel,
            byte_time_domain,
            float_time_domain,
            byte_frequency,
            float_frequency
        )

        self.referrer = referrer
        self.time = time
        self.performance = performance
        self.protect_canvas = protect_canvas
        self.canvas_imageData = canvas_imageData
        self.canvas_dataURL = canvas_dataURL
        self.canvas_blob = canvas_blob
        self.canvas_point_path = canvas_point_path
        self.canvas_point_stroke = canvas_point_stroke
        self.webgl_parameters = webgl_parameters
        self.webgl_precisions = webgl_precisions
        self.webgl_pixels = webgl_pixels
        self.webgl_dataURL = webgl_dataURL
        self.worker = worker
        self.methods_toString = methods_toString
