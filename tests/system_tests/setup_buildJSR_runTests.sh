#!/bin/bash

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

# Handle errors.
# Function called by trap before exit caused by error.
function beforeExit {
	if [ $retVal -ne 0 ]; then
		echo "\"${last_command}\" command failed with exit code $?."
		echo
		echo "An error noticed during setup the test environment. System tests can not be started. Look at the README file and follow instructions to run the setup again."
	fi
	exit $retVal
}
# exit when any command fails
set -euo pipefail
# Call function before exit caused by error.
trap beforeExit EXIT

# Go to common scripts directory.
cd ../common_files/scripts

# Set executable permissions.
chmod +x ./build_JSR_package.sh
chmod +x ../webbrowser_drivers/chromedriver

# Run script build_JSR_package.sh
./build_JSR_package.sh

# Go back to integration_tests directory.
cd ../../system_tests

# Start testing if everything ok.
# Stop handling errors.
set +euo pipefail
echo
echo "No error noticed during setup the test environment. System tests are starting..."
cd ./get_data
python3 ./start.py
cd ../analyze_data
python3 ./start_screenshots_analysis.py
python3 ./start_logs_analysis.py
cd ../
