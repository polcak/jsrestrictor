all: firefox chrome

.PHONY: firefox chrome clean
firefox: firefox_JSR.zip
chrome: chrome_JSR.zip

COMMON_FILES = $(shell find common/) \
			   LICENSE \
			   Makefile
FIREFOX_FILES = $(shell find firefox/)
CHROME_FILES = $(shell find chrome/)

%_JSR.zip: $(COMMON_FILES) $(FIREFOX_FILES)
	@rm -rf $*_JSR/ $@
	@cp -r common/ $*_JSR/
	@cp -r $*/* $*_JSR/
	@cp LICENSE $*_JSR/
	@cd $*_JSR/ && zip -q -r ../$@ ./*

clean:
	rm -rf firefox_JSR.zip
	rm -rf firefox_JSR
	rm -rf chrome_JSR.zip
	rm -rf chrome_JSR
