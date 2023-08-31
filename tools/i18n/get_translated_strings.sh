#!/bin/sh

# Extracts all translated strings, for example to allwo spell checking
#
# Run from the base directory of the repository with one argument - the identification of the
# language

LANG="$1"

grep '"\(message\|content\)"' common/_locales/$LANG/messages.json | sed 's/[^:]*://' | grep '"' | grep -v '"$[[:digit:]]"'
