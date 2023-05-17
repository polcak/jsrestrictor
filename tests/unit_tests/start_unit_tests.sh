#!/bin/bash
#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2022 Martin Bednar
#  Copyright (C) 2023 Martin Zmitko
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#


function get_requirements {
	# Get requirement type.
	type=$(jq -r '.type' <<< "$requirements_type")
	
	for m in $(jq '.requirements | keys | .[]' <<< "$requirements_type"); do
		# Get current requirements.
		requirements=$(jq -r ".requirements[$m]" <<< "$requirements_type")
		
		# Get requirement from.
		from=$(jq -r '.from' <<< "$requirements")
		
		# Get requirement import.
		import=$(jq -r '.import' <<< "$requirements")

		# Get required files.
		files=$(jq -r '.files' <<< "$requirements")

		if [[ $from != "null" ]]
		then
			all_script_requirements+="${type} { "
		
			# Iterate over test script requirement names.
			for n in $(jq '.objects | keys | .[]' <<< "$requirements"); do
				# Get current requirement name.
				requirement_object=$(jq -r ".objects[$n]" <<< "$requirements")
				
				# Add current requirement name.
				if [ $n -eq 0 ]
				then
					all_script_requirements+="${requirement_object}"
				else
					all_script_requirements+=", ${requirement_object}"
				fi
				
			done
			
			all_script_requirements+=" } = require('${from}');"			
		elif [[ $import != "null" ]]
		then
			# Get requirement as.
			requirement_as=$(jq -r '.as' <<< "$requirements")
			
			all_script_requirements+="${type} ${requirement_as} = require('${import}');"
		elif [[ $files != "null" ]]
		then
			# Iterate over required file names.
			for n in $(jq '.files | keys | .[]' <<< "$requirements"); do
				# Get current requirement name.
				requirement_file=$(jq -r ".files[$n]" <<< "$requirements")
				
				# Add current requirement name.
				additional_file_requirements+="${requirement_file} "
			done
		fi
	done
}

echo Preparation for testing STARTED.

# Create directory ./tmp if not exists. Temporary working directory for one tests running.
# Will be deleted when unit tests will be finished.
mkdir -p ./tmp

# String of all scripts names. Will be filled during iterating over scripts in global configuration.
# Will be used for ./config/jasmine.conf
script_names=""

# Variable for collecting all additional file requirements to be copied.
additional_file_requirements=""

