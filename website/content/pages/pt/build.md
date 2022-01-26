Title: Compilar

Esta é a versão em português!

### GNU/Linux and Mac OS

1. Go to the project repository: [https://pagure.io/JShelter/webextension](https://pagure.io/JShelter/webextension).
1. Download the desired branch, e.g. as zip archive.
1. Unpack the zip archive.
1. Run `git submodule update`
1. Run `make`.
	* You will need common software, such as `zip`, `wget`, `bash`, `awk`, `sed`.
1. Import the extension to the browser.
	* Firefox: [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
		* Use the file `jshelter_firefox.zip` created by `make`.
	* Chromium-based browsers:
		1. Open `chrome://extensions`.
		1. Enable developper mode.
		1. Click `Load unpacked`.
		1. Import the `jshelter_chrome/` directory created by `make`.

### Windows

1. Install Windows Subsystem for Linux (WSL): [https://docs.microsoft.com/en-us/windows/wsl/install-win10](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
2. Go to the project repository: [https://pagure.io/JShelter/webextension](https://pagure.io/JShelter/webextension).
3. Download the desired branch, e.g. as zip archive.
4. Unpack the zip archive.
5. Run `git submodule update`
6. Open the JShelter project folder in WSL, run `make`.
	* Make sure that `zip` and all other necessary tools are installed.
	* Note that EOL in `fix_manifest.sh` must be set to `LF` (you can use the tool `dos2unix` in WSL to convert `CR LF` to `LF`).
7. On Windows, import the extension to the browser according to the instructions for Linux (above).
