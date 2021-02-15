# Run unit tests

## on Linux

1. Install NodeJS ([https://nodejs.org]()).
1. Install `jq` and another necessary tools (e.g. `sed`).
1. Open Terminal.
1. Run `npm install`.
1. Run `npm test`.

## on Windows

1. Install Windows Subsystem for Linux (WSL): https://docs.microsoft.com/en-us/windows/wsl/install-win10.
1. Convert EOL in the script *./start_unit_tests.sh* from Windows (CR LF) to Unix (LF) - you can use the tool `dos2unix` in WSL to convert CR LF to LF.
1. Follow the instructions for Linux. Install NodeJS and run the following commands in WSL.

# Add new unit tests

## if a test set already exists

If a test set already exists for the target modul (e.g. a test set *background_tests.js* for the *background.js* file),
you can add your own tests to the test script (e.g. to the *background_tests.js* file).

You may need to update the requirements in the global configuration (*./config/global.json* file).
Open the global configuration file for editing and find the configuration of the target script (according to the `name` property).
Add the necessary requirements to the `src_script_requirements` and `test_script_requirements` sections.

## if a test set does not already exists

If a test set does not already exists for the target modul (e.g. a test set *background_tests.js* for the *background.js* file),
create new file (e.g. *background_tests.js* file) in the *./tests* directory.
It is recommended to create a new test script by copying any existing test script, deleting its tests, and creating new ones.
Not to create an empty file and start writing all its content.

When a new test script is created, add a new entry to the global configuration (*./config/global.json* file).
The new entry must be created according to the example (*./config/global-example.json* file) and schema (*./config/global-schema.json* file).
