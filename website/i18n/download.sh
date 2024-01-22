#!/bin/bash
#
# Updates the local translation files with the most recent Weblate versions.
#

for lang in `ls -d */ | sed 's/\///' | grep -v '^en$'`; do
  echo $lang
  wlc download jshelter/website/$lang >| $lang/pages.po
  wlc download jshelter/website-posts/$lang >| $lang/posts.po
  wlc download jshelter/website-wrappers/$lang >| $lang/wrappers.po
done
