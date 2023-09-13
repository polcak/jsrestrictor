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

from values_tested import TestedValues
import values_getters


## Init and return real values.
#
#  Get values from browser without JShelter installed.
#  Object of class TestedValues is created and returned.
#  Returned object contains real values that are compared during testing with values from browser
#  with JShelter installed.
def init(driver):
    position = values_getters.get_position(driver)
    navigator = values_getters.get_navigator(driver)
    device = values_getters.get_device(driver)
    audio = values_getters.get_audio(driver)
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
        plugins=navigator['plugins'],
        mimeTypes=navigator['mimeTypes'],
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
        get_channel=audio['get_channel'],
        copy_channel=audio['copy_channel'],
        byte_time_domain=audio['byte_time_domain'],
        float_time_domain=audio['float_time_domain'],
        byte_frequency=audio['byte_frequency'],
        float_frequency=audio['float_frequency'],
        IOdevices=values_getters.get_IOdevices(driver),
        referrer=values_getters.get_referrer(driver),
        time=None,
        performance=None,
        protect_canvas=None,
        canvas_imageData=values_getters.get_imageData_canvas(driver,"canvasx"),
        canvas_dataURL=values_getters.get_dataURL_canvas(driver,"canvasx"),
        canvas_blob=values_getters.get_blob_canvas(driver,"canvasx"),
        canvas_point_path=None,
        canvas_point_stroke=None,
        webgl_parameters = values_getters.get_webgl_params(driver,"webglCanvas"),
        webgl_precisions=values_getters.get_webgl_precisions(driver,"webglCanvas"),
        webgl_pixels=values_getters.get_webgl_pixels(driver,"webglCanvas"),
        webgl_dataURL=values_getters.get_dataURL_canvas(driver,"webglCanvas"),
        worker = driver.execute_script("return window.Worker"),
        methods_toString=values_getters.get_methods_toString(driver)
    )
