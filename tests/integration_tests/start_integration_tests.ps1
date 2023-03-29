#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
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

$Error.clear()

# Backup configuration.py file if error happen.
$confBackup = Get-Content .\testing\configuration.py

# Go to common scripts directory.
cd ..\common_files\scripts

# Run script build_JSR_package.ps1
.\build_JSR_package.ps1

# Go to JSR project root directory directory and save PWD.
cd ..\..\..\
$JSRPath = Get-Location

# Go back to integration_tests directory.
cd .\tests\integration_tests

# Get path to Firefox ESR default profile.
$FFProfiles = "${env:USERPROFILE}\AppData\Roaming\Mozilla\Firefox\Profiles"
$FFProfilesItems = @(Get-ChildItem $FFProfiles -Filter "*default-esr*" -Directory)
if ($FFProfilesItems.length -eq 1) {
	$FFProfile = $FFProfilesItems[0].Fullname
}
else {
	Write-Host
	$FFProfile = Read-Host -Prompt 'Enter path into Firefox ESR default profile directory. It is typically C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\<profilename>.default-esr'
	if (-Not (Test-Path $FFProfile -PathType Container)) {
		Write-Error -Message "Entered path ${FFProfile} is not valid."
	}
}

# Automatically set JShelter project root directory path and path to Firefox ESR default profile in configuration.py.
(Get-Content .\testing\configuration.py).replace("<<JSR_project_root_directory_path>>", $JSRPath.ToString().replace('\', '/')).replace("<<Firefox_ESR_default_profile>>", $FFProfile.ToString().replace('\', '/')) | Set-Content .\testing\configuration.py -Encoding "UTF8"

# Start testing if everything ok.
Write-Host
# Handle errors.
if($Error.length -gt 0)
{
	Write-Host "An error noticed during setup the test environment. Integration testing can not be started. Look at the README file and follow instructions to run the setup again."
}
else {
	Write-Host "No error noticed during setup the test environment. Integration testing is starting..."
	python ./testing/start.py
}
$confBackup | Out-File .\testing\configuration.py -Force -Encoding "UTF8"
