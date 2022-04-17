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

tests_path="tests"
server_port=8000
default_extension_path="../../common"
fpd_test_path=$(dirname "$(realpath $0)")
fpd_background_name="fp_detect_background.js"

cat << EOF > ./tests/resources.js
EOF

# load all wrapper files and process them with wrapper_to_test
in_files=`find -maxdepth 1 -name "wrappers-*"`
in_files_path="${fpd_test_path}/"

# config files not found in this folder - use default config files from fp_config directory
cd "${default_extension_path}/fp_config"
if [ -z "$in_files" ]; then
	in_files=`find -maxdepth 1 -name "wrappers-*"`
	in_files_path=""
fi

for file in $in_files
do
	eval "${fpd_test_path}/common/wrapper_to_test.sh ${in_files_path}${file} ${fpd_test_path}/${tests_path}"
done

cd $fpd_test_path

# update html and worker files to include and call test functions
echo -ne "UPDATING ./common/* FILES FOR THE LATEST CONFIGURATION"

# clear script placeholders in test files
sed -i "/.*<!--SCRIPTS_S-->.*/,/.*<!--SCRIPTS_E-->.*/{/.*<!--SCRIPTS_S-->.*/!{/.*<!--SCRIPTS_E-->.*/!d}}" ./index.html
sed -i "/.*<!--SCRIPTS_S-->.*/,/.*<!--SCRIPTS_E-->.*/{/.*<!--SCRIPTS_S-->.*/!{/.*<!--SCRIPTS_E-->.*/!d}}" ./common/iframe.html
sed -i "/.*\/\/SCRIPTS_S.*/,/.*\/\/SCRIPTS_E.*/{/.*\/\/SCRIPTS_S.*/!{/.*\/\/SCRIPTS_E.*/!d}}" ./common/worker.js

# add test scripts to source code of testing website
test_functions=()
test_files=`find ${tests_path} -type f -name "*.js"`
for file in $test_files
do
	test_functions+=($(grep "function test_" $file | sed -e 's/.*function\s\(.*\)(wrappers).*/\1/' -e 's/$/(resultsAcc);/'))
	
	sed -i "/.*<!--SCRIPTS_S-->.*/a <script language=\"javascript\" src=\"${file}\"></script>" ./index.html
	sed -i "/.*<!--SCRIPTS_S-->.*/a <script language=\"javascript\" src=\"../${file}\"></script>" ./common/iframe.html
	sed -i "/.*\/\/SCRIPTS_S.*/a importScripts('../${file}');" ./common/worker.js
done

echo -ne "....."

# clear function placeholders in test files
for file in ./index.html ./common/iframe.html ./common/worker.js
do
	sed -i "/.*\/\/CALL_S.*/,/.*\/\/CALL_E.*/{/.*\/\/CALL_S.*/!{/.*\/\/CALL_E.*/!d}}" $file
done

# add calls of testing functions to source code of testing website
for fce in "${test_functions[@]}"
do
	for file in ./index.html ./common/iframe.html ./common/worker.js
	do
		sed -i "/.*\/\/CALL_S.*/a ${fce}" $file
	done
done

echo ".....DONE!"

echo -ne "UPDATING EXTENSION FILES FOR TESTING:"

cd $default_extension_path

echo -ne "....."

cat << EOF > ./fpd_test.js
window.addEventListener("message", function (event) { 
    if (event.data.fpdTest) {
        console.log("FPD-TEST: CS> Message recieved from " + event.data.fpdTest + " test page.");
        try {
            browser.runtime.sendMessage({fpdTest: window.location.href});
        }
        catch {}
    }
});

browser.runtime.onMessage.addListener(function (message) {
    if (message.extensionLogs && message.currentLevel) { 
        console.log("FPD-TEST: CS> Extension data recieved from BS.");
     
        var passedCount = 0;
        var failedCount = 0;
        var unsupportedCount = 0;
        var unwrappedCount = 0;

        for (let child of document.getElementById("result").childNodes) {
            if (child.nodeName == "DIV") {
                var testResource = child.firstChild.firstChild.textContent;
                var levelResource = message.currentLevel[testResource];

                if (levelResource) {
                    for (let method of child.querySelectorAll("p > span.method > span")) {
                        if (levelResource.includes(method.className)) {
                            var logCount = 0;
                            if (message.extensionLogs[testResource]) {
                                if (message.extensionLogs[testResource][method.className]) {
                                    logCount = message.extensionLogs[testResource][method.className].total;
                                }
                            }
                            if (logCount == method.textContent) {
                                method.style.color = "green";
                                passedCount += 1;
                            }
							else if (message.exceptionWrappers.includes(testResource)) {
                                let selElement = child.querySelector("p > span.resource");
                                selElement.textContent = "→Exception: custom/additional wrapper";
                                selElement.style = "text-decoration: none;color: green;display:inline-block;";
                                passedCount += 1;
                            }
                            else {
                                method.style.color = "red";
                                failedCount += 1;
                            }

                            method.textContent = method.textContent + " → " + logCount;
                        }
                        else {
                            method.parentNode.style = "text-decoration: line-through;color: grey";
                        }
                    }
                }
                else {
                    let unsupported = message.unsupportedWrappers.find((item) => {
                        if (item.resource == testResource) return true;
                    });

                    if (unsupported) {
                        let selElement = child.querySelector("p > span.resource");
                        selElement.textContent = "→Unsupported by browser";
                        selElement.style = "text-decoration: none;color: orange;display:inline-block;";
                        unsupportedCount += 1;
                    }
                    else {
                        unwrappedCount += 1;
                    }
                    child.style = "text-decoration: line-through;color: grey";
                }
            }
        }
        
        document.getElementById("passed").innerHTML += passedCount;
        document.getElementById("failed").innerHTML += failedCount;
        document.getElementById("unsupported").innerHTML += unsupportedCount;
        document.getElementById("unwrapped").innerHTML += unwrappedCount;
    }
});
EOF