# Iterate over all scripts in global configuration (./config/global.json).
for k in $(jq '.scripts | keys | .[]' ./config/global.json); do
	# Get current script.
	script=$(jq -r ".scripts[$k]" ./config/global.json)
	
	# Get test script and source script name.
	name=$(jq -r '.name' <<< "$script")
	test_script_name="${name}_tests.js"
	source_script_name="${name}.js"
	# Add current test script name to list of all testing scripts that will run.
	if [ $k -eq 0 ]
	then
		script_names+="\"${test_script_name}\""
	else
		script_names+=", \"${test_script_name}\""
	fi
	

	########################   SET TESTS SCRIPT REQUIREMENTS   ########################
	if [ -f "./tests/$test_script_name" ]
	then
		# Create temporary working version of the current testing script. Working version will be modified.
		cp ./tests/$test_script_name ./tmp/$test_script_name
		
		# Variable for collecting all test script requirements.
		all_script_requirements=""
		
		# Iterate over test script requirements.
		for l in $(jq '.test_script_requirements | keys | .[]' <<< "$script"); do
			# Get current script.
			requirements_type=$(jq -r ".test_script_requirements[$l]" <<< "$script")
			
			get_requirements
		done
		
		sed -i "1s~^~$all_script_requirements~" ./tmp/$test_script_name
	else
		echo "Testing script ${test_script_name} does not exist. Skipping."
	fi
	
	########################   MODIFY SOURCE SCRIPT   ########################
	if [ ! -f "../../common/$source_script_name" ]
	then
		echo "Source script ${source_script_name} does not exist. Skipping."
		continue
	fi

	cp ../../common/$source_script_name ./tmp/$source_script_name
	
	# Modify source script - remove custom namespace if necessary.
	remove_custom_namespace=$(jq -r '.remove_custom_namespace' <<< "$script")
	if [ $remove_custom_namespace == "true" ]
	then
		sed -i -e "s/(function() {//" -e "s/(function () {//" -e "s/})();//" -e "s/successCallback(/return(/" ./tmp/$source_script_name
	fi
	
	# Modify source script - convert "let" variables to "var" variables if necessary.
	let_to_var=$(jq -r '.let_to_var' <<< "$script")
	if [ $let_to_var == "true" ]
	then
		sed -i -e "s/\<let\> /var /" ./tmp/$source_script_name
	fi
	
	
	# Replace source code if required.
	replace_in_src=$(jq -r '.replace_in_src' <<< "$script")
	
	if [[ $replace_in_src != "null" ]] ;
	then
		for l in $(jq '.replace_in_src | keys | .[]' <<< "$script"); do
			# Get current replacement.
			replacement=$(jq ".replace_in_src[$l]" <<< "$script")
			origin=$(jq -r ".origin" <<< "$replacement")
			new=$(jq -r ".new" <<< "$replacement")
			sed -i "s/$origin/$new/" ./tmp/$source_script_name
		done
	fi
	
	
	# Get code for injecting.
	inject_code=$(jq -r '.inject_code_to_src' <<< "$script")
	if [[ $inject_code != "null" ]] ;
	then
		inject_code_begin=$(jq -r '.begin' <<< "$inject_code")
		if [[ $inject_code_begin != "null" ]] ;
		then
			# Inject given code to the begin of the source script.
			sed -i "1s~^~$inject_code_begin~" ./tmp/$source_script_name
		fi
		inject_code_end=$(jq -r '.end' <<< "$inject_code")
		if [[ $inject_code_end != "null" ]] ;
		then
			# Inject given code to the end of the source script.
			echo $inject_code_end >> ./tmp/$source_script_name
		fi
	fi
	
	
	########################   SET SOURCE SCRIPT REQUIREMENTS   ########################
	
	# Variable for collecting all source script requirements.
	all_script_requirements=""
	
	# Iterate over source script requirements.
	for l in $(jq '.src_script_requirements | keys | .[]' <<< "$script"); do
		# Get current script.
		requirements_type=$(jq -r ".src_script_requirements[$l]" <<< "$script")
		
		get_requirements
	done
	
	sed -i "1s~^~$all_script_requirements~" ./tmp/$source_script_name
	
	
	########################   SET SOURCE SCRIPT EXPORTS   ########################
	
	# Variable for collecting all source script exports.
	exports=""
	
	# Unset IFS variable to read line with leading whitespaces.
	while IFS= read -r line; do
		# If script does not have custom namespace, select only functions and variables on the line without leading tabulator.
		# It means selecting only functions and variables on global level.
		if [[ $remove_custom_namespace == "false" ]] ;
		then
			if [[ $line == function* ]] ;
			then
				# Divide line by character SPACE and left bracket.
				IFS=' (' read -ra line_divided <<< "$line"
				# Pick up function name.
				function_name="${line_divided[1]}"
				# Export function.
				exports+="exports.${function_name} = ${function_name}; "
			elif [[ $line =~ ^var[[:space:]]+[a-zA-Z0-9_]+[[:space:]]*=[[:space:]]* ]] ;
			then
				# Divide line by character SPACE and left bracket.
				IFS=' =' read -ra line_divided <<< "$line"
				# Pick up function name.
				var_name="${line_divided[1]}"
				# Export function.
				exports+="exports.${var_name} = ${var_name}; "
			fi
		fi
	done < ./tmp/$source_script_name
	
	# Should extra exports from config be set?
	if [[ $(jq '.extra_exports' <<< "$script") != "null" ]] ;
	then
		for l in $(jq '.extra_exports | keys | .[]' <<< "$script"); do
			# Get current export.
			export=$(jq -r ".extra_exports[$l]" <<< "$script")
			# Add extra exports from global configiguration.
			exports+="exports.${export} = ${export}; "
		done
	fi
	
	# Add all exports at the end of source script.
	echo $exports >> ./tmp/$source_script_name
done

# Create working version of Jasmine config.
cp ./config/jasmine.json ./tmp/jasmine.json
# Add all testing scripts from global configuration to Jasmine confiduration.
sed -i "s/<<SPEC_FILES>>/$script_names/" ./tmp/jasmine.json

# Copy all additional file requirements to temporary working directory.
if [[ $additional_file_requirements != "" ]] ;
then
	cp $additional_file_requirements ./tmp
fi

echo Preparation for testing FINISHED.
echo Testing STARTED.

# Run unit tests in framework Jasmine for NodeJS.
npx jasmine --config=./tmp/jasmine.json

echo Testing FINISHED.
echo Cleanup STARTED.

# Remove ./tmp directory (temporary working directory) after tests finished.
rm -rf ./tmp

echo Cleanup FINISHED.
