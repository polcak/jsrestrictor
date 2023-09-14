Title: Instructions on how to run integration tests

JShelter's integration tests automatically verify that JShelter wraps the supported JavaScript APIs and does not affect other attributes. You need to set up your test environment before the first test run!

### SET UP TEST ENVIRONMENT

#### Install required programs and tools

The integration tests depend on the following packages:

* [Python 3.5+](https://www.python.org/downloads/)
* [Python package `pytest`](https://pypi.org/project/pytest/)
* [Python package `selenium`](https://pypi.org/project/selenium/)
* [Google Chrome](https://www.google.com/chrome/) - Chromium also work.
* Mozilla Firefox - Be careful, [ESR](https://www.mozilla.org/en-US/firefox/all/#product-desktop-esr), [Developer](https://www.mozilla.org/en-US/firefox/developer/), or [Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly) edition are required. The standard edition is not supported.
* [Web browser drivers](#webdrivers), see below

A [web browser driver](#webdrivers) selects the installed version of the web browser. One option is to install only a single version of each browser. The web browser's profiles must not have JShelter installed. The testing script installs JShelter by itself. We suggest that you use a separate profile for testing.

##### How to install Mozilla Firefox on Linux

We recommend downloading Firefox binaries from the [ESR](https://www.mozilla.org/en-US/firefox/all/#product-desktop-esr), [Developer](https://www.mozilla.org/en-US/firefox/developer/), or [Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly) channels to a local directories. Set `firefox_binary_location` in the test configuration accordingly.

In Ubuntu, you can install ESR following:

```
sudo add-apt-repository ppa:jonathonf/firefox-esr
sudo apt-get update
sudo apt-get install firefox-esr
```

#### Setup web browsers

Open Mozilla Firefox ESR and change preference `xpinstall.signatures.required` to `false` in the Firefox Configuration Editor (`about:config` page).
You can follow [official Mozilla support](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox#w_what-are-my-options-if-i-want-to-use-an-unsigned-add-on-advanced-users).

Open [testing page](https://polcak.github.io/jsrestrictor/test/test.html) and click the button *Show GPS data*. Firefox will ask you if you want to enable the page to access the location. Check the option *Remember this decision* and then click *Allow*.

The default configuration of Google Chrome is sufficient for integration tests, so the Chrome settings do not need to be changed.

#### <a name="webdrivers">Download web browser drivers</a>

Selenium needs web browser drivers to control the browser. If the Selenium drivers are not in your package repository or you do not want to use drivers from your repository, download the web browser drivers for your web browsers - Google Chrome and Mozilla Firefox - and your platform - Windows and Linux.

Download the ChromeDriver from [download page](https://chromedriver.chromium.org/downloads) for Google Chrome.
Select the version corresponding to the version of your Google Chrome web browser.
Download the correct ChromeDriver to folder `../common_files/webbrowser_drivers` with the name `chromedriver.exe` (for Windows) or `chromedriver` (for Linux). If you download an incompatible version, you will see an error during the initialization of the tests.

Download the GeckoDriver from [download page](https://github.com/mozilla/geckodriver/releases) for Mozilla Firefox.
Select the version corresponding to the version of your Mozilla Firefox web browser (typically the newest version).
Download the correct GeckoDriver to folder `../common_files/webbrowser_drivers` with the name `geckodriver.exe` (for Windows) or `geckodriver` (for Linux). If you download an incompatible version, you will see an error during starting tests.

#### Integration tests' configuration

You can change selected browsers, their profiles, and tested JShelter levels by modifying the file `./testing/configuration.py`.

### RUN TESTS

#### on Windows OS

1. Install Windows Subsystem for Linux (WSL): https://docs.microsoft.com/en-us/windows/wsl/install-win10.

2. Convert EOL in the scripts `fix_manifest.sh` (in the root directory of JShelter project) and `nscl/include.sh` from Windows (CR LF) to Unix (LF) - you can use the tool `dos2unix` in WSL to convert CR LF to LF.

3. Open the root directory of JShelter project in WSL and run the command `make`.

4. Open PowerShell in folder *integration_tests* and run command: `.\start_integration_tests.ps1`

The script may ask you for the path into the directory where the file chrome.exe is stored and where the files of the Firefox ESR default profile are stored.

The default location of chrome.exe is: `C:\Program Files (x86)\Google\Chrome\Application`
The default location of Firefox ESR profile is: `C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\<profilename>.default-esr`

If the script does not find the needed files in the default locations, it prompts you to insert the path.

When script execution starts for the first time, OS Windows may ask you to allow Firewall Exception for this script (for Python). Click *Allow*.


#### on Linux OS

Open Terminal in folder *integration_tests* and run command: `./start_integration_tests.sh`

The script may ask you for the path of the Firefox ESR default profile.
The default location of the default profile is: `/home/<username>/.mozilla/firefox/<profilename>.default-esr`

If the script does not find the needed files in the default location, it prompts you for the path.
