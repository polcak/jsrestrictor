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
var isFirefox = window.chrome;
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
var ffAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0";
var chromeAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36";

var globalActiveLevel;


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
        if (globalActiveLevel == L2 && isFirefox == true)
          header.value = ffAgent;
        if (globalActiveLevel == L2 && isFirefox == false)
          header.value = chromeAgent;
        if (globalActiveLevel == L3)
          header.value = chromeAgent;
        if (globalActiveLevel == LC && isFirefox == true)
          header.value = ffAgent;
        if (globalActiveLevel == LC && isFirefox == false)
          header.value = chromeAgent;
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
    // if custom and url is not empty (e.g. newtab in firefox or similar)
    if (activeLevel == LC && url.hostname != "" ) {
      browser.browserAction.setBadgeText({text: "C"});
      // if not some newtab or similar set level number
    } else if (url.hostname != "" && url.hostname != myAddon.hostname && url.hostname != "newtab") {
      browser.browserAction.setBadgeText({text: "" + activeLevel});
      // if newtab or settings or similar is not real website, do not set badge text
    } else {
      browser.browserAction.setBadgeText({text: ""});
    }

    // set HTTP request header, fake user agent, fake referer/referrer - for info why these IFs, see levels description in docs
    if (activeLevel == L0 || activeLevel == L1) {
      fakeUserAgent = false;
      fakeReferer = false;

    } else if ((activeLevel > L1 && activeLevel < LC)) {
        fakeUserAgent = true;
        fakeReferer = true;

    } else if (res.extension_settings_data.user_agent.main_checkbox == true) {
      if (res.extension_settings_data.user_agent.type_of_restriction == "a") {
        isFirefox = true;
      }
      else {
        isFirefox = false;
      }
      fakeUserAgent = true;

      if (res.extension_settings_data.referer.main_checkbox == true) {
        fakeReferer = true;
      }
      else {
        fakeReferer = false;
      }
    }
    else if (res.extension_settings_data.user_agent.main_checkbox == false) {
      fakeUserAgent = false;

      if (res.extension_settings_data.referer.main_checkbox == true) {
        fakeReferer = true;
      }
      else {
        fakeReferer = false;
      }
    }

    // set HTTP request header fake language
    if (activeLevel == L0 || activeLevel == L1 || activeLevel == L2) {
      fakeLanguage = false;
    }
    else if (activeLevel == L3) {
      fakeLanguage = true;
    }
    else if (res.extension_settings_data.language.main_checkbox == true) {
      fakeLanguage = true;
    }
    else if (res.extension_settings_data.language.main_checkbox == false) {
      fakeLanguage = false;
    }

    globalActiveLevel = activeLevel;
  });
}

// get root domain. e.g. fit.vutbr.cz --> vutbr.cz
function extractRootDomain(thisDomain) {
    // var thisDomain = extractHostname(thisUrl);
    var splitArr = thisDomain.split('.');
    var arrLen = splitArr.length;
    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        thisDomain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (e.g. ".co.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            thisDomain = splitArr[arrLen - 3] + '.' + thisDomain;
        }
    }
    return thisDomain;
}


// shared variables across background.js, popup.js, options.js // not shared yet // TODO
var fadeOut = "0.3";
var fadeIn = "1.0";
var L0 = 0;
var L1 = 1;
var L2 = 2;
var L3 = 3;
var LC = 4; // custom
var LD = 5; // default

// default extension_settings_data setting. used on install
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
      "main_checkbox": false
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
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": false
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": false
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  }
}


