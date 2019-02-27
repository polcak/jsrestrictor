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


if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

// set default level to 2 after install
function installUpdate() {
  browser.storage.sync.get(null, function (item) {
    var setDef = true;
    var setExtData = true;
    for (var domain in item) {
      if (item.hasOwnProperty(domain)) {
        // if default was set from last update / install, do not set default to 2
        if (domain == "__default__") {
          setDef = false;
        }
        if (domain == "extension_settings_data") {
          setExtData = false;
        }
      }
    }
    if (setDef) {
      browser.storage.sync.set({
        ["__default__"]: 2
      });
    }
    if (setExtData) {
      browser.storage.sync.set({
        extension_settings_data       
      });      
    }
  });
}
browser.runtime.onInstalled.addListener(installUpdate);

// open options
function handleClick() {
  browser.runtime.openOptionsPage();
}
browser.browserAction.onClicked.addListener(handleClick);

// set badge color
browser.browserAction.setBadgeBackgroundColor({color: "#4a4a4a"});

var url; // domain "fit.vutbr.com"
var rootDomain; // domain "vutbr.com"

// on tab reload or tab change, update badge
browser.tabs.onUpdated.addListener(tabEvent);  // reload tab
browser.tabs.onActivated.addListener(tabEvent);  // change tab

// get active tab and pass it 
var queryInfo = {
  active: true,
  currentWindow: true
};

// get url of active tab
function tabEvent(tabinfo) {  
  browser.tabs.query(queryInfo, function(tabs) {
    for (let tab of tabs) {
      url = tab.url;
    }
    updateBadge();
  });
}


// change url text to url object
var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

// update badge text 
function updateBadge() {
    
  url = getLocation(url);
  url.hostname = url.hostname.replace(/^www\./,'');
  rootDomain = extractRootDomain(url.hostname);
  var myAddon = new URL(browser.extension.getURL ('./'));

  // get storage data
  browser.storage.sync.get(null, function(res) {

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
          if (domain != "extension_settings_data" && domain == url.hostname) {
            activeLevel = res[domain];
            break;
          }
          if (domain != "extension_settings_data" && domain == rootDomain) {
            activeLevel = res[domain];
          }
      }
    }
    // set badge text or blank
    if (activeLevel == "4" && url.hostname != "" ) {
      browser.browserAction.setBadgeText({text: "C"});
    } else if (url.hostname != "" && url.hostname != myAddon.hostname && url.hostname != "newtab") {
      browser.browserAction.setBadgeText({text: "" + activeLevel});
    } else {
      browser.browserAction.setBadgeText({text: ""});
    }
  });
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


// shared variables across background.js, popup.js, options.js
var fadeOut = "0.3";
var fadeIn = "1.0";
var L0 = 0;
var L1 = 1;
var L2 = 2;
var L3 = 3;
var LC = 4; // custom
var LD = 5; // default

// default extension_settings_data setting  
var extension_settings_data = {
  "window_date": {
      "main_checkbox": false,
      "time_round_precision": "-3"
  },
  "window_performance_now": {
      "main_checkbox": false,
      "value_round_precision": "-3"
  },
  "window_html_canvas_element": {
      "main_checkbox": false,
      "type_of_restriction": "b"
  },
  "navigator_geolocation": {
      "main_checkbox": false,
      "type_of_restriction": "a",
      "gps_a": "0",
      "gps_b": "0",
      "gps_c": "0",
      "gps_d": "-1",
      "gps_e": "-1",
      "gps_f": "-1",
      "gps_g": "-1"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  }
}