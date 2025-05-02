#!/usr/bin/env bash

#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2025  Libor Polcak
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

DEBUG="$1"
BROWSER="$2"

if [ "$DEBUG" -eq 0 ]
then
	WASM_FILE=wasm/build/release.wasm
else
	WASM_FILE=wasm/build/debug.wasm
fi

if [ "$BROWSER" = "firefox" ]
then
	cp "$WASM_FILE" build/firefox/farble.wasm
else
	pushd build/chrome
		patch -p1 < code_builders.patch
		rm code_builders.patch
	popd
	sed --in-place "s~__WASM_CODE_DURING_BUILD__~`base64 --wrap=0 $WASM_FILE `~" build/chrome/code_builders.js
fi
echo $BROWSER $WASM_FILE
