#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = "The JShelter team"
SITENAME = "JShelter"
DESCRIPTION = "Your browser extension to keep you safe"
LONGDESCRIPTION = "An anti-malware Web browser extension to mitigate potential threats from JavaScript, including fingerprinting, tracking, and data collection!"
SITEURL = "https://jshelter.org"

DEFAULT_DATE = "fs"  # use a default date to stop Pelican complaints on pages
PAGE_PATHS = ["pages", "wrappers"]
THEME = "./theme/"
DIRECT_TEMPLATES = ["index"]

# Use filenames as the base for slugs (default is post title)
SLUGIFY_SOURCE = "basename"

DEFAULT_METADATA = {"lang": "en"}
PATH_METADATA = r"(pages|posts|wrappers)/(?P<lang>..)/.*"

# Use static page as index (home.md) and move blog index to blog/
INDEX_SAVE_AS = "blog/index.html"
# Settings for clean URLs
ARTICLE_URL = "{slug}/"
ARTICLE_SAVE_AS = "{slug}/index.html"
PAGE_URL = "{slug}/"
PAGE_SAVE_AS = "{slug}/index.html"
PAGE_LANG_URL = "{lang}/{slug}/"
PAGE_LANG_SAVE_AS = "{lang}/{slug}.html"
DRAFT_URL = "private/{slug}/"
DRAFT_SAVE_AS = "private/{slug}/index.html"
DRAFT_LANG_URL = "private/{slug}-{lang}/"
DRAFT_LANG_SAVE_AS = "private/{slug}-{lang}/index.html"

PATH = "content"

TIMEZONE = "Europe/Paris"

DEFAULT_LANG = "en"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

DEFAULT_PAGINATION = 15

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

PLUGIN_PATHS = ["plugins"]
PLUGINS = ["i18n_subsites"]
I18N_UNTRANSLATED_PAGES = "remove"  # needed to avoid index overwrites
I18N_SUBSITES = {
    "pt": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION" = "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
    }
}

# custom Jinja2 filter
# https://siongui.github.io/2017/01/08/pelican-get-single-page-or-article-by-slug-metadata-in-theme/
def get_by_slug(objs, slug):
    for obj in objs:
        if obj.slug == slug:
            return obj


JINJA_FILTERS = {
    "get_by_slug": get_by_slug,
}
