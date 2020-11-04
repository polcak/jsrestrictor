Integration tests for web browser extension Javascript Restrictor automatically verify that
required JavaScript API is wrapped and conversely, that non-wrapped JavaScript API provides real values.

It is necessary to partially set up manually a test environment before the first test run!



# SET UP TEST ENVIRONMENT

## Install required programs and tools

These programs and tools are required to be installed:
* [Python 3.5+](https://www.python.org/downloads/)
* [Python package `pytest`](https://pypi.org/project/pytest/)
* [Python package `selenium`](https://pypi.org/project/selenium/)
* [Google Chrome](https://www.google.com/chrome/) - Install really Google Chrome, Chromium is not supported.
* [Mozilla Firefox ESR](https://www.mozilla.org/en-US/firefox/all/#product-desktop-esr) - Be careful, ESR (eventually Developer or Nightly edition) is required. Standard edition is not supported.

No other versions of Google Chrome and especially Mozilla Firefox may be installed on the same machine.
If you already have installed Mozilla Firefox Standard Edition, uninstall it before instalation of Mozilla Firefox ESR starts.
Web browser driver automatically selects the installed version of the web browser so it is better to have installed only one correct version of each web browser.
Web browsers may not have installed JSR extension. Python script will install it itself before running tests.
If you already have installed JSR in web browser, delete JSR setting from Options page and then remove JSR extension from browser.

### How to install Mozilla Firefox ESR on Linux
If you have problems with installing Mozzila Firefox ESR on Linux, try this way:
```
sudo add-apt-repository ppa:jonathonf/firefox-esr
sudo apt-get update
sudo apt-get install firefox-esr
```
Or download archiv with Firefox ESR from [official page](https://www.mozilla.org/en-US/firefox/all/#product-desktop-esr), extract archiv to `/opt/firefox`
and create a symbolic link `firefox` in `/usr/bin` pointing to the `/opt/firefox/firefox`.
In case of problems with installing Firefox ESR, follow [this tutorial](https://libre-software.net/how-to-install-firefox-on-ubuntu-linux-mint/#a_install_firefox).


## Setup web browsers

Open Mozilla Firefox ESR and change preference `xpinstall.signatures.required` to `false` in the Firefox Configuration Editor (`about:config` page).
You can follow [official Mozilla support](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox#w_what-are-my-options-if-i-want-to-use-an-unsigned-add-on-advanced-users).

Open [testing page](https://polcak.github.io/jsrestrictor/test/test.html) and click on button *Show GPS data*.
Firefox will ask you if you want to enable the page to access location. Check option *Remember this decision* and then click *Allow*.

Google Chrome is already prepared in default state for testing JSR, the Chrome settings do not need to be changed.


## Download web browser drivers

Download web browser drivers needed for controlling web browsers by tests. Download drivers for both web browsers - Google Chrome and Mozilla Firefox - and for both platform - Windows and Linux.

For Google Chrome download the ChromeDriver from [download page](https://chromedriver.chromium.org/downloads).
Select the version coresponding to the version of your Google Chrome web browser. If you download an incompatible version, you will see an error during starting tests.
Download the correct ChromeDriver to folder `../common_files/webbrowser_drivers` with name `chromedriver.exe` (for Windows) or `chromedriver` (for Linux).

For Mozilla Firefox download the GeckoDriver from [download page](https://github.com/mozilla/geckodriver/releases).
Select the version coresponding to the version of your Mozilla Firefox web browser (typically the newest version). If you download an incompatible version, you will see an error during starting tests.
Download the correct GeckoDriver to folder `../common_files/webbrowser_drivers` with name `geckodriver.exe` (for Windows) or `geckodriver` (for Linux).



# RUN TESTS

## on Windows OS

Open PowerShell in folder *integration_tests* and run command: `.\setup_buildJSR_runTests.ps1`

Script may ask you for the path into directory, where the file chrome.exe is stored and where the files of Firefox ESR default profile are stored.

Default location of directory, where chrome.exe is stored, is: `C:\Program Files (x86)\Google\Chrome\Application`
Default location of directory, where the files of Firefox ESR default profile are stored, is: `C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\<profilename>.default-esr`

If script does not find needed files into default locations, it will prompts you to input path, where the file(s) is/are saved.

When script execution starts for the first time, OS Windows may ask you to allow Firewall Exception for this script (for Python). Click *Allow*.


## on Linux OS

Open Terminal in folder *integration_tests* and run command: `./setup_buildJSR_runTests.sh`

Script may ask you for the path into directory, where the files of Firefox ESR default profile are stored.

Default location of directory, where the files of Firefox ESR default profile are stored, is: `/home/<username>/.mozilla/firefox/<profilename>.default-esr`

If script does not find needed files into default location, it will prompts you to input path into directory, where the files are saved.


## Integration tests configuration

You can change selected browsers, which integration tests run in, and you can change JSR levels, which are tested, by modifing the file `./testing/configuration.py`.
