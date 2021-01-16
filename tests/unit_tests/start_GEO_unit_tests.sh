#!/bin/bash

#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
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

# Create directory ./tmp if not exists.
mkdir -p ./tmp
# Remove custom namespace.
sed -e 's/(function() {//' -e 's/})();//' -e 's/successCallback/return/' ../../common/wrappingS-GEO.js > ./tmp/wrappingS-GEO.js

echo Unit tests for GEO prepared. Now open file ./SpecRunners/SpecRunner_GEO.html in your favorite web-browser to run GEO unit tests.