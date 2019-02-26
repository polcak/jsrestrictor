if ((typeof browser) !== "undefined") {
  var chrome = browser;
}

// get storage data
chrome.storage.sync.get(null, function (res) {
 
  if (isJavaScriptObjectEmpty(res)) {
    return Promise.reject();
  }

  // find url / domain of current site
  var url = new URL(window.location.href);
  var rootDomain = extractRootDomain(url.hostname); // domain ako "example.com"
  url.hostname = url.hostname.replace(/^www\./,'');

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
  if (activeLevel == 4)
    currentLevel = res.extension_settings_data;

  // do magic

  // window.Date
  if (currentLevel.window_date.main_checkbox) {
    var digitPlacesToRoundCount = currentLevel.window_date.time_round_precision;
    
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createDateWrappingFunctionString(digitPlacesToRoundCount);
    document.getElementsByTagName('html')[0].appendChild(scriptTag);
  
    // var scriptTag2 = document.createElement('script');
    // scriptTag2.type = 'text/javascript';
    // scriptTag2.text = createDateNowWrappingFunctionString(digitPlacesToRoundCount);
    // document.getElementsByTagName('html')[0].appendChild(scriptTag2);
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
    var selectOption = currentLevel.window_html_canvas_element.type_of_restriction;
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = createHTMLCanvasElementPrototypeWrappingFunctionString(selectOption);
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

});

// functions for generating wrapping JavaScript code -- NOT USED
function createDateWrappingFunctionString(timePrecisionIndecimalPlaces) {
  var javaScriptCodeString = "\
  (function() {\
    var timeInMillisecondsPrecisionInDecimalPlaces = " + timePrecisionIndecimalPlaces + ";\
    var originalNow = window.Date.now;\
    var originalDateObject = window.Date;\
    originalDateObject.prototype = Date.prototype;\
    var originalParse = window.Date.parse;\
    var originalUTC = window.Date.UTC;\
    var originalLength = window.Date.length;\
    window.Date = function() {\
      var currentDateObject = new originalDateObject(...arguments);\
      var roundedValue = roundToPrecision(currentDateObject.getMilliseconds(), timeInMillisecondsPrecisionInDecimalPlaces);\
      currentDateObject.setMilliseconds(roundedValue);\
      return currentDateObject;\
    };\
    window.Date.now = function() {\
      return roundToPrecision(originalNow.call(Date), timeInMillisecondsPrecisionInDecimalPlaces);\
    };\
    window.Date.parse = originalParse;\
    window.Date.UTC = originalUTC;\
    window.Date.length = originalLength;\
  \
    function roundToPrecision(numberToRound, precision) {\
      var moveDecimalDot = Math.pow(10, precision);\
      return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;\
    }\
  }) ();\
  ";
  return javaScriptCodeString;
}

// function createDateNowWrappingFunctionString(timePrecisionIndecimalPlaces) {
//   var javaScriptCodeString = "\
// (\
//   function() {\
//     var timeInMillisecondsPrecisionInDecimalPlaces = " + timePrecisionIndecimalPlaces + ";\
//     var original = window.Date.now;\
//     window.Date.now = function() {\
//       return roundToPrecision(original.call(Date), timeInMillisecondsPrecisionInDecimalPlaces);\
//     };\
//     function roundToPrecision(numberToRound, precision) {\
//       var moveDecimalDot = Math.pow(10, precision);\
//       return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;\
//     }\
//   }\
// ) ();\
// ";
//   return javaScriptCodeString;
// }


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

function createHTMLCanvasElementPrototypeWrappingFunctionString(selectOption) {
  var blockWritingToCanvasesEntirely = false;
  if (selectOption == "b") {
    blockWritingToCanvasesEntirely = true;
  }

  var javaScriptCodeString = "\
  (function() {\
    var blockWritingToCanvasesEntirely = " + blockWritingToCanvasesEntirely + ";\
    var originalHTMLCanvasElementPrototype = window.HTMLCanvasElement.prototype.getContext;\
    window.HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {\
      if (!blockWritingToCanvasesEntirely && confirm('Enable drawing to canvas?')) {\
        return originalHTMLCanvasElementPrototype.call(this, contextType, contextAttributes);\
      }\
      else {\
        return null;\
      }\
    };\
  }) ();\
  ";

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

  var javaScriptCodeString = "\
  (function() {\
    var blockEveryXMLHttpRequest = " + blockEveryXMLHttpRequest + ";\
    var originalXMLHttpRequest = window.XMLHttpRequest;\
    window.XMLHttpRequest = function() {\
      var currentXMLHttpRequestObject = new originalXMLHttpRequest();\
      var originalXMLHttpRequestOpenFunction = currentXMLHttpRequestObject.open;\
      currentXMLHttpRequestObject.open = function(requestMethod, requestURL, requestParameterAsync, requestUsername, requestPassword) {\
        if (blockEveryXMLHttpRequest || !confirm('There is a XMLHttpRequest on URL \"' + requestURL + '\". Do you want to continue?')) {\
          return undefined;\
        }\
        if (requestParameterAsync == undefined) {\
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL);\
        }\
        else if (requestUsername == undefined) {\
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync);\
        }\
        else if (requestPassword == undefined) {\
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync, requestUsername);\
        }\
        else {\
          return originalXMLHttpRequestOpenFunction.call(currentXMLHttpRequestObject, requestMethod, requestURL, requestParameterAsync, requestUsername, requestPassword);\
        }\
      };\
      return currentXMLHttpRequestObject;\
    };\
  }) ();\
  ";

  return javaScriptCodeString;
}

// other functions
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
      "main_checkbox": false,
      "type_of_restriction": "a"
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
      "main_checkbox": false,
      "type_of_restriction": "a"
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
      "main_checkbox": true,
      "type_of_restriction": "b"
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "a",
      "gps_a": "1",
      "gps_b": "1",
      "gps_c": "-1",
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
      "main_checkbox": true,
      "type_of_restriction": "b"
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
  }
}

// // TODO
// function convertJSONtoLevel(json) {
//   console.log("JSON:");
//   console.log(json);
// }
// const path = chrome.runtime.getURL("levels/level_0.json");
// fetch(path).then((response) => response.json()).then((json) => convertJSONtoLevel(json));