cat << EOF >> $fpd_background_name

//FPD_TESTING_S
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == "complete") {
		console.log("FPD-TEST: BS> Injecting content script.");
		browser.tabs.executeScript({
			file: "/fpd_test.js"
		});
	}
});

browser.runtime.onMessage.addListener(function (record, sender) {
	let prepareDb = (tabId) => {
		let tabLogs = {};
		for (let resource in fpDb[tabId]) {
			tabLogs[resource] = fpDb[tabId][resource]
		}
		refreshDb(tabId);
		return tabLogs;
	}

	let getCurrentLevel = (url) => {	
		var currentLevel = fpdSettings.detection ? fpdSettings.detection : 0;

		currentWrappers = {};

		let getTypes = (groups) => {
			var acc = [];

			for (let group of groups) {
				if (!group.property) {
					acc.push("get");
				}
				else {
					acc.push(group.property);
				}
			}

			return [...new Set(acc)];
		}

		for (let wrapper of fp_levels.wrappers[currentLevel]) {
			if (wrapper.type == "property") {
				currentWrappers[wrapper.resource] = getTypes(wrapper.groups);
			}
			else {
				currentWrappers[wrapper.resource] = ["call"];
			}
		}

		return [currentWrappers, unsupportedWrappers[currentLevel]];
	}

	if (record.fpdTest) {
		console.log("FPD-TEST: BS> Sending extension data.");
		var levelInfo = getCurrentLevel(record.fpdTest);
		browser.tabs.sendMessage(sender.tab.id, {
			extensionLogs: prepareDb(sender.tab.id),
			currentLevel: levelInfo[0],
			unsupportedWrappers: levelInfo[1],
			exceptionWrappers: exceptionWrappers
		});
	}
});
//FPD_TESTING_E
EOF

echo ".....DONE!"

echo "RUNNING make COMMAND TO BUILD EXTENSION:"
cd ..
make

cd $fpd_test_path

# this function is called when Ctrl-C is sent
trap_ctrlc()
{
	echo ""
    echo -ne "CLEANING FPD TESTING FILES TO ORIGINAL STATE....."

	sed -i "/.*<!--SCRIPTS_S-->.*/,/.*<!--SCRIPTS_E-->.*/{/.*<!--SCRIPTS_S-->.*/!{/.*<!--SCRIPTS_E-->.*/!d}}" ./index.html
	sed -i "/.*<!--SCRIPTS_S-->.*/,/.*<!--SCRIPTS_E-->.*/{/.*<!--SCRIPTS_S-->.*/!{/.*<!--SCRIPTS_E-->.*/!d}}" ./common/iframe.html
	sed -i "/.*\/\/SCRIPTS_S.*/,/.*\/\/SCRIPTS_E.*/{/.*\/\/SCRIPTS_S.*/!{/.*\/\/SCRIPTS_E.*/!d}}" ./common/worker.js

	for file in ./index.html ./common/iframe.html ./common/worker.js
	do
		sed -i "/.*\/\/CALL_S.*/,/.*\/\/CALL_E.*/{/.*\/\/CALL_S.*/!{/.*\/\/CALL_E.*/!d}}" $file
	done

	echo ".....DONE!"
	
    echo -ne "PERFORMING CLEAN-UP AND REVERTING EXTENSION FILES....."
	
	cd $default_extension_path
	rm -f ./fpd_test.js
	sed -i "/.*\/\/FPD_TESTING_S.*/,/.*\/\/FPD_TESTING_E.*/{/.*\/\/FPD_TESTING_S.*/!{/.*\/\/FPD_TESTING_E.*/!d}}" $fpd_background_name
	sed -i "/^\/\/FPD_TESTING_/d" $fpd_background_name
	sed -i '$ d' $fpd_background_name
	
    echo ".....DONE!"
	
	echo -ne "RUNNING make clean COMMAND TO CLEAR REPOSITORY....."
	cd ..
	make -s clean
	echo ".....DONE!"
    
	exit 0
}
 
# initialize trap to call trap_ctrlc function
trap "trap_ctrlc" 2

# start local server
echo "STARTING LOCAL SERVER FOR TESTING:"

php -S localhost:$server_port

# alternatively you can use python server
#python3 -m http.server $server_port
