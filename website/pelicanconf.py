#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = "The JShelter team"
SITENAME = "JShelter"
DESCRIPTION = "Your browser extension to keep you safe"
LONGDESCRIPTION = "An anti-malware Web browser extension to mitigate potential threats from JavaScript, including fingerprinting, tracking, and data collection!"
SITEURL = "https://jshelter.org"
RELATIVE_URLS = True

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

DEFAULT_PAGINATION = 15

STATIC_LANG_SAVE_AS = "drafts/pages/{slug}-{lang}.html"

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

PLUGIN_PATHS = ["plugins"]
PLUGINS = ["i18n_subsites", "series"]
I18N_UNTRANSLATED_PAGES = "remove"  # needed to avoid index overwrites
I18N_SUBSITES = {
    "pt": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION": "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
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

# See https://docs.getpelican.com/en/stable/settings.html#example-settings and https://stackoverflow.com/questions/45605387/table-of-contents-in-pelican-blog-generator
# The default configuration with the TOC plugin activated
# See also https://jackdewinter.github.io/2019/10/16/fine-tuning-pelican-markdown-configuration/
# and https://python-markdown.github.io/extensions/toc/
MARKDOWN = {
  'extension_configs': {
    'markdown.extensions.toc': {
      'anchorlink': True,
    },
    'markdown.extensions.codehilite': {'css_class': 'highlight'},
    'markdown.extensions.extra': {},
    'markdown.extensions.meta': {},
  },
  'output_format': 'html5',
}
