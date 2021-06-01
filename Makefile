all: firefox chrome

.PHONY: firefox chrome clean get_csv docs
firefox: firefox_JSR.zip
chrome: chrome_JSR.zip

COMMON_FILES = $(shell find common/) \
			   LICENSES/ \
			   Makefile \
			   $(shell find firefox/) \
			   $(shell find chrome/)

PROJECT_NAME = $(shell grep ^PROJECT_NAME doxyfile | cut -f2 -d'"')

get_csv:
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv4.csv
	cp ipv4.csv common/ipv4.dat
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv6.csv
	cp ipv6.csv common/ipv6.dat


%_JSR.zip: $(COMMON_FILES) get_csv
	@rm -rf $*_JSR/ $@
	@cp -r common/ $*_JSR/
	@cp -r $*/* $*_JSR/
	@cp -r LICENSES $*_JSR/
	@./fix_manifest.sh $*_JSR/manifest.json
	@nscl/include.sh $*_JSR
	@rm -f $*_JSR/.*.sw[pno]
	@cd $*_JSR/ && zip -q -r ../$@ ./* --exclude \*.sw[pno]

docs:
	PROJECT_NAME="${PROJECT_NAME}" doxygen < doxyfile

clean:
	rm -rf firefox_JSR.zip
	rm -rf firefox_JSR
	rm -rf chrome_JSR.zip
	rm -rf chrome_JSR
	rm -rf common/ipv4.dat
	rm -rf common/ipv6.dat
	rm -rf ipv4.csv
	rm -rf ipv6.csv
	rm -rf doxygen/
