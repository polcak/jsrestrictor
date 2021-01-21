#!/bin/bash

#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
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
