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


if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

//// JSR Custom settings ////
// save JSR Custom settings
function saveOptions(e) {
  browser.storage.sync.set({
    extension_settings_data: {
      window_date: {
        main_checkbox: document.querySelector("#window_date_main_checkbox").checked,
        time_round_precision: document.querySelector("#window_date_time_round_precision").value
      },
      window_performance_now: {
        main_checkbox: document.querySelector("#performance_now_main_checkbox").checked,
        value_round_precision: document.querySelector("#performance_now_value_round_precision").value
      },
      window_html_canvas_element: {
        main_checkbox: document.querySelector("#htmlcanvaselement_main_checkbox").checked
      },
      navigator_geolocation: {
        main_checkbox: document.querySelector("#navigator_geolocation_main_checkbox").checked,
        type_of_restriction: document.querySelector("#navigator_geolocation_type_of_restriction").value,
        gps_a: document.querySelector("#navigator_geolocation_rounding_precision_of_item_a").value,
        gps_b: document.querySelector("#navigator_geolocation_rounding_precision_of_item_b").value,
        gps_c: document.querySelector("#navigator_geolocation_rounding_precision_of_item_c").value,
        gps_d: document.querySelector("#navigator_geolocation_rounding_precision_of_item_d").value,
        gps_e: document.querySelector("#navigator_geolocation_rounding_precision_of_item_e").value,
        gps_f: document.querySelector("#navigator_geolocation_rounding_precision_of_item_f").value,
        gps_g: document.querySelector("#navigator_geolocation_rounding_precision_of_item_g").value
      },
      window_xmlhttprequest: {
        main_checkbox: document.querySelector("#xmlhttprequest_main_checkbox").checked,
        type_of_restriction: document.querySelector("#xmlhttprequest_type_of_restriction").value
      },
      user_agent: {
        main_checkbox: document.querySelector("#useragent_main_checkbox").checked,
        type_of_restriction: document.querySelector("#useragent_type_of_restriction").value
      },
      referer: {
        main_checkbox: document.querySelector("#referer_main_checkbox").checked
      },
      language: {
        main_checkbox: document.querySelector("#language_main_checkbox").checked
      },
      hardware: {
        main_checkbox: document.querySelector("#hardware_main_checkbox").checked
      },
      cookie_enabled: {
        main_checkbox: document.querySelector("#cookie_enabled_main_checkbox").checked,
        type_of_restriction: document.querySelector("#cookie_enabled_type_of_restriction").value
      },
      DNT_enabled: {
        main_checkbox: document.querySelector("#DNT_enabled_main_checkbox").checked,
        type_of_restriction: document.querySelector("#DNT_enabled_type_of_restriction").value
      }
    }
  });
  // change button text
  savedText();
  e.preventDefault();
}

