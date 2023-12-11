#!/bin/bash
#
# Generates .po files from the original Markdown source files.
#18n 

for f in ../content/pages/*.md; do
  md2po --quiet \
    --po-encoding=UTF-8 $f --save --merge-po-files --po-filepath pages.po \
    -d "Content-Type: text/plain; charset=utf-8" 
  # -d ”Language: es”
done

for f in ../content/posts/*.md; do
  md2po --quiet \
    --po-encoding=UTF-8 $f --save --merge-po-files --po-filepath posts.po \
    -d "Content-Type: text/plain; charset=utf-8" 
  # -d ”Language: es”
done

for f in ../content/wrappers/*.md; do
  md2po --quiet \
    --po-encoding=UTF-8 $f --save --merge-po-files --po-filepath wrappers.po \
    -d "Content-Type: text/plain; charset=utf-8" 
  # -d ”Language: es”
done
