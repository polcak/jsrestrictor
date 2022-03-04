#!/bin/bash

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

# Go to root directory of JSR project.
cd ../../../

# Set executable permission.
chmod +x ./fix_manifest.sh

# Clean previous build.
make clean

# Build.
make

# Create directory for JSR package if does not exists.
mkdir -p ./tests/common_files/JSR

# Create xpi package of JSR for Mozilla Firefox from zip archive created by make.
cp -f ./firefox_JSR.zip ./tests/common_files/JSR/firefox_JSR.xpi

# Create crx package of JSR for Google Chrome from source files.
google-chrome --pack-extension=./chrome_JSR >/dev/null 2>&1

# Remove unnecessary file created during crx package creating.
rm -rf ./chrome_JSR.pem

# Move crx package of JSR to right location (same as xpi package of JSR).
mv -f ./chrome_JSR.crx ./tests/common_files/JSR/chrome_JSR.crx

# Go back to common scripts directory.
cd ./tests/common_files/scripts