// get custom settings 
function restoreOptions() {
  browser.storage.sync.get('extension_settings_data', function(res) {
    document.querySelector("#window_date_main_checkbox").checked = res.extension_settings_data.window_date.main_checkbox;
    document.querySelector("#window_date_time_round_precision").value = res.extension_settings_data.window_date.time_round_precision;
    document.querySelector("#performance_now_main_checkbox").checked = res.extension_settings_data.window_performance_now.main_checkbox;
    document.querySelector("#performance_now_value_round_precision").value = res.extension_settings_data.window_performance_now.value_round_precision;
    document.querySelector("#htmlcanvaselement_main_checkbox").checked = res.extension_settings_data.window_html_canvas_element.main_checkbox;
    document.querySelector("#navigator_geolocation_main_checkbox").checked = res.extension_settings_data.navigator_geolocation.main_checkbox;
    document.querySelector("#navigator_geolocation_type_of_restriction").value = res.extension_settings_data.navigator_geolocation.type_of_restriction;
    if (document.querySelector("#navigator_geolocation_type_of_restriction").value == "b") {  // if GSP is to null everything -> change options opacity
      gpsOpacity();
    }
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_a").value = res.extension_settings_data.navigator_geolocation.gps_a;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_b").value = res.extension_settings_data.navigator_geolocation.gps_b;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_c").value = res.extension_settings_data.navigator_geolocation.gps_c;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_d").value = res.extension_settings_data.navigator_geolocation.gps_d;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_e").value = res.extension_settings_data.navigator_geolocation.gps_e;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_f").value = res.extension_settings_data.navigator_geolocation.gps_f;
    document.querySelector("#navigator_geolocation_rounding_precision_of_item_g").value = res.extension_settings_data.navigator_geolocation.gps_g;
    document.querySelector("#xmlhttprequest_main_checkbox").checked = res.extension_settings_data.window_xmlhttprequest.main_checkbox;
    document.querySelector("#xmlhttprequest_type_of_restriction").value = res.extension_settings_data.window_xmlhttprequest.type_of_restriction;
    document.querySelector("#useragent_main_checkbox").checked = res.extension_settings_data.user_agent.main_checkbox;
    document.querySelector("#useragent_type_of_restriction").value = res.extension_settings_data.user_agent.type_of_restriction;
    document.querySelector("#referer_main_checkbox").checked = res.extension_settings_data.referer.main_checkbox;
    document.querySelector("#language_main_checkbox").checked = res.extension_settings_data.language.main_checkbox;
    document.querySelector("#hardware_main_checkbox").checked = res.extension_settings_data.hardware.main_checkbox;
    document.querySelector("#cookie_enabled_main_checkbox").checked = res.extension_settings_data.cookie_enabled.main_checkbox;
    document.querySelector("#cookie_enabled_type_of_restriction").value = res.extension_settings_data.cookie_enabled.type_of_restriction;
    document.querySelector("#DNT_enabled_main_checkbox").checked = res.extension_settings_data.DNT_enabled.main_checkbox;
    document.querySelector("#DNT_enabled_type_of_restriction").value = res.extension_settings_data.DNT_enabled.type_of_restriction;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#custom-form").addEventListener("submit", saveOptions);

// show / hide custom level settings -- no need 
// document.getElementById('custom-form').style.display = "none"; ////////////////////////// NA KONCI ODKOMENTUJ nech je defaultne skryte
// document.getElementById('custom-show-hide').addEventListener('click', function (e) {
//   var x = document.getElementById("custom-form");
//   if (x.style.display === "none") {
//     x.style.display = "block";
//   } else {
//     x.style.display = "none";
//   }
// });

// change save settings button text to "Saved"
function savedText(){
  document.getElementById("save").innerHTML="Saved ";
  document.getElementById("save").style.paddingLeft = "59px";
  document.getElementById("save").style.paddingRight = "60px";
}

