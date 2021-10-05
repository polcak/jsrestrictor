#!/bin/bash

# Copyright (C) 2021 Giorgio Maone <https://maone.net>
#
# SPDX-License-Identifier: GPL-3.0-or-later

# Run this to regenerate icon-[size].png icons from a modified logo.svg
# (Chrome doesn't support SVG for extensions icons)

for f in icon-*.png; do 
  n=$(echo "$f" | sed -re 's/.*-([0-9]+).*/\1/'); 
  convert +antialias -background none logo.svg -resize "$n"x"$n" "icon-$n.png"; 
done
