# SPDX-FileCopyrightText: 2019 Martin Timko
# SPDX-FileCopyrightText: 2019-2021 Libor Polčák
# SPDX-FileCopyrightText: 2020 Peter Horňák
# SPDX-FileCopyrightText: 2021 Giorgio Maone
#
# SPDX-License-Identifier: GPL-3.0-or-later

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

### Docs ###

SITE_DIR=`pwd`/website/
ACTIVATE=. ${SITE_DIR}.env/bin/activate

docs:
	cp -f docs/build.md docs/credits.md docs/levels.md docs/permissions.md docs/versions.md docs/license.md ${SITE_DIR}content/pages
	cp -f docs/new-wrapper.md ${SITE_DIR}content/pages/developer
	${ACTIVATE}; cd ${SITE_DIR} && python extract_comments.py && make html

serve-docs:
	cd ${SITE_DIR} && make devserver

deploy-docs: docs
	rsync -e "ssh -p 22" -P -rvzc ${SITE_DIR}/output/ manufactura@opal5.opalstack.com:~/apps/js-shield/ --cvs-exclude

dry-deploy-docs: docs
	rsync -n -e "ssh -p 22" -P -rvzc ${SITE_DIR}/output/ manufactura@opal5.opalstack.com:~/apps/js-shield/ --cvs-exclude

.PHONY: docs serve-docs deploy-docs dry-deploy-docs
