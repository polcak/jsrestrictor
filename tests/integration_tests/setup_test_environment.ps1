# Go to common scripts directory.
cd ..\common_files\scripts

# Run script build_JSR_package.ps1
.\build_JSR_package.ps1

# Go to JSR project root directory directory and save PWD.
cd ..\..\..\
$JSRPath = Get-Location

# Go back to integration_tests directory.
cd .\tests\integration_tests

# Automatically set JSR project root directory path in configuration.py.
(Get-Content .\testing\configuration.py).replace("<<JSR_project_root_directory_path>>", $JSRPath.ToString().replace('\', '/')) | Set-Content .\testing\configuration.py -Encoding "UTF8"
