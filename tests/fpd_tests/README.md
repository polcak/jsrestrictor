# Instruction how to run FPD tests

Fingerprint Detector (FPD) tests for web browser extension JShelter verify that required JavaScript APIs
are wrapped and all specified accesses to them are properly logged according to evaluating heuristics.

# SET UP TEST ENVIRONMENT

## Install required programs and tools

These programs and tools are required to be installed:

* [PHP](https://www.php.net/downloads/)
* Browser supported by JShelter:
    * [Google Chrome](https://www.google.com/chrome/)
    * [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/new/)
* [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (only for Windows)

# RUN TESTS
    
1. Open Terminal/WSL in folder `fpd_tests` and run command: `.\start_fpd_tests.sh` (do not close the terminal, testing server is running). Note that the scripts modifies local filese in the local git repository. It also builds JShelter that has a modified FPD that communicates with the outside work. **DO NOT USE** that version outside this test.
2. Open browser and import the extension.
	* Firefox:
        1. Open `about:debugging` in the URL bar.
        2. Click `This Firefox`.
        3. Click `Load Temporary Add-on`.
		4. Import the `jshelter_firefox.zip` archive.
	* Chromium-based browsers:
		1. Open `chrome://extensions`.
		2. Enable developper mode.
		3. Click `Load unpacked`.
		4. Import the `jshelter_chrome/` directory.
3. Visit `localhost:8000` and choose test from menu.
4. **IMPORTANT:** After testing, use *Ctrl+C* in Terminal/WSL to close testing server and revert extension files. The script removes the build files with the modified FPD to prevent accidental leaks of the modified JShelter.

# TEST CONFIGURATION

## Description

The test is focused on verifying how FPD module wraps browser APIs and counts accesses to them. It uses FPD configuration files (located in `/common/fp_config` folder) to enumerate all supposedly wrapped APIs. Afterwards, the test creates local page that tries to access all APIs from previous enumeration. Number of accesses to each API is compared to number of logged accesses by the extension. Test results are shown in the form of statistics about mentioned comparison and can be used to discover wrongly wrapped or unsupported APIs. You can also change protection levels of the extension during test to try different FPD configurations.

The default behaviour is set to use files from `/common/fp_config` folder to enumerate APIs. You can also use different files with the same syntax and naming convention (etc. custom `wrappers-lvl_X.json` files). Just copy these files to `fpd_tests` folder to use them for testing instead of default ones.

### Test results

The results consist of these stats:

* *PASSED* - Number of APIs with successful comparison of accesses.
* *FAILED* - Number of APIs with failed comparison of accesses.
* *NOT WRAPPED* - Number of not wrapped APIs by the current level of the extension.
* *NOT SUPPORTED* - Number of APIs that are not supported by used browser.

Below these stats are all tested APIs with type of access (get, set, call) and comparison numbers. Left number represents number of accesses from page to given API and right number represents number of accesses logged by the extension. Not wrapped and unsupported APIs are grayed out and crossed.

### Test variants

* *Direct* - Direct access to APIs from included page script.
* *Iframe* - Access to APIs using script inside *iframe* element.
* *Worker* - Access to APIs using script included in the worker thread.

## Adding custom tests

You can add custom test scripts to describe more complex scenarios with these simple steps:

* Create a new *JavaScript* file inside `fpd_tests/tests` folder (`"resources.js"` is reserved name, **do not use it**).
* Create top level functions which will be used for testing according to these rules:
    * Name of the test function has to begin with prefix `test_` and contain `wrappers` as first parameter.
    * Body of the test function wrap into try-catch construction (do not count access if exception occurs).
    * Call method `addWrapper(wrappers, *api_name_string*, *access_type_string*, *access_number_int*)` at the end of the function test body for every accessed API that should be wrapped and counted for testing.

Example of custom test script is available in *tests/fpd_tests/tests/custom.js*.
