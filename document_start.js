//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2018  Zbynek Cervinka
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

// fake user agent and vendor settings
var ffAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0";
var ffVendor = ""
var chromeAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729 Safari/537.36";
var chromeVendor = "Google Inc.";


// get all storage data
browser.storage.sync.get(null, function (res) {

  // find url / domain of current site
  var url = new URL(window.location.href);
  var rootDomain = extractRootDomain(url.hostname); // domain "example.com"
  url.hostname = url.hostname.replace(/^www\./,''); // remove www

  // find level for this site to use
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

  // what settings are going to be used
  var currentLevel;
  if (activeLevel == 0)
    currentLevel = level_0;
  if (activeLevel == 1)
    currentLevel = level_1;
  if (activeLevel == 2)
    currentLevel = level_2;
  if (activeLevel == 3)
    currentLevel = level_3;
  // custom
  if (activeLevel == 4)
    currentLevel = res.extension_settings_data;

  // wrap object / functions
  // window.Date
  if (currentLevel.window_date.main_checkbox) {
    var digitPlacesToRoundCount = currentLevel.window_date.time_round_precision;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createDateWrappingFunctionString(digitPlacesToRoundCount);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  
  }

  // window.performance
  if (currentLevel.window_performance_now.main_checkbox) {
    var digitPlacesToRoundCount = currentLevel.window_performance_now.value_round_precision;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createPerformanceNowWrappingFunctionString(digitPlacesToRoundCount);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // window.HTMLCanvasElement
  if (currentLevel.window_html_canvas_element.main_checkbox) {
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createHTMLCanvasElementPrototypeWrappingFunctionString();
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // navigator.geolocation
  if (currentLevel.navigator_geolocation.main_checkbox) {
      var isDateAlteringEnabled = currentLevel.window_date.main_checkbox;
      var timestampPrecision = 0;
      if (isDateAlteringEnabled) {
        timestampPrecision = currentLevel.window_date.time_round_precision;
      }

      var scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = createGeolocationGetCurrentPositionWrappingFunctionString(
          currentLevel.navigator_geolocation.type_of_restriction,
          currentLevel.navigator_geolocation.gps_a,
          currentLevel.navigator_geolocation.gps_b,
          currentLevel.navigator_geolocation.gps_c,
          currentLevel.navigator_geolocation.gps_d,
          currentLevel.navigator_geolocation.gps_e,
          currentLevel.navigator_geolocation.gps_f,
          currentLevel.navigator_geolocation.gps_g,
          timestampPrecision
        );
      document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // window.XMLHttpRequest
  if (currentLevel.window_xmlhttprequest.main_checkbox) {
    var selectOption = currentLevel.window_xmlhttprequest.type_of_restriction;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createXMLHttpRequestWrappingFunctionString(selectOption);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // User Agent info, platform, vendor....
  if (currentLevel.user_agent.main_checkbox) {
    var selectOption = currentLevel.user_agent.type_of_restriction;
    if (activeLevel == 4) {
      var isCustomLevel = true;
    }
    else {
      var isCustomLevel = false;
    }
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createUserAgentWrappingFunctionString(selectOption, isCustomLevel);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // document.referrer
  if (currentLevel.referer.main_checkbox) {
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createRefererWrappingFunctionString();
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // navigator.language
  if (currentLevel.language.main_checkbox) {
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createLanguageWrappingFunctionString();
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // navigator.deviceMemory, navigator.hardwareConcurrency
  if (currentLevel.hardware.main_checkbox) {
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createHardwareWrappingFunctionString();
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // navigator.cookieEnabled
  if (currentLevel.cookie_enabled.main_checkbox) {
    var selectOption = currentLevel.cookie_enabled.type_of_restriction;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createCookieEnabledWrappingFunctionString(selectOption);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

  // navigator.doNotTrack
  if (currentLevel.DNT_enabled.main_checkbox) {
    var selectOption = currentLevel.DNT_enabled.type_of_restriction;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createDNTWrappingFunctionString(selectOption);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  }

});

// functions for generating wrapping JavaScript code -- NOT USED
function createDateWrappingFunctionString(timePrecisionIndecimalPlaces) {
  var javaScriptCodeString = `
  (function() {
    var timeInMillisecondsPrecisionInDecimalPlaces = ${timePrecisionIndecimalPlaces};
    var originalDateConstructor = window.Date;
    window.Date = function() {
      var currentDateObject = new originalDateConstructor(...arguments);
      var roundedValue = roundToPrecision(currentDateObject.getMilliseconds(), timeInMillisecondsPrecisionInDecimalPlaces);
      currentDateObject.setMilliseconds(roundedValue);
      return currentDateObject;
    };
    window.Date.now = function() {
      return roundToPrecision(originalDateConstructor.now.call(Date), timeInMillisecondsPrecisionInDecimalPlaces);
    };
    window.Date.prototype = originalDateConstructor.prototype;
    Object.setPrototypeOf(window.Date, originalDateConstructor);

    function roundToPrecision(numberToRound, precision) {
      var moveDecimalDot = Math.pow(10, precision);
      return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;
    }
  }) ();
  `;

  return javaScriptCodeString;
}

function createPerformanceNowWrappingFunctionString(performanceNowPrecisionIndecimalPlaces) {
  var javaScriptCodeString = "\
  (function() {\
    var performanceNowPrecisionIndecimalPlaces = " + performanceNowPrecisionIndecimalPlaces + ";\
    var originalPerformanceNowFunction = window.performance.now;\
    window.performance.now = function() {\
      var originalPerformanceValue = originalPerformanceNowFunction.call(window.performance);\
      var roundedValue = roundToPrecision(originalPerformanceValue, performanceNowPrecisionIndecimalPlaces);\
      return roundedValue;\
    };\
  \
    function roundToPrecision(numberToRound, precision) {\
      var moveDecimalDot = Math.pow(10, precision);\
      return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;\
    }\
  }) ();\
  ";

  return javaScriptCodeString;
}


function createHTMLCanvasElementPrototypeWrappingFunctionString() {
  var javaScriptCodeString = `
    (function(){
      var origToDataURL = HTMLCanvasElement.prototype.toDataURL;

      HTMLCanvasElement.prototype.toDataURL = function(type, encoderOptions) {
        var ctx = this.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.width, this.height);
        return origToDataURL.call(this, type, encoderOptions);
      };
    })();
  `;

  return javaScriptCodeString;
}

function createGeolocationGetCurrentPositionWrappingFunctionString(selectOption, latitudePrecision, longitudePrecision, altitudePrecision, accuracyPrecision, altitudePrecision, headingPrecision, speedPrecision, timestampPrecision) {
  var setAllGPSDataToZero = false;
  if (selectOption == "b") {
    setAllGPSDataToZero = true;
  }
  var latitudePrecisionInDecimalPlaces = latitudePrecision;
  var longitudePrecisionInDecimalPlaces = longitudePrecision;
  var altitudePrecisionInDecimalPlaces = altitudePrecision;
  var accuracyPrecisionInDecimalPlaces = accuracyPrecision;
  var altitudeAccuracyPrecisionInDecimalPlaces = altitudePrecision;
  var headingPrecisionInDecimalPlaces = headingPrecision;
  var speedPrecisionInDecimalPlaces = speedPrecision;
  var timestampPrecisionInDecimalPlaces = timestampPrecision;

  var javaScriptCodeString = "\
  (function() {\
  var setAllGPSDataToZero = " + setAllGPSDataToZero + ";\
  \
  var latitudePrecisionInDecimalPlaces = " + latitudePrecisionInDecimalPlaces + ";\
  var longitudePrecisionInDecimalPlaces = " + longitudePrecisionInDecimalPlaces + ";\
  var altitudePrecisionInDecimalPlaces = " + altitudePrecisionInDecimalPlaces + ";\
  var accuracyPrecisionInDecimalPlaces = " + accuracyPrecisionInDecimalPlaces + ";\
  var altitudeAccuracyPrecisionInDecimalPlaces = " + altitudeAccuracyPrecisionInDecimalPlaces + ";\
  var headingPrecisionInDecimalPlaces = " + headingPrecisionInDecimalPlaces + ";\
  var speedPrecisionInDecimalPlaces = " + speedPrecisionInDecimalPlaces + ";\
  var timestampPrecisionInDecimalPlaces = " + timestampPrecisionInDecimalPlaces + ";\
  \
  var originalGetCurrentPositionFunction = navigator.geolocation.getCurrentPosition;\
  navigator.geolocation.getCurrentPosition = function(functionName) {\
  \
    originalGetCurrentPositionFunction.call(navigator.geolocation, processOriginalGPSDataObject);\
  \
    function processOriginalGPSDataObject(originalPositionObject) {\
      var newLatitude = 0;\
      var newLongitude = 0;\
      var newAltitude = 0;\
      var newAccuracy = 0;\
      var newAltitudeAccuracy = 0;\
      var newHeading = 0;\
      var newSpeed = 0;\
      var newTimestamp = 0;\
  \
      if (!setAllGPSDataToZero) {\
        if (originalPositionObject.coords.latitude != null && originalPositionObject.coords.latitude != Infinity && originalPositionObject.coords.latitude >= 0) {\
            newLatitude = roundToPrecision(originalPositionObject.coords.latitude, latitudePrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.longitude != null && originalPositionObject.coords.longitude != Infinity && originalPositionObject.coords.longitude >= 0) {\
          newLongitude = roundToPrecision(originalPositionObject.coords.longitude, longitudePrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.altitude != null && originalPositionObject.coords.altitude != Infinity && originalPositionObject.coords.altitude >= 0) {\
          newAltitude = roundToPrecision(originalPositionObject.coords.altitude, altitudePrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.accuracy != null && originalPositionObject.coords.accuracy != Infinity && originalPositionObject.coords.accuracy >= 0) {\
          newAccuracy = roundToPrecision(originalPositionObject.coords.accuracy, accuracyPrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.altitudeAccuracy != null && originalPositionObject.coords.altitudeAccuracy != Infinity && originalPositionObject.coords.altitudeAccuracy >= 0) {\
          newAltitudeAccuracy = roundToPrecision(originalPositionObject.coords.altitudeAccuracy, altitudeAccuracyPrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.heading != null && originalPositionObject.coords.heading != Infinity && originalPositionObject.coords.heading >= 0) {\
          newHeading = roundToPrecision(originalPositionObject.coords.heading, headingPrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.coords.speed != null && originalPositionObject.coords.speed != Infinity && originalPositionObject.coords.speed >= 0) {\
          newSpeed = roundToPrecision(originalPositionObject.coords.speed, speedPrecisionInDecimalPlaces);\
        }\
        if (originalPositionObject.timestamp != null && originalPositionObject.timestamp != Infinity && originalPositionObject.timestamp >= 0) {\
          newTimestamp = roundToPrecision(originalPositionObject.timestamp, timestampPrecisionInDecimalPlaces);\
        }\
      }\
  \
      const editedPositionObject = {\
        coords: {\
          latitude: newLatitude,\
          longitude: newLongitude,\
          altitude: newAltitude,\
          accuracy: newAccuracy,\
          altitudeAccuracy: newAltitudeAccuracy,\
          heading: newHeading,\
          speed: newSpeed,\
          __proto__: originalPositionObject.coords.__proto__\
        },\
        timestamp: newTimestamp,\
        __proto__: originalPositionObject.__proto__\
      };\
  \
      functionName.call(this, editedPositionObject);\
      return true;\
    }\
    return undefined;\
  };\
  \
  function roundToPrecision(numberToRound, precision) {\
    var moveDecimalDot = Math.pow(10, precision);\
    return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;\
  }\
  }) ();\
  ";

  return javaScriptCodeString;
}

function createXMLHttpRequestWrappingFunctionString(selectOption) {
  var blockEveryXMLHttpRequest = false;
  if (selectOption == "b") {
    blockEveryXMLHttpRequest = true;
  }

  var javaScriptCodeString = `
  (function() {
    var blockEveryXMLHttpRequest = ${blockEveryXMLHttpRequest};
    var originalXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      var currentXMLHttpRequestObject = new originalXMLHttpRequest();
      var originalXMLHttpRequestOpenFunction = currentXMLHttpRequestObject.open;
      currentXMLHttpRequestObject.open = function(requestMethod, requestURL, requestParameterAsync, requestUsername, requestPassword) {
        if (blockEveryXMLHttpRequest || !confirm('There is a XMLHttpRequest on URL ${requestURL}. Do you want to continue?')) {
          return undefined;
        }
        if (requestParameterAsync == undefined) {
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL);
        }
        else if (requestUsername == undefined) {
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync);
        }
        else if (requestPassword == undefined) {
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync, requestUsername);
        }
        else {
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync, requestUsername, requestPassword);
        }
      };
      return currentXMLHttpRequestObject;
    };
  }) ();
  `;

  return javaScriptCodeString;
}

function createUserAgentWrappingFunctionString(selectOption, customLevel) {
    var fakeAgent;
    var fakeVendor;
    // if not custom and level 2 then set fakeAgent based on real browser (level 2 has "a" as default)
    if (customLevel == false && selectOption == "a") {
      if (isFirefox == true) {
        fakeAgent = ffAgent;
        fakeVendor = ffVendor;
      }
      else {
        fakeAgent = chromeAgent;
        fakeVendor = chromeVendor;
      }
    }
    // if not custom and level 3 then always chrome (level 3 has "b" as default)
    else if (customLevel == false && selectOption == "b") {
      fakeAgent = chromeAgent;
      fakeVendor = chromeVendor;
    }

    // if custom ignore real browser and set custom setting
    else if (customLevel == true && selectOption == "a") {
      fakeAgent = ffAgent;
      fakeVendor = ffVendor;
    }
    else if (customLevel == true && selectOption == "b") {
      fakeAgent = chromeAgent;
      fakeVendor = chromeVendor;
    }

    javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"userAgent", {
        get: function () { return "${fakeAgent}"; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"vendor", {
        get: function () { return "${fakeVendor}"; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"platform", {
        get: function () { return "Win32"; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"appVersion", {
        get: function () { return "5.0 (Windows)"; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"oscpu", {
        get: function () { return undefined; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;

  return javaScriptCodeString;
}

function createRefererWrappingFunctionString() {
    javaScriptCodeString = `
    (function() {
        Object.defineProperty(document,"referrer", {
        get: function () { return ""; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;

    return javaScriptCodeString;
}

function createLanguageWrappingFunctionString() {
  javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"language", {
        get: function () { return "en-US"; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"languages", {
        get: function () { return ["en-US", "en"]; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;

  return javaScriptCodeString;
}

function createHardwareWrappingFunctionString() {
  javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"deviceMemory", {
        get: function () { return 4; },
        set: function (a) {},
        configurable: false
      });
      Object.defineProperty(navigator,"hardwareConcurrency", {
        get: function () { return 2; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;

  return javaScriptCodeString;
}

function createCookieEnabledWrappingFunctionString(selectOption) {
  var setTrue = true;
  if (selectOption == "b") {
    setTrue = false;
  }

  if (setTrue) {
    javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"cookieEnabled", {
        get: function () { return true; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;
  } else {
    javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"cookieEnabled", {
        get: function () { return false; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;
  }

  return javaScriptCodeString;
}

function createDNTWrappingFunctionString(selectOption) {
  var setYes = true;
  if (selectOption == "b") {
    setYes = false;
  }

  if (setYes) {
    javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"doNotTrack", {
        get: function () { return "1"; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;
  } else {
    javaScriptCodeString = `
    (function() {
      Object.defineProperty(navigator,"doNotTrack", {
        get: function () { return "0"; },
        set: function (a) {},
        configurable: false
      });
    }) ();
    `;
  }

  return javaScriptCodeString;
}



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


// levels of protection

var level_0 = {
  "window_date": {
      "main_checkbox": false,
      "time_round_precision": "-1"
  },
  "window_performance_now": {
      "main_checkbox": false,
      "value_round_precision": "-1"
  },
  "window_html_canvas_element": {
      "main_checkbox": false
  },
  "navigator_geolocation": {
      "main_checkbox": false,
      "type_of_restriction": "a",
      "gps_a": "4",
      "gps_b": "4",
      "gps_c": "-1",
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
var level_1 = {
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-1"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-1"
  },
  "window_html_canvas_element": {
      "main_checkbox": false
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "a",
      "gps_a": "2",
      "gps_b": "2",
      "gps_c": "-1",
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
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
var level_2 = {
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-2"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-2"
  },
  "window_html_canvas_element": {
      "main_checkbox": true
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "a",
      "gps_a": "1",
      "gps_b": "1",
      "gps_c": "-2",
      "gps_d": "-2",
      "gps_e": "-2",
      "gps_f": "-2",
      "gps_g": "-2"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "user_agent": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": true
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
var level_3 = {
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-3"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-3"
  },
  "window_html_canvas_element": {
      "main_checkbox": true
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "b",
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
      "type_of_restriction": "b"
  },
  "user_agent": {
      "main_checkbox": true,
      "type_of_restriction": "b"
  },
  "referer": {
      "main_checkbox": true
  },
  "language": {
      "main_checkbox": true
  },
  "hardware": {
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
