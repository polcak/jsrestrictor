#!/usr/bin/env bash

#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2019  Libor Polcak
#  Copyright (C) 2021  Marek Salon
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

for f in ./common/fp_config/*.json
do
  CONFNAME=`basename $f .json`
  cat $f > common/wrappingX-$CONFNAME.js

  pushd common/
   sed -i '1i (function() { var conf = `' wrappingX-$CONFNAME.js
   echo '`;add_fp_config(conf, "'"$CONFNAME"'");})();' >> wrappingX-$CONFNAME.js
  popd
done

pushd common/
	WRAPPING=`ls wrapping*.js | sort | awk '{ print "\"" $0 "\"" }' | tr '\n' ',' |  sed 's/,$//'`
popd

sed -i -e "s/WRAPPING/${WRAPPING}/" $1
