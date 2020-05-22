# Go to root directory of JSR project.
cd ..\

# Clean previous build.
.\MakeForWin.ps1 clean

# Build.
.\MakeForWin.ps1

# Create directory for JSR package if does not exists. Like "touch" on Linux.
New-Item -ItemType Directory -Path ".\tests\common_files\JSR" -Force

# Create xpi package of JSR for Mozilla Firefox from zip archive created by make.
Copy-Item ".\firefox_JSR.zip" -Destination ".\tests\common_files\JSR\firefox_JSR.xpi" -Force

# Create crx package of JSR for Google Chrome from source files.
$JSRPath = Get-Location
cd "C:\Program Files (x86)\Google\Chrome\Application"
#  | Out-Null force PowerShell to wait when packaging by Chorme is completed.
.\chrome.exe --pack-extension=$JSRPath\chrome_JSR | Out-Null
cd $JSRPath

# Remove unnecessary file created during crx package creating.
Remove-Item ".\chrome_JSR.pem" -Recurse -Force

# Move crx package of JSR to right location (same as xpi package of JSR).
Move-Item ".\chrome_JSR.crx" -Destination .\tests\common_files\JSR\chrome_JSR.crx -Force

# Go back to test directory.
cd .\tests\

#Automatically set JSR project root directory path in configuration.py.
(Get-Content .\integration_tests\configuration.py).replace("<<JSR_project_root_directory_path>>", $JSRPath.ToString().replace('\', '/')) | Set-Content .\integration_tests\configuration.py
