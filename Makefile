all: firefox chrome firefox_unzip chrome_unzip

firefox:
	@cp firefox_manifest/manifest.json .
	@zip -q -r firefox_JSR.zip img/ LICENSE manifest.json background.js document_start.js options.js options.css options.html popup.js popup.css popup.html
	@rm -f manifest.json
	@echo "Firefox zip extension exported -> firefox_JSR.zip"

firefox_unzip: firefox
	@unzip -q firefox_JSR.zip -d firefox_JSR
	@echo "Firefox dir extension exported -> Firefox_JSR/"

chrome:
	@cp chrome_manifest/manifest.json .
	@zip -q -r chrome_JSR.zip img/ LICENSE manifest.json background.js document_start.js options.js options.css options.html popup.js popup.css popup.html
	@rm -f manifest.json
	@echo "Chrome zip extension exported  -> chrome_JSR.zip"

chrome_unzip: chrome
	@unzip -q chrome_JSR.zip -d chrome_JSR 
	@echo "Chrome dir extension exported  -> chrome_JSR/"


clean:
	rm -rf firefox_JSR.zip
	rm -rf firefox_JSR
	rm -rf chrome_JSR.zip
	rm -rf chrome_JSR


