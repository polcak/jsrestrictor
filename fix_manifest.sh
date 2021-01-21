#!/usr/bin/env bash

#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
# SPDX-License-Identifier: GPL-3.0-or-later
#

pushd common/
	WRAPPING=`ls wrapping*.js | sort | awk '{ print "\"" $0 "\"" }' | tr '\n' ',' |  sed 's/,$//'`
popd

sed -i -e "s/WRAPPING/${WRAPPING}/" $1
