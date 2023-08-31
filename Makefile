# SPDX-FileCopyrightText: 2019 Martin Timko
# SPDX-FileCopyrightText: 2019-2021 Libor Polčák
# SPDX-FileCopyrightText: 2020 Peter Horňák
# SPDX-FileCopyrightText: 2021 Giorgio Maone
# SPDX-FileCopyrightText: 2021 Marek Saloň
# SPDX-FileCopyrightText: 2023 Martin Zmitko
#
# SPDX-License-Identifier: GPL-3.0-or-later

DEBUG=0

all: firefox chrome

.PHONY: firefox chrome clean get_csv docs wasm
firefox: jshelter_firefox.zip
chrome: jshelter_chrome.zip
wasm: wasm/build/debug.wasm wasm/build/release.wasm

COMMON_FILES = $(shell find common/) \
			   LICENSES/ \
			   Makefile \
			   $(shell find firefox/) \
			   $(shell find chrome/)

PROJECT_NAME = $(shell grep ^PROJECT_NAME doxyfile | cut -f2 -d'"')

debug=1

wasm/build/%.wasm: wasm/assembly/farble.ts
	@cd wasm && npm install && npm run $*

get_csv:
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv4.csv
	cp ipv4.csv common/ipv4.dat
	wget -q -N https://www.iana.org/assignments/locally-served-dns-zones/ipv6.csv
	cp ipv6.csv common/ipv6.dat

submodules:
	git submodule init
	git submodule update

jshelter_%.zip: $(COMMON_FILES) get_csv submodules wasm
	@mkdir -p build/
	@rm -rf build/$*/ $@
	@cp -r common/ build/$*/
	@cp -r $*/* build/$*/
	@cp -r LICENSES build/$*/
	@./generate_fpd.sh build/$*/
	@nscl/include.sh build/$*
	@if [ $(DEBUG) -eq 0 ]; \
	then \
		find build/$*/ -type f -name "*.js" -exec sed -i '/console\.debug/d' {} + ; \
		cp wasm/build/release.wasm build/$*/farble.wasm; \
	else \
		cp wasm/build/debug.wasm build/$*/farble.wasm; \
	fi
	@rm -f build/$*/.*.sw[pno]
	@rm -f build/$*/img/makeicons.sh
	@find build/$*/ -name '*.license' -delete
	@./fix_manifest.sh build/$*/
	@cd build/$*/ && zip -q -r ../../$@ ./* --exclude \*.sw[pno]
	@echo "LOG-WARNING: Number of lines in build/$* with console.log:"
	@grep -re 'console.log' build/$* | wc -l

debug: DEBUG=1
debug: all
	
docs:
	PROJECT_NAME="${PROJECT_NAME}" doxygen < doxyfile
	
clean:
	rm -rf build/
	rm -rf jsheleter_firefox.zip
	rm -rf jshelter_chrome.zip
	rm -rf common/ipv4.dat
	rm -rf common/ipv6.dat
	rm -rf common/wrappingX*
	rm -rf ipv4.csv
	rm -rf ipv6.csv
	rm -rf doxygen/
	cd wasm && npm run clean
