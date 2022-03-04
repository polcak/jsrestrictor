all: firefox chrome

.PHONY: firefox chrome clean get_csv
firefox: firefox_JSR.zip
chrome: chrome_JSR.zip

COMMON_FILES = $(shell find common/) \
			   LICENSE \
			   Makefile \
			   $(shell find firefox/) \
			   $(shell find chrome/)

get_csv:
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv4.csv
	cp ipv4.csv common/ipv4.dat
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv6.csv
	cp ipv6.csv common/ipv6.dat


%_JSR.zip: $(COMMON_FILES) get_csv
	@rm -rf $*_JSR/ $@
	@cp -r common/ $*_JSR/
	@cp -r $*/* $*_JSR/
	@cp LICENSE $*_JSR/
	@./fix_manifest.sh $*_JSR/manifest.json
	@rm -f $*_JSR/.*.sw[pno]
	@cd $*_JSR/ && zip -q -r ../$@ ./* --exclude \*.sw[pno]

clean:
	rm -rf firefox_JSR.zip
	rm -rf firefox_JSR
	rm -rf chrome_JSR.zip
	rm -rf chrome_JSR
	rm -rf common/ipv4.dat
	rm -rf common/ipv6.dat
	rm -rf ipv4.csv
	rm -rf ipv6.csv
