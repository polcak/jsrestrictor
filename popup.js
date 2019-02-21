const L0 = 0;
const L1 = 1;
const L2 = 2;
const L3 = 3;
const LC = 4;	// custom
const LD = 5;	// default

// var myBackgroundPage = browser.extension.getBackgroundPage();	

var myAddon = new URL(browser.extension.getURL ('./'));
var url; // povodne domain "www.example.com"
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
// document.getElementById('settings-button').addEventListener('click', function (e) {
// 	browser.runtime.openOptionsPage();
// 	window.close();
// });



// "SET LEVEL ON:" PART
function checkCurrentLevelOfDomain() {
	var allDomains = browser.storage.sync.get();
	allDomains.then(setActive, onError);
}
// go through storage and set active class to active levels // item[domain] == level
function setActive(item) {



	// clear active class for UI
	clearAllLevels(false);
	// set default level as active
	var elm = document.querySelector("#levels-site #level-"+ LD);
	elm.classList.add("active");

	for (var domain in item) {
		if (item.hasOwnProperty(domain)) {
			// if site is in domain list, change active class from default to domain setting
			if (domain != "extension_settings_data" && domain == url.hostname) {
				elm.classList.remove("active");
				document.querySelector("#levels-site #level-"+ item[domain]).classList.add("active");
				document.querySelector("#third-row").style.opacity = "0.3";
				activeLevel = item[domain];
        		subDomain = false;
				break;
			}
			// set active class to default level
			if (domain == "__default__") {
				document.querySelector("#levels-default #level-"+ item[domain]).classList.add("active");
				activeLevel = item[domain];
			}
			if (domain != "extension_settings_data" && domain == extractRootDomain(url.hostname)) {
        		activeLevel = item[domain];
        		activeDomain = domain;
        		subDomain = true;
      		}
		}
	}
	document.getElementById('active-level').innerHTML = (activeLevel == LC ? "Custom" : activeLevel);
	if (subDomain) {
		document.getElementById('active-domain').innerHTML = "based on <span id=\"active-domain-text\">"+ activeDomain + " </span>";
	}
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
	if (url.hostname == "" || url.hostname == myAddon.hostname) {
		return;
	}
	if (level < 5) {
		var sent = browser.storage.sync.set({
      		[url.hostname]: level
    	});
    	if (sent) {
    		document.querySelector("#third-row").style.opacity = "0.3";
  		}
	}

	// clicked on "Defaut" ==> remove domain from domain list
	else {
	 	var removeFromList = browser.storage.sync.remove(url.hostname);
	 	document.querySelector("#third-row").style.opacity = "1.0";
  		removeFromList.then(onRemoved, onError);
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

// confirmation 
function onRemoved() {
  console.log("Removed");
}


// "SET DEFAULT LEVEL TO:" PART
// set events for default level buttons
document.querySelector("#levels-default #level-0").addEventListener("click", function() {setDefaultLevelTo(L0);});
document.querySelector("#levels-default #level-1").addEventListener("click", function() {setDefaultLevelTo(L1);});
document.querySelector("#levels-default #level-2").addEventListener("click", function() {setDefaultLevelTo(L2);});
document.querySelector("#levels-default #level-3").addEventListener("click", function() {setDefaultLevelTo(L3);});
document.querySelector("#levels-default #level-4").addEventListener("click", function() {setDefaultLevelTo(LC);});

// change / default level to storage
function setDefaultLevelTo(level) {
	var sent = browser.storage.sync.set({
    	__default__: level
	});

	// set new active level for default level and add "Refresh page", if write to storage successful
	if (sent) {
		clearAllLevels(true);
    	document.querySelector("#levels-default #level-"+ level).classList.add("active");
		document.getElementById('set-default-level').innerHTML = "<a href=\"\" id=\"refresh-page\">Refresh page</a>";
		document.getElementById('refresh-page').addEventListener('click', function (e) {
			browser.tabs.reload();
			window.close();
		});
	}
}




// COMMON FUNCTIONS

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
browser.tabs.query({currentWindow: true, active: true}).then(logTabs, onError);
function logTabs(tabs) {
    let tab = tabs[0];
    url = new URL(tab.url);
    // remove www
    url.hostname = url.hostname.replace(/^www\./,'');

    if (url.hostname == "" || url.hostname == myAddon.hostname) {
    	document.querySelector("#second-row-without-border").style.opacity = "0.3";
    } else {
 	   document.getElementById('current-site').innerHTML = url.hostname;
	}
}
// err
function onError(timoerr){
    console.error(timoerr);
}


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