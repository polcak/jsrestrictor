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


// check if firefox or chrome for fake user agent setting
var isFirefox;
if ((typeof browser) !== "undefined") {
  isFirefox = true;
} else {
  isFirefox = false;
}

// either way, set browser var as chrome
if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

// fake user agent settings
var fakeUserAgent = false;
var fakeLanguage = false;
var fakeReferer = false;
var ffAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0";
var chromeAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729 Safari/537.36";

var globalActiveLevelJSON = {};


// set default level to 2 after install
function installUpdate() {
  browser.storage.sync.get(null, function (item) {
    var setDef = true;
    var setExtData = true;
    // check if default already set
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
    // on install set default level to 2 
    if (setDef) {
      browser.storage.sync.set({
        ["__default__"]: 2
      });
    }
    // same for custom setings
    if (setExtData) {
      browser.storage.sync.set({
        extension_settings_data       
      });      
    }
  });
  browser.tabs.create({'url':"https://polcak.github.io/jsrestrictor/"});
}
browser.runtime.onInstalled.addListener(installUpdate);


// set badge color
browser.browserAction.setBadgeBackgroundColor({color: "#4a4a4a"});

var url; // domain "fit.vutbr.com"
var rootDomain; // domain "vutbr.com"

// on tab reload or tab change, update badge
browser.tabs.onUpdated.addListener(tabEvent);     // reload tab
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



// rewrite user agent and other HTTP headers
function rewriteUserAgentHeader(e) {
  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() === "user-agent") {
      // if real browser is firefox, set on level 2 as fake firefox, on real chrome set fake chrome, level 3 always fake chrome
      if (fakeUserAgent) {
        if (globalActiveLevelJSON.user_agent.type_of_restriction === "a") {
          header.value = ffAgent;
        } else {
          header.value = chromeAgent;
        }
      }
    }
    // if faking language, change accept-language always to EN
    else if (header.name.toLowerCase() === "accept-language") {
      if (fakeLanguage) {
        header.value = "en-US,en;q=0.5";
      }
    }
    // if faking user agent, fake referer
    else if (header.name.toLowerCase() === "referer") {
      if (fakeReferer) {
        header.value = "";
      }
    }

  }
  return {requestHeaders: e.requestHeaders};
}

// firefox and chrome need different addListener with or without "extraHeaders"
var setHeaders;
// for firefox
if (isFirefox) {
  setHeaders = ["blocking","requestHeaders"];
}
// for chrome, opera
else {
  setHeaders = ["blocking","requestHeaders","extraHeaders"];
}

try {
  browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    {urls: ["<all_urls>"]},
    setHeaders
  );
} // opera bug: same as firefox but maybe in future opera versions same as chrome so... opera error fix:
catch(err) {
  browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    {urls: ["<all_urls>"]},
    ["blocking","requestHeaders"]
  );
}


// change url text to url object
function getLocation(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

// update badge text and set vars for HTTP headers
function updateBadge() {
  url = getLocation(url);
  url.hostname = url.hostname.replace(/^www\./,''); // remove www
  rootDomain = extractRootDomain(url.hostname);     // get root domain for later
  var myAddon = new URL(browser.extension.getURL ('./')); // my extension / addon url

  // get all storage data
  browser.storage.sync.get(null, function(res) {

    // find level for this site to use
    // go through storage data
    var activeLevel;
    for (var domain in res) {
      if (res.hasOwnProperty(domain)) {
          if (domain == "__default__") {
            activeLevel = res[domain];
          }
          // found sub domain e.g. fit.vutbr.cz in storage, break
          if (domain == url.hostname) {
            activeLevel = res[domain];
            break;
          }
          // get level for domain but keep looking for possible sub domain
          if (domain == rootDomain) {
            activeLevel = res[domain];
          }
      }
    }
    // set badge text or blank
    var currentLevel = getCurrentLevelJSON(activeLevel);
    // if custom and url is not empty (e.g. newtab in firefox or similar)
    if (url.hostname != "" && url.hostname != myAddon.hostname && url.hostname != "newtab") {
      browser.browserAction.setBadgeText({text: "" + currentLevel["level_text"]});
      // if newtab or settings or similar is not real website, do not set badge text
    } else {
      browser.browserAction.setBadgeText({text: ""});
    }

    fakeUserAgent = currentLevel.user_agent.main_checkbox;
    fakeReferer = currentLevel.referer.main_checkbox;
    fakeLanguage = currentLevel.language.main_checkbox;

    globalActiveLevelJSON = currentLevel;
  });
}
