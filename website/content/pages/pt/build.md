Title: Building from scratch 

### GNU/Linux and Mac OS

1. Ver o repositório do projeto: <https://pagure.io/JShelter/webextension>.
1. Download the desired branch, e.g. as zip archive.
1. Unpack the zip archive.
1. Run `make`.
   * You will need common software, such as `zip`, `wget`, `bash`, `awk`, `sed`.
   * Note that running `make` removes all `console.debug` calls. If you want to keep
such calls, run `make debug`.

1. Import the extension to the browser.
   * [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)
      1. Open `about:debugging`.
      1. Click the *This Firefox* option
      1. Click the *Load Temporary Add-on* button
      1. Select the file `jshelter_firefox.zip` created by `make`.
   * Chromium-based browsers:
      1. Open `chrome://extensions`.
      1. Enable developper mode.
      1. Click `Load unpacked`.
      1. Import the `jshelter_chrome/` directory created by `make`.

### Windows

1. Install Windows Subsystem for Linux (WSL):
<https://docs.microsoft.com/en-us/windows/wsl/install-win10>.
1. Ver o repositório do projeto: <https://pagure.io/JShelter/webextension>.
1. Download the desired branch, e.g. as zip archive.
1. Unpack the zip archive.
1. Open the JShelter project folder in WSL, run `make`.
   * Make sure that `zip` and all other necessary tools are installed.
   * Note that EOL in `fix_manifest.sh` must be set to `LF` (you can use the tool
`dos2unix` in WSL to convert `CR LF` to `LF`).

1. On Windows, import the extension to the browser according to the instructions
for Linux (above).
