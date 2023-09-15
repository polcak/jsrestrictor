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
	echo "$confBackup" > "./testing/configuration.py"
	retVal=$?
	if [ $retVal -ne 0 ]; then
		echo "\"${last_command}\" command failed with exit code $?."
		echo
		echo "An error noticed during setup the test environment. Integration testing can not be started. Look at the README file and follow instructions to run the setup again."
	fi
	exit $retVal
}
# exit when any command fails
set -euo pipefail
# Call function before exit caused by error.
trap beforeExit EXIT

# Backup configuration.py file if error happen.
confBackup=$(<./testing/configuration.py)

# Go to common scripts directory.
cd ../common_files/scripts

# Set executable permissions.
chmod +x ./build_JSR_package.sh
if [ -f ../webbrowser_drivers/chromedriver ]
then
	chmod +x ../webbrowser_drivers/chromedriver
fi
if [ -f ../webbrowser_drivers/geckodriver ]
then
	chmod +x ../webbrowser_drivers/geckodriver
fi

# Run script build_JSR_package.sh
./build_JSR_package.sh
if [ "$?" != 0 ]; then
		echo "ERROR!!! Please check errors above" >&2
		exit
fi

# Go to JSR project root directory directory and save PWD.
cd ../../../
JSRPath=`pwd`

# Go back to integration_tests directory.
cd ./tests/integration_tests

# Automatically set JSR project root directory path in configuration.py.
sed -i "s@<<JSR_project_root_directory_path>>@${JSRPath}@g" ./testing/configuration.py

# Get path to Firefox ESR default profile.
FFProfiles=$(realpath ~/.mozilla/firefox)
set +euo pipefail
FFProfilesItemsNumber=$(ls -dq ${FFProfiles}/*default-esr* | wc -l)
set -euo pipefail
if [ $FFProfilesItemsNumber == 1 ]; then
	FFProfile=$(ls -dq ${FFProfiles}/*default-esr*)
elif [ `grep "<<Firefox_ESR_default_profile>>" ./testing/configuration.py | wc -l` -eq 0 ]; then
	# Profile already set
	FFProfile="config"
else
	read -p 'Enter path into Firefox ESR default profile directory. It is typically /home/<username>/.mozilla/firefox/<profilename>.default-esr: ' FFProfile
	ls -dq ${FFProfile}
fi

# Set JSR project root directory path in configuration.py.
sed -i "s@<<Firefox_ESR_default_profile>>@${FFProfile}@g" ./testing/configuration.py

# Remove all exe suffix of binary file names. Linux binaries will be then use.
sed -i "s@.exe@@g" ./testing/configuration.py

# Start testing if everything ok.
# Stop handling errors.
set +euo pipefail
echo
echo "No error noticed during setup the test environment. Integration testing is starting..."
python3 ./testing/start.py
