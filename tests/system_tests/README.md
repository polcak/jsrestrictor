# Instruction how to run system tests

System tests for web browser extension JShelter automatically checks how
JShelter affets tested websites.

It is necessary to partially set up manually a test environment before the first test run!

# SET UP TEST ENVIRONMENT

## Install required programs and tools

These programs and tools are required to be installed:
* [Python 3.5+](https://www.python.org/downloads/)
* [Python package `numpy`](https://pypi.org/project/numpy/)
* [Python package `selenium`](https://pypi.org/project/selenium/)
* [Visual C++ build tools](http://go.microsoft.com/fwlink/?LinkId=691126&fixForIE=.exe.) - required by `python-Levenshtein` on Windows.
  [More information](https://stackoverflow.com/questions/44951456/pip-error-microsoft-visual-c-14-0-is-required).
* [Python package `python-Levenshtein`](https://pypi.org/project/python-Levenshtein/)
* [Python package `sklearn`](https://pypi.org/project/sklearn/)
* [Python package `nltk`](https://pypi.org/project/nltk/)
* Nltk stopwords - install them by running the command `python -m nltk.downloader stopwords`
* [Google Chrome](https://www.google.com/chrome/) - Install really Google Chrome, Chromium is not supported.

## Download Selenium server

Download the Selenium server (Grid) standalone from the [download page](https://www.selenium.dev/downloads/).
Save it to the folder `./get_data/selenium/` with the name `selenium-server-standalone.jar`.

## Download top sites list

Download the latest TRANCO top sites list from [download page](https://tranco-list.eu/#download).
Save it to folder `./get_data/top_sites/` with the name `tranco.csv`.


## Download Chrome driver

Download Chrome driver from [download page](https://chromedriver.chromium.org/downloads).
Select the version coresponding to the version of your Google Chrome web browser. If you download an incompatible version, you will see an error during starting tests.
Download the correct ChromeDriver to folder `../common_files/webbrowser_drivers` with name `chromedriver.exe` (for Windows) or `chromedriver` (for Linux).


# RUN TESTS

Open file `./get_data/configuration.py` and check if all paths and other properities are right.

The results of system tests will be stored in folder `./data` after finishing tests.

## on Windows OS

Open PowerShell in folder *system_tests* and run command: `.\setup_buildJSR_runTests.ps1`.

When script execution starts for the first time, OS Windows may ask you to allow Firewall Exception for this script (for Python). Click *Allow*.

## on Linux OS
Open Terminal in folder *system_tests* and run command: `./setup_buildJSR_runTests.sh`
