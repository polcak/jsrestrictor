PY?=python3
ACTIVATE=. `pwd`/.env/bin/activate
PELICAN?=$(ACTIVATE); pelican
PELICANOPTS=

BASEDIR=$(CURDIR)
INPUTDIR=$(BASEDIR)/content
OUTPUTDIR=$(BASEDIR)/output
CONFFILE=$(BASEDIR)/pelicanconf.py
PUBLISHCONF=$(BASEDIR)/publishconf.py


DEBUG ?= 0
ifeq ($(DEBUG), 1)
	PELICANOPTS += -D
endif

RELATIVE ?= 0
ifeq ($(RELATIVE), 1)
	PELICANOPTS += --relative-urls
endif

SERVER ?= "0.0.0.0"

PORT ?= 0
ifneq ($(PORT), 0)
	PELICANOPTS += -p $(PORT)
endif


help:
	@echo 'Makefile for a pelican Web site                                           '
	@echo '                                                                          '
	@echo 'Usage:                                                                    '
	@echo '   make html                           (re)generate the web site          '
	@echo '   make clean                          remove the generated files         '
	@echo '   make regenerate                     regenerate files upon modification '
	@echo '   make publish                        generate using production settings '
	@echo '   make serve [PORT=8000]              serve site at http://localhost:8000'
	@echo '   make serve-global [SERVER=0.0.0.0]  serve (as root) to $(SERVER):80    '
	@echo '   make devserver [PORT=8000]          serve and regenerate together      '
	@echo '   make devserver-global               regenerate and serve on 0.0.0.0    '
	@echo '                                                                          '
	@echo 'Set the DEBUG variable to 1 to enable debugging, e.g. make DEBUG=1 html   '
	@echo 'Set the RELATIVE variable to 1 to enable relative urls                    '
	@echo '                                                                          '

install:
	virtualenv .env --python=/usr/bin/python3
	$(ACTIVATE); pip install -r requirements.txt

extract:
	$(ACTIVATE); python extract_comments.py

html: extract
	mkdir -p output/
	cd ../docs; cp -f build.md credits.md levels.md permissions.md versions.md license.md ../website/content/pages
	cd ../docs; cp -f new-wrapper.md ../website/content/pages
	cp -r favicon.ico output/
	$(ACTIVATE); python extract_comments.py
	$(ACTIVATE); $(PELICAN) "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)
	# fix translated indexes to address a Pelican bug
	cd content/pages; for lang in */; do mv ../../output/$$lang/$$lang/index.html ../../output/$$lang; rm -f ../../output/$$lang/$$lang/index.html; done

clean:
	[ ! -d "$(OUTPUTDIR)" ] || rm -rf "$(OUTPUTDIR)"

regenerate:
	$(ACTIVATE); $(PELICAN) -r "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

serve:
	$(ACTIVATE); $(PELICAN) -l "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

serve-global:
	$(ACTIVATE); $(PELICAN) -l "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS) -b $(SERVER)

devserver:
	$(ACTIVATE); $(PELICAN) -lr "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

devserver-global:
	$(ACTIVATE); $(PELICAN) -lr $(INPUTDIR) -o $(OUTPUTDIR) -s $(CONFFILE) $(PELICANOPTS) -b 0.0.0.0

publish:
	$(ACTIVATE); $(PELICAN) "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(PUBLISHCONF)" $(PELICANOPTS)

deploy: html
	rsync -e "ssh -p 22" -P -rvzc output/ root@jshelter.org:/var/www/html/ --cvs-exclude

dry-deploy: html
	rsync -n -e "ssh -p 22" -P -rvzc output/ root@jshelter.org:/var/www/html/ --cvs-exclude

.PHONY: html help clean regenerate serve serve-global devserver publish
