//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2019  Libor Polcak
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//


// set browser var as chrome
if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

const fadeOut = "0.3";
const fadeIn = "1.0";

var myAddon = new URL(browser.runtime.getURL ('./')); // get my extension / addon url
var url; // "www.example.com"
var activeClass = "level active";
var activeLevel;
var subDomain = false;

// load popup event
window.addEventListener('load', function() {
    checkCurrentLevelOfDomain();
})

// go to settings on click
document.getElementById('settings-icon').addEventListener('click', function (e) {
	browser.runtime.openOptionsPage();
	window.close();
});



//// "SET LEVEL ON:" part ////
// go through storage and set active class to active levels // item[domain] == level
function checkCurrentLevelOfDomain() {
	browser.storage.sync.get(null, function(item) {

		// clear active class for UI
		clearAllLevels(false);
		// set default level as active
		var elm = document.querySelector("#levels-site #level-"+ LD);
		elm.classList.add("active");

		for (var domain in item) {
			if (item.hasOwnProperty(domain)) {
		        // found sub domain e.g. fit.vutbr.cz in storage, break
				if (domain == url.hostname) {
					elm.classList.remove("active");
					document.querySelector("#levels-site #level-"+ item[domain]).classList.add("active");
					document.querySelector("#third-row").style.opacity = fadeOut;
					activeLevel = item[domain];
        			subDomain = false;
					break;
				}
				// set active class to default level
				if (domain == "__default__") {
					document.querySelector("#levels-default #level-"+ item[domain]).classList.add("active");
					activeLevel = item[domain];
				}
          		// get level for domain but keep looking for possible sub domain
				if (domain == extractRootDomain(url.hostname)) {
        			activeLevel = item[domain];
        			activeDomain = domain;
        			subDomain = true;
      			}
			}
		}
		// set "Active level" level 
		document.getElementById('active-level').innerHTML = (activeLevel == LC ? "Custom" : activeLevel);
		// if root domain has specific level but subdomain doesnt, inform user that this subdoain has level based on root domain 
		if (subDomain) {
			document.getElementById('active-domain').innerHTML = "based on <span id=\"active-domain-text\">"+ activeDomain + " </span>";
		}
	});
}

// set events for level of site buttons
document.querySelector("#levels-site #level-0").addEventListener("click", function() {setLevelForDomain(L0);});
document.querySelector("#levels-site #level-1").addEventListener("click", function() {setLevelForDomain(L1);});
document.querySelector("#levels-site #level-2").addEventListener("click", function() {setLevelForDomain(L2);});
document.querySelector("#levels-site #level-3").addEventListener("click", function() {setLevelForDomain(L3);});
document.querySelector("#levels-site #level-4").addEventListener("click", function() {setLevelForDomain(LC);});
document.querySelector("#levels-site #level-5").addEventListener("click", function() {setLevelForDomain(LD);});

// add domain to domain list with level
function setLevelForDomain(level) {
	// if newtab or extension url or empty site... do not set spedific level on that domain
	if (url.hostname == "" || url.hostname == myAddon.hostname || url.hostname == "newtab") {
		return;
	}
	// if clicked on 0 1 2 3 or custom add domain to domain list
	if (level < LD) {
		browser.storage.sync.set({
      		[url.hostname]: level
    	});
  		document.querySelector("#third-row").style.opacity = fadeOut;
	}

	// clicked on "Defaut" --> remove domain from domain list
	else {
	 	browser.storage.sync.remove(url.hostname, function() {
	 		document.querySelector("#third-row").style.opacity = fadeIn;
	 	});
	}
	// set new active level for site and add "Refresh page"
	clearAllLevels(false);
    document.querySelector("#levels-site #level-"+ level).classList.add("active");
    document.getElementById('set-level-on').innerHTML = "<a href=\"\" id=\"refresh-page\">Refresh page</a>";
    document.getElementById('refresh-page').addEventListener('click', function (e) {
		browser.tabs.reload();
		window.close();
	});
}


//// "SET DEFAULT LEVEL TO:" part ////
// set events for default level buttons
document.querySelector("#levels-default #level-0").addEventListener("click", function() {setDefaultLevelTo(L0);});
document.querySelector("#levels-default #level-1").addEventListener("click", function() {setDefaultLevelTo(L1);});
document.querySelector("#levels-default #level-2").addEventListener("click", function() {setDefaultLevelTo(L2);});
document.querySelector("#levels-default #level-3").addEventListener("click", function() {setDefaultLevelTo(L3);});
document.querySelector("#levels-default #level-4").addEventListener("click", function() {setDefaultLevelTo(LC);});

// change default level in  storage
function setDefaultLevelTo(level) {
	browser.storage.sync.set({
    	__default__: level
	});

	// set new active level for default level and add "Refresh page"
	clearAllLevels(true);
   	document.querySelector("#levels-default #level-"+ level).classList.add("active");
	document.getElementById('set-default-level').innerHTML = "<a href=\"\" id=\"refresh-page\">Refresh page</a>";
	document.getElementById('refresh-page').addEventListener('click', function (e) {
		browser.tabs.reload();
		window.close();
	});
}




// remove active class from elements // def - True for "Set level on:" part, False for "Set default level to:" 
function clearAllLevels(def) {
	if (def) {
		for (var i = 0; i <= 4; i++) {
			var elm = document.querySelector("#levels-default #level-"+ i);
			elm.classList.remove("active");
		}
	}
	else {
		for (var i = 0; i <= 5; i++) {
			var elm = document.querySelector("#levels-site #level-"+ i);
			elm.classList.remove("active");
		}
	}
}


//find url of current tab where popup showed
var queryInfo = {
  active: true,
  currentWindow: true
};
browser.tabs.query(queryInfo, function(tabs) {

    let tab = tabs[0];
    url = new URL(tab.url);
    // remove www
    url.hostname = url.hostname.replace(/^www\./,'');

    if (url.hostname == "" || url.hostname == myAddon.hostname || url.hostname == "newtab") {
    	document.querySelector("#second-row-without-border").style.opacity = fadeOut;
    } else {
 	   document.getElementById('current-site').innerHTML = url.hostname;
	}
});

function extractRootDomain(thisDomain) {
    // var thisDomain = extractHostname(thisUrl);
    var splitArr = thisDomain.split('.');
    var arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        thisDomain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            thisDomain = splitArr[arrLen - 3] + '.' + thisDomain;
        }
    }
    return thisDomain;
}
