#!/bin/bash

#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
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

tests_path="$2/resources.js"
fce_name="test_$(echo $1 | sed -e "s,^.*wrappers-,," -e "s/.json$//")"

cat << EOF >> $tests_path
function ${fce_name}(wrappers) {

EOF

targets=($(grep -E "resource|type|property" $1 | sed -E 's/^[ \t]*"resource":"/_/' | sed -E 's/^[ \t]*"type":"|"property":"//' | sed -E 's/"$|",$//'))

perc=$(("${#targets[@]}" / 10))
echo -ne "CONVERTING $1 TO TESTING SCRIPT $tests_path"

x=0
for i in "${targets[@]}"
do
	((x=x+1))
	if [ $perc -eq $x ]; then
		x=0
		echo -ne "."
	fi

	if [ "${i::1}" = "_" ]; then
		resource=${acc[0]}
		type=${acc[1]}
		props=($(printf "%s\n" "${acc[@]:2}" | sort -u | tr '\n' ' '))
		
		if [ ! -z "${resource}" ]; then
			# echo "${resource} ${type} ${props[@]}"
		
			cat << EOF >> $tests_path
	// ${resource} ${type} ${props[@]}
EOF

			if [ "${type,,}" = "property" ]; then
				# process implicit get
				if [ ${#props[@]} -eq 0 ]; then
					props=("get")
				fi
				
				for z in "${props[@]}"
				do
					cat << EOF >> $tests_path
	var number_${z} = Math.floor(Math.random() * 9 + 1);

EOF
				
					if [ "${z,,}" = "get" ]; then
						cat << EOF >> $tests_path
	for (let i = 0; i < number_${z}; i++) {
		try {
			${resource};
		}
		catch {}
	}

	addWrapper(wrappers, "${resource}", "${z}", number_${z});

EOF
					fi
				
					if [ "${z,,}" = "set" ]; then
						cat << EOF >> $tests_path
	for (let i = 0; i < number_${z}; i++) {
		try {
			${resource} = "";
		}
		catch {}
	}

	addWrapper(wrappers, "${resource}", "${z}", number_${z});

EOF
					fi		
				done
			fi
			
			if [ "${type,,}" = "function" ]; then
				cat << EOF >> $tests_path
	var number = Math.floor(Math.random() * 9 + 1);

	for (let i = 0; i < number; i++) {
		try {
			${resource}();
		}
		catch {}
	}

	addWrapper(wrappers, "${resource}", "call", number);

EOF
			fi
		fi
		
		acc=(${i:1})
	else
		acc+=("${i}")
	fi
done

cat << EOF >> $tests_path
};
EOF

echo "DONE!"
