#!/bin/bash
#
# Generates translated content files from the .po sources

for lang in `ls -d */ | sed 's/\///' | grep -v '^en$'`; do
  for section in 'pages' 'posts' 'wrappers'; do
    mkdir -p ../content/$section/$lang # /content/pages/pt
    echo "Translating $section for language $lang..."
    for f in `ls ../content/$section/*.md`; do
       # echo $f
       po2md $f -p $lang/$section.po >| ${f/$section/$section\/$lang}
    done
  done
done
