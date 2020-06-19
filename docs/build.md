To build JSR from scratch:

1. Go to the project repository [https://github.com/polcak/jsrestrictor]()
1. Download the desired branch, e.g. as zip
1. Unpack the zip file
1. Run `make`
	* We currently support GNU/Linux and Apple Mac OS, we plan to Support Windows
	* You will need common software, such as `wget`, `bash`, `awk`, `sed`
1. Import the extension to the browser
	* Firefox: [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/]()
		* Use the file `firefox_JSR.zip` created by `make`
	* Chromium-based browsers:
		1. Open `chrome://extensions`
		1. Enable developper mode
		1. Click `Load unpacked`
		1. Import the `chrome_JSR/` directory created by `make`
