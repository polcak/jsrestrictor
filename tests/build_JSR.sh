#!/bin/bash

# Go to root directory of JSR project.
cd ../

# Clean previous build.
make clean

# Build.
make

# Create directory for JSR package if not exists.
mkdir -p ./tests/common_files/JSR

# Create xpi package of JSR for Mozilla Firefox from zip archive created by make.
cp -f ./firefox_JSR.zip ./tests/common_files/JSR/firefox_JSR.xpi

# Create crx package of JSR for Google Chrome from source files.
google-chrome --pack-extension=./chrome_JSR >/dev/null 2>&1

# Remove unnecessary file created during crx package creating.
rm -rf ./chrome_JSR.pem

# Move crx package of JSR to right location (same as xpi package of JSR).
mv -f ./chrome_JSR.crx ./tests/common_files/JSR/chrome_JSR.crx
