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

translate:
	$(ACTIVATE); cd i18n; ./download.sh; ./translate_content.sh; for f in `ls ../content/posts/pt/*.md`; do ./postprocess.py $$f; done; for f in `ls ../content/pages/pt/*.md`; do ./postprocess.py $$f; done; for f in `ls ../content/wrappers/*.md`; do ./postprocess.py $$f; done

html: extract 
	cp ../tests/integration_tests/README.md content/pages/integration_tests.md
	cp ../tests/unit_tests/README.md content/pages/unit_tests.md
	mkdir -p output/ output/.well-known/
	cp -r theme/favicon.ico output/
	cp -r theme/security.txt output/.well-known/
	$(ACTIVATE); python extract_comments.py
	$(PELICAN) "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)
	# fix translated indexes to address a Pelican bug
	# cd content/pages; for lang in */; do mv ../../output/$$lang/$$lang/index.html ../../output/$$lang; rm -f ../../output/$$lang/$$lang/index.html; done

doxygen:
	cd ..; make docs
	cp -r ../doxygen/html output/doxygen

build: doxygen html

clean:
	[ ! -d "$(OUTPUTDIR)" ] || rm -rf "$(OUTPUTDIR)"
	rm -fr content/pages/pt
	rm -fr content/posts/pt
	rm -fr content/wrappers/pt

regenerate:
	$(PELICAN) -r "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

serve:
	$(PELICAN) -l "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

serve-global:
	$(PELICAN) -l "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS) -b $(SERVER)

devserver:
	$(PELICAN) -lr "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(CONFFILE)" $(PELICANOPTS)

devserver-global:
	$(PELICAN) -lr $(INPUTDIR) -o $(OUTPUTDIR) -s $(CONFFILE) $(PELICANOPTS) -b 0.0.0.0

publish:
	$(PELICAN) "$(INPUTDIR)" -o "$(OUTPUTDIR)" -s "$(PUBLISHCONF)" $(PELICANOPTS)

deploy: html
	rsync -e "ssh -p 22" -P -rvzc output/ root@jshelter.org:/var/www/html/ --cvs-exclude

dry-deploy: html
	rsync -n -e "ssh -p 22" -P -rvzc output/ root@jshelter.org:/var/www/html/ --cvs-exclude

.PHONY: html help clean regenerate serve serve-global devserver publish