// change seve settings button text to "Save custom level" on change
document.getElementById("window_date_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("window_date_time_round_precision").addEventListener("change", savedTextBack);
document.getElementById("performance_now_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("performance_now_value_round_precision").addEventListener("change", savedTextBack);
document.getElementById("htmlcanvaselement_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_type_of_restriction").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_a").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_b").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_c").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_d").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_e").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_f").addEventListener("change", savedTextBack);
document.getElementById("navigator_geolocation_rounding_precision_of_item_g").addEventListener("change", savedTextBack);
document.getElementById("xmlhttprequest_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("xmlhttprequest_type_of_restriction").addEventListener("change", savedTextBack);
document.getElementById("useragent_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("useragent_type_of_restriction").addEventListener("change", savedTextBack);
document.getElementById("referer_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("language_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("hardware_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("cookie_enabled_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("cookie_enabled_type_of_restriction").addEventListener("change", savedTextBack);
document.getElementById("DNT_enabled_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("DNT_enabled_type_of_restriction").addEventListener("change", savedTextBack);

// change text back
function savedTextBack () {
  document.getElementById("save").innerHTML="Save custom level";
  document.getElementById("save").style.paddingLeft = "";
  document.getElementById("save").style.paddingRight = "";
}


//// JSR Domain List ////

// on submit add domain to list
document.querySelector("#domain-form").addEventListener("submit", addDomain);
// on load or update generate list
document.addEventListener('DOMContentLoaded', loadSettings);
browser.storage.onChanged.addListener(loadSettings);

// add domain to list, remove useless www first
function addDomain (e) {
      var removeWWW = document.querySelector("#domain-text").value;
      removeWWW = removeWWW.replace(/^www\./,'');
    browser.storage.sync.set({
      [removeWWW]: document.querySelector("#domain-level").value
    });
    document.querySelector("#domain-form").reset();
  e.preventDefault();
}

// go through storage JSON and generate table - list of domains
//item[domain] == level
function loadSettings() {
  browser.storage.sync.get(null, function(item) {
  // create table
  var fullTable = "<thead id=\"domain-list-head\"><th class=\"table-head\">Domain</th><th class=\"table-head\">Level</th></thead>";
  for (var domain in item) {
    if (item.hasOwnProperty(domain)) {
      if ((domain != "extension_settings_data") && (domain != "__default__")) {
        var lvl;
        if (item[domain] == LC) {
          lvl = "Custom";
        } else {
          lvl = item[domain];
        }
        var row = "<tr><td class=\"td-domain\">"+ domain +"</td><td class=\"td-level\">"+ lvl +"</td><td class=\"td-delete\" id=\""+ domain +"\"></td>";
        fullTable += row;
      }
      if (domain == "__default__") {
        document.querySelector("#levels-default #level-"+ item[domain]).classList.add("active");
      }
    }
  }
  document.getElementById("domain-list-table").innerHTML = fullTable;
  setEventOnClick();
  });
}

// set trash icon event for removing some domain from list
function setEventOnClick() {
  document.querySelectorAll('td').forEach(e => e.addEventListener("click", function() {
    removeDomain(e.id);
  }));
}

// if GPS is set to "Null location data..." fade out rest of the GPS options 
document.getElementById('navigator_geolocation_type_of_restriction').addEventListener('click', gpsOpacity);
function gpsOpacity () {
  var x = document.getElementsByClassName("gps");
  if(document.getElementById('navigator_geolocation_type_of_restriction').selectedIndex == 1){
    for (var i = 0; i < x.length; i++) {
      x[i].style.opacity = fadeOut;
    }
  } else {
    for (var i = 0; i < x.length; i++) {
      x[i].style.opacity = fadeIn;
    }
  }
}


// show hide domain list
document.getElementById('domain-show-hide').addEventListener('click', function (e) {
  var x = document.getElementById("domain-list-table");
  var y = document.getElementById("delete-list");
  if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "table";
  } else {
    x.style.display = "none";
    y.style.display = "none";
  }
});
      
// set event for "Delete all"
document.querySelector("#delete-list").addEventListener('click', function (e) {
    document.getElementById('domain-show-hide').click();
    removeList();
});
// remove domain from list
function removeDomain(domain) {
  browser.storage.sync.remove(domain, function(){});
}

  // go through storage JSON and remove all list of domains
function removeList() {
  browser.storage.sync.get(null, function(item) {
    for (var domain in item) {
      if (item.hasOwnProperty(domain)) {
        if ((domain != "extension_settings_data") && (domain != "__default__")) {
            var removeIt = browser.storage.sync.remove(domain);
        }
      }
    }
  });
}

// -- debug only -- clear all storage -- debug only --
function clearStorage() {
  browser.storage.sync.clear(function(){
  });
}

// -- debug only -- print storage -- debug only --
function printStorageConsole() {
  browser.storage.sync.get(null, function(item) {
    console.log(item);
  });
}
var timoerr = true; // historical meaning for author, do NOT remove


//// JSR Default level ////

const L0 = 0;
const L1 = 1;
const L2 = 2;
const L3 = 3;
const LC = 4; // custom
const LD = 5; // default

const fadeOut = "0.3";
const fadeIn = "1.0";

// set event for changing default level
document.querySelector("#levels-default #level-0").addEventListener("click", function() {setDefaultLevelTo(L0);});
document.querySelector("#levels-default #level-1").addEventListener("click", function() {setDefaultLevelTo(L1);});
document.querySelector("#levels-default #level-2").addEventListener("click", function() {setDefaultLevelTo(L2);});
document.querySelector("#levels-default #level-3").addEventListener("click", function() {setDefaultLevelTo(L3);});
document.querySelector("#levels-default #level-4").addEventListener("click", function() {setDefaultLevelTo(LC);});

// set default level to the selected level
function setDefaultLevelTo(level) {
  browser.storage.sync.set({
      __default__: level
  });
  clearAllLevels();
  // add active class to new default level
  document.querySelector("#levels-default #level-"+ level).classList.add("active");
}

// remove active class for all levels
function clearAllLevels() {
  for (var i = 0; i <= 4; i++) {
      var elm = document.querySelector("#levels-default #level-"+ i);
      elm.classList.remove("active");
  }
}

