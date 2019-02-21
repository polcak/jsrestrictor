// JSR Custom settings JSR //

function saveOptions(e) {
  var sent = browser.storage.sync.set({
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
        main_checkbox: document.querySelector("#htmlcanvaselement_main_checkbox").checked,
        type_of_restriction: document.querySelector("#htmlcanvaselement_type_of_restriction").value
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
      }
    }
  });

  // saved. change Save button text
  if (sent) {
      savedText();
  }
  
  e.preventDefault();
}

function restoreOptions() {

  var allExtensionsData = browser.storage.sync.get('extension_settings_data');
  allExtensionsData.then((res) => {
    document.querySelector("#window_date_main_checkbox").checked = res.extension_settings_data.window_date.main_checkbox;
    document.querySelector("#window_date_time_round_precision").value = res.extension_settings_data.window_date.time_round_precision;
    document.querySelector("#performance_now_main_checkbox").checked = res.extension_settings_data.window_performance_now.main_checkbox;
    document.querySelector("#performance_now_value_round_precision").value = res.extension_settings_data.window_performance_now.value_round_precision;
    document.querySelector("#htmlcanvaselement_main_checkbox").checked = res.extension_settings_data.window_html_canvas_element.main_checkbox;
    document.querySelector("#htmlcanvaselement_type_of_restriction").value = res.extension_settings_data.window_html_canvas_element.type_of_restriction;
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
  });
}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("#custom-form").addEventListener("submit", saveOptions);

// show / hide custom level settings
// document.getElementById('custom-form').style.display = "none"; ////////////////////////// NA KONCI ODKOMENTUJ nech je defaultne skryte
document.getElementById('custom-show-hide').addEventListener('click', function (e) {
  var x = document.getElementById("custom-form");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
});

// change save settings button text to "Saved"
// browser.storage.onChanged.addListener(savedText);
function savedText(){
  document.getElementById("save").innerHTML="Saved";
  document.getElementById("save").style.paddingLeft = "43px";
  document.getElementById("save").style.paddingRight = "42px";
}

// change seve settings button text to "Save settings"
document.getElementById("window_date_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("window_date_time_round_precision").addEventListener("change", savedTextBack);
document.getElementById("performance_now_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("performance_now_value_round_precision").addEventListener("change", savedTextBack);
document.getElementById("htmlcanvaselement_main_checkbox").addEventListener("change", savedTextBack);
document.getElementById("htmlcanvaselement_type_of_restriction").addEventListener("change", savedTextBack);
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

function savedTextBack () {
  document.getElementById("save").innerHTML="Save settings";
  document.getElementById("save").style.paddingLeft = "";
  document.getElementById("save").style.paddingRight = "";
}

/////////////////////////
// JSR Domain List JSR //

document.querySelector("#domain-form").addEventListener("submit", addDomain);
document.addEventListener('DOMContentLoaded', loadSettings);
browser.storage.onChanged.addListener(loadSettings);



function addDomain (e) {
      var removeWWW = document.querySelector("#domain-text").value;
      removeWWW = removeWWW.replace(/^www\./,'');
    var sent = browser.storage.sync.set({
      [removeWWW]: document.querySelector("#domain-level").value
    });

    if (sent) {
      document.querySelector("#domain-form").reset();
    }
  e.preventDefault();
}

function loadSettings() {
  var allDomains = browser.storage.sync.get();
  allDomains.then(printSettings, onError);
  printStorageConsole();
}
// go through storage JSON and generate table - list of domains
function printSettings (item) {  //item[domain] == level
  var fullTable = "<thead id=\"domain-list-head\"><th class=\"table-head\">Domain</th><th class=\"table-head\">Level</th></thead>";
  for (var domain in item) {
    if (item.hasOwnProperty(domain)) {
      if ((domain != "extension_settings_data") && (domain != "__default__")) {
        var lvl;
        if (item[domain] == 4) {
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
}

function setEventOnClick() {
  document.querySelectorAll('td').forEach(e => e.addEventListener("click", function() {
    removeDomain(e.id);
  }));
}

document.getElementById('navigator_geolocation_type_of_restriction').addEventListener('click', gpsOpacity);
function gpsOpacity () {
  var x = document.getElementsByClassName("gps");
  if(document.getElementById('navigator_geolocation_type_of_restriction').selectedIndex == 1){
    for (var i = 0; i < x.length; i++) {
      x[i].style.opacity = "0.3";
    }
  } else {
    for (var i = 0; i < x.length; i++) {
      x[i].style.opacity = "1.0";
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
      
      // <td onclick=\"kek('"+ domain +"')\" class=\"td-delete\">X</td>
      // <tr>
      //   <td class="td-domain">www.keke.sk</td>
      //   <td class="td-level">2</td>
      //   <td class="td-delete" id="www.keke.sk">X</td>
      // </tr>

document.querySelector("#delete-list").addEventListener('click', function (e) {
    document.getElementById('domain-show-hide').click();
    removeList();
    // clearStorage();
});
// remove domain from list
function onRemoved() {
  console.log("Removed");
}
function removeDomain(domain) {
  let removeIt = browser.storage.sync.remove(domain);
  removeIt.then(onRemoved, onError);
}

function removeList() {
  var allDomains = browser.storage.sync.get();
  allDomains.then(removeDomains, onError);
}
// go through storage JSON and remove list of domains
function removeDomains (item) {  //item[domain] == level
  for (var domain in item) {
    if (item.hasOwnProperty(domain)) {
      if ((domain != "extension_settings_data") && (domain != "__default__")) {
          var removeIt = browser.storage.sync.remove(domain);
          removeIt.then(onRemoved, onError);
      }
    }
  }
}



// clear all domains
function onCleared() {
  console.log("DeletedAll");
}
function clearStorage() {
  var clrStorage = browser.storage.sync.clear();
  clrStorage.then(onCleared, onError);
}

// error log
function onError(timoerr) {
  console.log(timoerr);
}

// print storage
function printStorageConsole() {
  let gettingItem = browser.storage.sync.get();
  gettingItem.then(onGot, onError);
}
function onGot(item) {
  console.log(item);

}

/////////////////////////
// JSR Default level JSR //

const L0 = 0;
const L1 = 1;
const L2 = 2;
const L3 = 3;
const LC = 4; // custom
const LD = 5; // default

document.querySelector("#levels-default #level-0").addEventListener("click", function() {setDefaultLevelTo(L0);});
document.querySelector("#levels-default #level-1").addEventListener("click", function() {setDefaultLevelTo(L1);});
document.querySelector("#levels-default #level-2").addEventListener("click", function() {setDefaultLevelTo(L2);});
document.querySelector("#levels-default #level-3").addEventListener("click", function() {setDefaultLevelTo(L3);});
document.querySelector("#levels-default #level-4").addEventListener("click", function() {setDefaultLevelTo(LC);});

function setDefaultLevelTo(level) {
  var sent = browser.storage.sync.set({
      __default__: level
  });

  if (sent) {
    clearAllLevels();
      document.querySelector("#levels-default #level-"+ level).classList.add("active");
  }
}

function clearAllLevels() {
  for (var i = 0; i <= 4; i++) {
      var elm = document.querySelector("#levels-default #level-"+ i);
      elm.classList.remove("active");
  }
}


/////////////////////////
// JSR Common functs JSR //


