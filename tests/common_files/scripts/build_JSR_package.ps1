#
#  JShelter is a browser extension which increases level
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

# Go to root directory of JShelter project.
cd ..\..\..\

# Create directory for JShelter package if does not exists. Like "touch" on Linux.
New-Item -ItemType Directory -Path ".\tests\common_files\JShelter" -Force

# Create xpi package of JShelter for Mozilla Firefox from zip archive created by make.
Copy-Item ".\jshelter_firefox.zip" -Destination ".\tests\common_files\JShelter\firefox.xpi" -Force

$JShelterPath = Get-Location

# Get path to chrome.exe.
$Chrome = "C:\Program Files\Google\Chrome\Application"
if (-Not (Test-Path $Chrome\chrome.exe -PathType Leaf)) {
	Write-Host
	$Chrome = Read-Host -Prompt 'Enter path into directory, where is chrome.exe stored'
	if (-Not (Test-Path $Chrome\chrome.exe -PathType Leaf)) {
		Write-Error -Message "Entered path ${Chrome} is not valid path into directory."
	}
}
cd $Chrome

# Create crx package of JShelter for Google Chrome from source files.
#  | Out-Null force PowerShell to wait when packaging by Chorme is completed.
.\chrome.exe --pack-extension=$JShelterPath\build\chrome | Out-Null
cd $JShelterPath

# Remove unnecessary file created during crx package creating.
Remove-Item ".\build\chrome.pem" -Recurse -Force

# Move crx package of JSR to right location (same as xpi package of JShelter).
Move-Item ".\build\chrome.crx" -Destination .\tests\common_files\JShelter\chrome.crx -Force

# Go back to common scripts directory.
cd .\tests\common_files\scripts
