#!/usr/bin/env bash

#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2023  Libor Polcak
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


# This file deals with the issue raised in:
# https://pagure.io/JShelter/webextension/issue/82
# and further discussed in https://pagure.io/pagure/issue/5378
#
# This file expects a single parameter - the tag

if [ $# -ne 1 ]; 
then
	echo "Please provide a single argument that is the tag in the JShelter repository"
	exit 1
fi

DIR=jshelter-$1

git clone https://pagure.io/JShelter/webextension.git --branch $1 --depth 1 --recurse-submodules --shallow-submodules "$DIR"
rm -rf $DIR/.git* $DIR/*/.git*
zip -r jshelter-$1.zip $DIR
tar czf jshelter-$1.tar.gz $DIR
