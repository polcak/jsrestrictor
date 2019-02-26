all: firefox chrome

firefox:
	@mkdir firefox_JSR_extension
	@cp -r firefox_files/* firefox_JSR_extension/
	@cp -r img/ firefox_JSR_extension/
	@cp options.css firefox_JSR_extension/
	@cp options.html firefox_JSR_extension/
	@cp popup.css firefox_JSR_extension/
	@cp popup.html firefox_JSR_extension/
	@echo "Firefox exported -> firefox_JSR_extension"

chrome:
	@mkdir chrome_JSR_extension
	@cp -r chrome_files/* chrome_JSR_extension/
	@cp -r img/ chrome_JSR_extension/
	@cp options.css chrome_JSR_extension/
	@cp options.html chrome_JSR_extension/
	@cp popup.css chrome_JSR_extension/
	@cp popup.html chrome_JSR_extension/
	@echo "Chrome exported  -> chrome_JSR_extension"

clear:
	rm -rf firefox_JSR_extension
	rm -rf chrome_JSR_extension


