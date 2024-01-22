#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Apply some post-processing to deal with broken 
# lines in the Markdown frontmatter in the Weblate
# translated files. Accepts a file as argument and
# overwrites it with the processed version.

import sys

FIELDNAMES = ["Series", "series_index", "Date", "Modified"]

with open(sys.argv[1], 'r') as f:
    lines = f.readlines()

# first pass: join all lines
raw_frontmatter = ""
for line in lines:
    if not line.strip():
        break
    raw_frontmatter += line.strip() + ' '

# remove header markup if present
if raw_frontmatter.startswith('# '):
    raw_frontmatter = raw_frontmatter.replace('# ', '', 1)
if raw_frontmatter.startswith('## '):
    raw_frontmatter = raw_frontmatter.replace('## ', '', 1)
if raw_frontmatter.startswith('### '):
    raw_frontmatter = raw_frontmatter.replace('### ', '', 1)

# second pass: break lines on field names
output = raw_frontmatter
for name in FIELDNAMES:
    tag = name + ": "
    if tag in raw_frontmatter:
        output = output.replace(tag, '\n' + tag)

# now combine frontmatter and content
output += '\n'
frontmatter_ended = False
for line in lines:
    if not line.strip():
        frontmatter_ended = True
    if not frontmatter_ended:
        continue
    output += line

with open(sys.argv[1], 'w') as f:
    f.write(output)
