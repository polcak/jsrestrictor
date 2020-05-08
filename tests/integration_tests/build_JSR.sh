#!/bin/bash

cd ../../
make clean
make
mkdir -p ./tests/common_files/JSR/firefox
mkdir -p ./tests/common_files/JSR/chrome
cp -f ./firefox_JSR.zip ./tests/common_files/JSR/firefox/firefox_JSR.xpi
google-chrome --pack-extension=./chrome_JSR >/dev/null 2>&1
rm -rf ./chrome_JSR.pem
mv -f ./chrome_JSR.crx ./tests/common_files/JSR/chrome/chrome_JSR.crx
