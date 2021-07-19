#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = "The Rescriptor team"
SITENAME = "Rescriptor"
DESCRIPTION = "Your browser extension to keep you safe"
SITEURL = ""

DEFAULT_DATE = "fs"  # use a default date to stop Pelican complaints on pages
PAGE_PATHS = ["pages", "wrappers"]
THEME = "./theme/"

# Use filenames as the base for slugs (default is post title)
SLUGIFY_SOURCE = "basename"

# Use static page as index (home.md) and move blog index to blog/
INDEX_SAVE_AS = "blog/index.html"
# Settings for clean URLs
ARTICLE_URL = "{slug}/"
ARTICLE_SAVE_AS = "{slug}/index.html"
PAGE_URL = "{slug}/"
PAGE_SAVE_AS = "{slug}/index.html"
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

DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True
