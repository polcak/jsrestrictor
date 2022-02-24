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

from os import listdir
import cv2
import numpy as np

import io_funcs as io


## Build header of output HTML file.
def html_header():
    return "<html>" \
           "<head><title>Screenshots comparison</title>" \
           "<style>" \
           "body {background-color: white;} " \
           "img {width: 100%;} " \
           "td {width: 50%;  border: 1px solid black; padding: 5px; vertical-align: bottom;} " \
           "th {padding-top: 10px;} " \
           "table {width: 100%; text-align: center; border-collapse: collapse; background-color: rgb(248,248,248);} " \
           ".differences-table {width: 50%; margin-left: 25%; margin-right: 25%;} " \
           ".treshold-cointainer {width: 100%; text-align: center;} " \
           ".slider {width: 85%; display: block; margin: auto;} " \
           "h2 {float: left; margin: 10px;} " \
           "h3 {text-align: right; margin: 10px;} " \
           ".site-container {margin: 50px 0px 30px 0px; border: 1px solid black;} " \
           ".site-container-td {border: none; padding: 10px;} " \
           ".site-container-header {background-color: rgb(240,240,240); border-bottom: 1px solid black;} " \
           ".visible {display: table;} " \
           ".hidden {display: none;} " \
           "#treshold-value {font-weight: bold;} " \
           "</style>" \
           "</head>" \
           '<body><h1>Screenshots comparison</h1>' \
           '<div class="treshold-cointainer"><input type="range" min="0" max="255" value="0" class="slider" id="threshold">' \
           '<p>The treshold for the mean value of pixels in the Differences image (Screenshots below treshold will not be shown on this page.): <span id="treshold-value"></span></p></div>'


## Build footer of output HTML file.
def html_footer():
    return "<br><br>" \
           "<script>" \
           "function hideIfUnderTreshold(item) {" \
           'var slider = document.getElementById("threshold");' \
           'if (parseFloat(item.getAttribute("mean_pixel_value_of_diff")) < slider.value) {' \
           'item.classList.remove("visible"); item.classList.add("hidden");}' \
           "}" \
           "function showIfNotUnderTreshold(item) {" \
           'var slider = document.getElementById("threshold");' \
           'if (!(parseFloat(item.getAttribute("mean_pixel_value_of_diff")) < slider.value)) {' \
           'item.classList.remove("hidden"); item.classList.add("visible");}' \
           "}" \
           'var slider = document.getElementById("threshold");' \
           'var slider_value = document.getElementById("treshold-value");' \
           'slider_value.innerHTML = slider.value;' \
           'slider.oninput = function() {' \
           'slider_value.innerHTML = this.value;' \
           'var visibleSites = Array.from(document.querySelectorAll(".site-container.visible"));' \
           'visibleSites.forEach(hideIfUnderTreshold);' \
           'var hiddenSites = Array.from(document.querySelectorAll(".site-container.hidden"));' \
           'hiddenSites.forEach(showIfNotUnderTreshold);' \
           '}' \
           "</script>" \
           "</body></html>"


## Build table with screenshots and diferences of screenshots for one site. Insert to output HTML file.
def build_site_screenshots_comparison(site, site_name, site_number, average_color_of_differences):
    output = '<table class="site-container visible" mean_pixel_value_of_diff="' + str(average_color_of_differences) + '"><tr class="site-container-header"><td class="site-container-td"><h2>' + str(site_number) +\
             ") "  + site_name + '</h2></td><td class="site-container-td"><h3>Mean pixel value in Differences image: ' + str(average_color_of_differences) + '</h3></td></tr><tr><td colspan="2" class="site-container-td"><table><tr><th>Without JShelter</th><th>With JShelter</th></tr>'
    output += '<tr><td><img src="' + site + '/without_jsr.png"></td><td><img src="' + site + '/with_jsr.png"></td></tr></table>'
    output += '<table class="differences-table"><tr><th>Differences</th></tr><tr><td><img src="' + site + '/differences.png"></td></tr></table></td></tr></table>'
    return output


## Create difference image between screenshot with JShelter and screenshot without JShelter by substracting
#  one image from another.
def create_differences_img(site):
    screen_without_jsr = cv2.imread("../data/screenshots/" + site + "/without_jsr.png")
    screen_with_jsr = cv2.imread("../data/screenshots/" + site + "/with_jsr.png")
    if screen_without_jsr is None or screen_with_jsr is None:
        return None
    differences = cv2.subtract(screen_with_jsr, screen_without_jsr)
    cv2.imwrite("../data/screenshots/" + site + "/differences.png", differences)
    return cv2.cvtColor(differences, cv2.COLOR_BGR2GRAY)


## Get mean pixel value of given image.
#  Round mean pixel value to given precision.
def get_rounded_mean_pixel_value(img, precision):
    if img is None:
        return None
    else:
        return round(np.mean(img), precision)


## Main function of screenshots analysis.
def main():
    io.delete_file_if_exists("../data/screenshots/screenshots_comparison.html")

    output = html_header()

    sites = list(filter(io.is_dir, listdir("../data/screenshots")))
    sites.sort(key=lambda x: int(x.split('_')[0]))
    j = 1
    sites_number = len(sites)
    if sites_number == 0:
        print("No screenshots for analysis found. Please, include getting screenshots to configuration and run getting data first.")
    for site in sites:
        site_name = site.split('_', 1)[1]
        print("Site " + str(j) + " of " + str(sites_number) + ": " + site_name)
        differences_gray = create_differences_img(site)
        mean_pixel_value_of_difference = get_rounded_mean_pixel_value(differences_gray, 3)
        output += build_site_screenshots_comparison(site, site_name, j, mean_pixel_value_of_difference)
        j += 1

    output += html_footer()
    io.write_file("../data/screenshots/screenshots_comparison.html", output)


if __name__ == "__main__":
    main()
