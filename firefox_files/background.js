// set default level to 2 after install
function installUpdate() {
  var myStorage = browser.storage.sync.get();
  myStorage.then(check, onError);
}
function check(item) {
  var set = true;
  for (var domain in item) {
    if (item.hasOwnProperty(domain)) {
      // if default was set from last update / install, do not set default to 2
      if (domain == "__default__") {
        set = false;
      }
    }
  }
  if (set) {
    var sent = browser.storage.sync.set({
      ["__default__"]: 2
    });
  }
}
browser.runtime.onInstalled.addListener(installUpdate);

// open options
function handleClick() {
  browser.runtime.openOptionsPage();
}
browser.browserAction.onClicked.addListener(handleClick);

// set badge color
browser.browserAction.setBadgeBackgroundColor({color: "#4a4a4a"});

var urlcko; // domain ako "fit.vutbr.com"
var rootDomain; // domain ako "vutbr.com"

// on tab reload or tab change, update badge
browser.tabs.onUpdated.addListener(tabEvent);	// reload tab
browser.tabs.onActivated.addListener(tabEvent);	// change tab

// get active tab and pass it 
function tabEvent(tabinfo) {	
	var querying = browser.tabs.query({active: true});
	querying.then(getTab, onError);
}

// get url of active tab
function getTab(tabs) {
  for (let tab of tabs) {
    urlcko = tab.url;
  }
  updateBadge();
}

// change url text to url object
var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

// update badge text 
function updateBadge() {
  	
	urlcko = getLocation(urlcko);
  urlcko.hostname = urlcko.hostname.replace(/^www\./,'');
  rootDomain = extractRootDomain(urlcko.hostname);
  var myAddon = new URL(browser.extension.getURL ('./'));

	// get storage data
	var data = browser.storage.sync.get();
	data.then((res) => {
		if (isJavaScriptObjectEmpty(res)) {
			return Promise.reject();
		}

  		// find level for this site to use
  		var activeLevel;
  		for (var domain in res) {
    		if (res.hasOwnProperty(domain)) {
      			if (domain == "__default__") {
        			activeLevel = res[domain];
      			}
      			if (domain != "extension_settings_data" && domain == urlcko.hostname) {
        			activeLevel = res[domain];
              break;
      			}
            if (domain != "extension_settings_data" && domain == rootDomain) {
              activeLevel = res[domain];
            }
    		}
  		}
  		// set badge text or blank
  		if (activeLevel == "4" && urlcko.hostname != "") {
  			browser.browserAction.setBadgeText({text: "C"});
  		} else if (urlcko.hostname != "" && urlcko.hostname != myAddon.hostname) {
  			browser.browserAction.setBadgeText({text: "" + activeLevel});
  		} else {
  			browser.browserAction.setBadgeText({text: ""});
  		}
  	});
}

// err
function onError(timoerr) {
  console.log(timoerr);
}

// check if object empty
function isJavaScriptObjectEmpty(object) {
  for(var property in object) {
    if(object.hasOwnProperty(property))
      return false;
  }
  return true;
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
