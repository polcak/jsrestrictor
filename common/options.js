//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2020  Peter Hornak
//	Copyright (C) 2020  Pavel Pohner
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


//Chrome compatibility
if ((typeof browser) === "undefined") {
	var browser = chrome;
}

function prepare_level_config(action_descr, params = {
			level_name: "",
			short_id: "",
			description: "",
			time_precision_checked: false,
			time_precision_round: 1,
			time_round_checked: false,
			time_random_checked: false,
			htmlcanvas_checked: false,
			hardware_checked: false,
			xhr_checked: false,
			xhr_block_checked: false,
			xhr_ask_checked: false,
			arrays_checked: false,
			mapping_checked: false,
			shared_array_checked: false,
			shared_slow_checked: false,
			webworker_checked: false,
			webworker_slow_checked: false,
			battery_checked: true,
		}) {
	var configuration_area_el = document.getElementById("configuration_area");
	configuration_area_el.textContent = "";
	var fragment = document.createRange().createContextualFragment(`
<div>
		<p>Note that for fingerprintability prevention, JS Restrictor does not wrap objects that are not defined. For example, if an experimental feature like <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory"><code>navigator.deviceMemory</code></a> is not defined in your browser, JS Restrictor does not define the property even if it is shown below that the valut is defined.</p>
	<div>
	  <h2>${action_descr}</h2>
	</div>
	<form>

		<!-- Metadata -->
		<div class="main-section">
			<span class="section-header">Name:</span>
			<input id="level_text" value="${escape(params.level_name)}"></input>
		</div>
		<div class="main-section">
			<span class="section-header">Short ID:</span>
			<input id="level_id" ${params.short_id != "" ? "disabled" : ""} value="${escape(params.short_id)}"></input>
		</div>
		<div>
			<span class="table-left-column">This ID is displayed above the JSR icon. If you use an
					already existing ID, this custom level will replace the original level.</span>
		</div>
		<div class="main-section">
			<span class="section-header">Description:</span>
			<input id="level_description" value="${escape(params.description)}"></input>
		</div>
		
		<!-- DATE and performance -->
		<div class="main-section">
			<input type="checkbox" id="time_precision_main_checkbox" ${params.time_precision_checked ? "checked" : ""}>
			<span class="section-header">Manipulate the time precision provided by Date and
				performance:</span>
		</div>
		<div id="time_precision_options" class="${params.time_precision_checked ? "" : "hidden"}">
			<div class="row">
				<span class="table-left-column">Manipulate time to:</span>
				<select id="time_precision_round_precision">
					<option value="2" ${params.time_precision_round === 2 ? "selected" : ""}>hundredths of a second (1.230)</option>
					<option value="1" ${params.time_precision_round === 1 ? "selected" : ""}>tenths of a second (1.200)</option>
					<option value="0" ${params.time_precision_round === 0 ? "selected" : ""}>full seconds (1.000)</option>
				</select>
			</div>
			<div class="row">
				<input type="radio" id="timeoptions_round_checkbox" name="timeoptions" ${params.time_random_checked ? "" : "checked"}/>
				<span class="section-header">Round time.</span>
				<input type="radio" id="timeoptions_random_checkbox" name="timeoptions" ${params.time_random_checked ? "checked" : ""}/>
				<span class="section-header">Randomize time.</span>
			</div>
		</div>
		
		<!-- CANVAS -->
		<div class="main-section">
			<input type="checkbox" id="htmlcanvaselement_main_checkbox" ${params.htmlcanvas_checked ? "checked" : ""}>
			<span class="section-header">Protect against canvas fingerprinting:</span>
		</div>
		<div>
			<span class="table-left-column">Canvas return white image data by modifiing
					canvas.toDataURL(), canvas.toBlob() and CanvasRenderingContext2D.getImageData functions</span>
		</div>
		
		<!-- HARDWARE -->
		<div class="main-section">
			<input type="checkbox" id="hardware_main_checkbox" ${params.hardware_checked ? "checked" : ""}>
			<span class="section-header">Spoof hardware information to the most popular HW:</span>
		</div>
		<div>
			<span class="table-left-column">JS navigator.deviceMemory: 4</span>
			<br>
			<span class="table-left-column">JS navigator.hardwareConcurrency: 2</span>
		</div>
		
		<!-- XMLHTTPREQUEST -->
		<div class="main-section">
			<input type="checkbox" id="xhr_main_checkbox" ${params.xhr_checked ? "checked" : ""}>
			<span class="section-header"><i>Filter XMLHttpRequest requests:</i></span>
		</div>
		<div id="xhr_options" class="${params.xhr_checked ? "" : "hidden"}">
			<div class="row">
				<input type="radio" id="xmlhttprequest_block_checkbox" name="xhroptions"  ${params.xhr_block_checked ? "checked" : ""}></input>
				<span class="section-header">Block all XMLHttpRequest.</span>
				<input type="radio" id="xmlhttprequest_ask_checkbox" name="xhroptions"  ${params.xhr_ask_checked ? "checked" : ""}></input>
				<span class="section-header">Ask before executing an XHR request.</span>
			</div>
		</div>

		<!-- ARRAYS -->
		<div class="main-section">
			<input type="checkbox" id="arrays_main_checkbox" ${params.arrays_checked ? "checked" : ""}>
			<span class="section-header">Protect against ArrayBuffer exploitation.</span>
		</div>
		<div class="${params.arrays_checked ? "" : "hidden"}" id="arrays_options" >
			<input type="checkbox" id="mapping_checkbox" ${params.mapping_checked ? "checked" : ""}>
			<span class="section-header">Use random mapping of array indexing to memory.</span>
		</div>

		<!-- SHAREDARRAY -->
		<div class="main-section">
			<input type="checkbox" id="shared_array_main_checkbox" ${params.shared_array_checked ? "checked" : ""}>
			<span class="section-header">Protect against SharedArray exploitation:</span>
		</div>
		<div id="shared_array_options" class="${params.shared_array_checked ? "" : "hidden"}">
			<div class="row">
				<input type="radio" id="shared_array_block_checkbox" name="sharedoptions"  ${params.shared_slow_checked ? "" : "checked"}/>
				<span class="section-header">Block SharedArray.</span>
				<input type="radio" id="shared_array_polyfill_checkbox" name="sharedoptions"  ${params.shared_slow_checked ? "checked" : ""}/>
				<span class="section-header">Randomly slow messages to prevent high resolution timers.</span>
			</div>
		</div>

		<!-- WEBWORKER -->
		<div class="main-section">
			<input type="checkbox" id="webworker_main_checkbox" ${params.webworker_checked ? "checked" : ""}>
			<span class="section-header">Protect against WebWorker exploitation:</span>
		</div>
		<div id="webworker_options" class="${params.webworker_checked ? "" : "hidden"}">
			<div class="row">
				<input type="radio" id="webworker_polyfill_checkbox" name="workeroptions"  ${params.webworker_slow_checked ? "" : "checked"}/>
				<span class="section-header">Remove real parallelism.</span>
				<input type="radio" id="webworker_slow_checkbox" name="workeroptions"  ${params.webworker_slow_checked ? "checked" : ""}/>
				<span class="section-header">Randomly slow messages to prevent high resolution timers.</span>
			</div>
		</div>

		<!-- BATTERY -->
		<div class="main-section">
			<input type="checkbox" id="battery_main_checkbox" ${params.battery_checked ? "checked" : ""}>
			<span class="section-header">Disable Battery status API</span>
		</div>
		<button id="save" class="jsr-button">Save custom level</button>
	</form>
</div>`);
	configuration_area_el.appendChild(fragment);
	function connect_options_group(group_name) {
		document.getElementById(group_name + "_main_checkbox").addEventListener("click", function(e) {
			var options_el = document.getElementById(group_name + "_options");
			if (this.checked) {
				options_el.classList.remove("hidden");
			}
			else {
				options_el.classList.add("hidden");
			}
		});
	}
	connect_options_group("time_precision");
	connect_options_group("xhr");
	connect_options_group("arrays");
	connect_options_group("shared_array");
	connect_options_group("webworker");

	document.getElementById("save").addEventListener("click", function(e) {
		e.preventDefault();
		new_level = {
			level_id: document.getElementById("level_id").value,
			level_text: document.getElementById("level_text").value,
			level_description: document.getElementById("level_description").value,
			wrappers: []
		};

		if (document.getElementById("htmlcanvaselement_main_checkbox").checked) {
			new_level.wrappers.push(
				// H-C
				["CanvasRenderingContext2D.prototype.getImageData"],
				["HTMLCanvasElement.prototype.toBlob"],
				["HTMLCanvasElement.prototype.toDataURL"],
			);
		}
		if (document.getElementById("time_precision_main_checkbox").checked) {
			var precision = document.getElementById("time_precision_round_precision").value;
			var randomize = document.getElementById("timeoptions_random_checkbox").checked;

			new_level.wrappers.push(
				// HRT
				["Performance.prototype.now", precision, randomize],
				["window.PerformanceEntry", precision, randomize],
				// PT2
				["performance.getEntries", precision, randomize],
				["performance.getEntriesByName", precision, randomize],
				["performance.getEntriesByType", precision, randomize],
				// ECMA
				["window.Date", precision, randomize],
			);
		}
		if (document.getElementById("xhr_main_checkbox").checked) {
			new_level.wrappers.push(
				// AJAX
				["window.XMLHttpRequest", document.getElementById("xmlhttprequest_block_checkbox").checked, document.getElementById("xmlhttprequest_ask_checkbox").checked],
			);
		}
		if (document.getElementById("hardware_main_checkbox").checked) {
			new_level.wrappers.push(
				// DM
				["navigator.deviceMemory"],
				// HTML-LS
				["navigator.hardwareConcurrency"],
			);
		}

		if (document.getElementById("arrays_main_checkbox").checked) {
			let doMapping = document.getElementById("mapping_checkbox").checked;
			let arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
			for (let a of arrays) {
				new_level.wrappers.push([`window.${a}`, doMapping]);
			}
			new_level.wrappers.push(
				["window.DataView", doMapping],
			);
		}
		if (document.getElementById("shared_array_main_checkbox").checked) {
			let block = document.getElementById("shared_array_block_checkbox").checked;
			new_level.wrappers.push(
				// SHARED
				["window.SharedArrayBuffer", block],
			);
		}
		if (document.getElementById("webworker_main_checkbox").checked) {
			let polyfill = document.getElementById("webworker_polyfill_checkbox").checked;
			new_level.wrappers.push(
				// WORKER
				["window.Worker", polyfill],
			);
		}
		if (document.getElementById("battery_main_checkbox").checked) {
			new_level.wrappers.push(
				// BATTERY
				["navigator.getBattery"],
			);
		}

		if (new_level.level_id.length > 0 && new_level.level_text.length > 0 && new_level.level_description.length) {
			if (new_level.level_id.length > 3) {
				alert("Level ID too long, provide 3 characters or less");
				return;
			}
			async function updateLevels(new_level, stored_levels) {
				let ok = false;
				if (new_level.level_id in stored_levels) {
					ok = window.confirm("Custom level " + new_level.level_id + " already exists. It will be overriden.");
				}
				else {
					ok = true;
				}
				if (ok) {
					stored_levels[new_level.level_id] = new_level;
					try {
						await browser.storage.sync.set({custom_levels: stored_levels});
						location = "";
					}
					catch (err) {
						alert("Custom level were not updated, please try again later.");
					}
				}
			}
			browser.storage.sync.get(custom_levels, updateLevels.bind(null, new_level));
		}
		else {
			alert("Please provide all required fields: ID, Name, and Decription");
		}
	});
}

function edit_level(id) {
	var lev = {};
	for (wrapper of levels[id].wrappers) {
		lev[wrapper[0]] = wrapper.slice(1);
	}
	prepare_level_config("Edit level " + escape(id), {
			level_name: levels[id].level_text,
			short_id: levels[id].level_id,
			description: levels[id].level_description,
			time_precision_checked: "Performance.prototype.now" in lev &&
					"performance.getEntries" in lev &&
					"performance.getEntriesByName" in lev &&
					"performance.getEntriesByType" in lev &&
					"window.Date" in lev,
			time_precision_round: "Performance.prototype.now" in lev ? lev["Performance.prototype.now"][0] : 100,
			time_random_checked: "window.Date" in lev ? lev["window.Date"][1] : false,
			htmlcanvas_checked: "CanvasRenderingContext2D.prototype.getImageData" in lev &&
					"HTMLCanvasElement.prototype.toBlob" in lev &&
					"HTMLCanvasElement.prototype.toDataURL" in lev,
			hardware_checked: "navigator.deviceMemory" in lev &&
					"navigator.hardwareConcurrency" in lev,
			xhr_checked: "window.XMLHttpRequest" in lev,
			xhr_block_checked: "window.XMLHttpRequest" in lev ? lev["window.XMLHttpRequest"][0] : false,
			xhr_ask_checked: "window.XMLHttpRequest" in lev ? lev["window.XMLHttpRequest"][1] : false,
			arrays_checked: "window.Uint8Array" in lev,
			mapping_checked: "window.Uint8Array" in lev ? lev["window.Uint8Array"][0] : false,
			shared_array_checked: "window.SharedArrayBuffer" in lev,
			shared_slow_checked: "window.SharedArrayBuffer" in lev ? !(lev["window.SharedArrayBuffer"][0]) : false,
			webworker_checked: "window.Worker" in lev,
			webworker_slow_checked: "window.Worker" in lev ? !(lev["window.Worker"][0]) : false,
			battery_checked: "navigator.getBattery" in lev,
	});
}

function restore_level(id, settings) {
	levels[id] = settings;
	browser.storage.sync.set({"custom_levels": levels});
	var existPref = document.getElementById(`li-exist-group-${escape(id)}`);
	existPref.classList.remove("hidden");
	var removedPref = document.getElementById(`li-removed-group-${escape(id)}`);
	removedPref.classList.add("hidden");
	var lielem = document.getElementById(`li-${id}`);
	lielem.classList.remove("undo");
}

function show_existing_level(levelsEl, level) {
	let currentId = `level-${level}`;
	var fragment = document.createRange().createContextualFragment(`<li id="li-${escape(level)}">
		<span class="level" id="${escape(currentId)}" title="${escape(levels[level].level_description)}">
			${escape(level)}: ${escape(levels[level].level_text)}
		</span>
		<span>${escape(levels[level].level_description)}</span>
		</li>`);
	levelsEl.appendChild(fragment);
	if (!([L0, L1, L2, L3].includes(level))) {
		var lielem = document.getElementById(`li-${level}`); // Note that FF here requires unescaped ID
		var existPref = document.createElement("span");
		existPref.setAttribute("id", `li-exist-group-${escape(level)}`);
		lielem.appendChild(existPref);
		var edit = document.createElement("button");
		existPref.appendChild(edit);
		edit.addEventListener("click", edit_level.bind(edit, level));
		edit.appendChild(document.createTextNode("Edit"));
		var remove = document.createElement("button");
		existPref.appendChild(remove);
		remove.addEventListener("click", remove_level.bind(remove, level));
		remove.appendChild(document.createTextNode("Remove"));
		var removedPref = document.createElement("span");
		removedPref.setAttribute("id", `li-removed-group-${escape(level)}`);
		removedPref.classList.add("hidden");
		lielem.appendChild(removedPref);
		var restore = document.createElement("button");
		removedPref.appendChild(restore);
		restore.addEventListener("click", restore_level.bind(restore, level, levels[level]));
		restore.appendChild(document.createTextNode("Restore"));
	}
	var current = document.getElementById(currentId)
	current.addEventListener("click", function() {
		for (let child of levelsEl.children) {
			child.children[0].classList.remove("active");
		}
		this.classList.add("active");
		setDefaultLevel(level);
	});
}

function remove_level(id) {
	// See https://alistapart.com/article/neveruseawarning/
	var existPref = document.getElementById(`li-exist-group-${escape(id)}`);
	existPref.classList.add("hidden");
	var removedPref = document.getElementById(`li-removed-group-${escape(id)}`);
	removedPref.classList.remove("hidden");
	var lielem = document.getElementById(`li-${id}`);
	lielem.classList.add("undo");
	delete levels[id];
	browser.storage.sync.set({"custom_levels": levels});
}

function insert_levels() {
	// Insert all known levels to GUI
	var allLevelsElement = document.getElementById("levels-list");
	for (let level in levels) {
		show_existing_level(allLevelsElement, level);
	}
	// Select default level
	document.getElementById("level-" + default_level.level_id).classList.add("active");
}

window.addEventListener("load", function() {
	if (!levels_initialised) {
		levels_updated_callbacks.push(insert_levels);
	}
	else {
		insert_levels();
	}
	loadWhitelist();
	load_on_off_switch();
});

document.getElementById("new_level").addEventListener("click",
	() => prepare_level_config("Add new level"));

document.getElementById("whitelist-add-button").addEventListener("click", () => add_to_whitelist());
document.getElementById("whitelist-remove-button").addEventListener("click", () => remove_from_whitelist());
document.getElementsByClassName("slider")[0].addEventListener("click", () => {setTimeout(control_http_request_shield, 200)});

function add_to_whitelist()
{	
	//obtain input value
	var to_whitelist = document.getElementById("whitelist-input").value;
	if (to_whitelist.trim() !== '')
	{
		var listbox = document.getElementById("whitelist-select");
		//Check if it's not in whitelist already
		for (var i = 0; i < listbox.length; i++)
		{
			if (to_whitelist == listbox.options[i].text)
			{
				alert("Hostname is already in the whitelist.");
				return;
			}
		}
		//Insert it
		listbox.options[listbox.options.length] = new Option(to_whitelist, to_whitelist);
		//Update background
		update_whitelist(listbox);

	}
	else
	{
		alert("Please fill in the hostname first.");
	}

}

function remove_from_whitelist()
{	
	var listbox = document.getElementById("whitelist-select");
	var selectedIndexes = getSelectValues(listbox);

	var j = 0;
	for (var i = 0; i < selectedIndexes.length; i++)
	{
		listbox.remove(selectedIndexes[i]-j);
		j++;
	}
	update_whitelist(listbox);
}

function update_whitelist(listbox)
{
	//Create new associative array
	var whitelistedHosts = new Object();
	//Obtain all whitelisted hosts from listbox
	for (var i = 0; i < listbox.length; i++)
		{
			whitelistedHosts[listbox.options[i].text] = true;
		}
		//Overwrite the whitelist in storage
		browser.storage.sync.set({"whitelistedHosts":whitelistedHosts});
		//Send message to background to update whitelist from storage
		sendMessage({message:"whitelist updated"});
}

function sendMessage(message)
{
	browser.runtime.sendMessage(message);
}

//Auxilary function for obtaining selected values from listbox
function getSelectValues(select) 
{
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(i);
    }
  }
  return result;
}
//Function called on window load, obtains whitelist from storage
//Displays it in listbox
function loadWhitelist()
{	
	var listbox = document.getElementById("whitelist-select");
	//Get the whitelist
	browser.storage.sync.get(["whitelistedHosts"], function(result)
	{
		if (result.whitelistedHosts != undefined)
      	{
      		//Create list box options for each item
	        var it = 0;
	        Object.keys(result.whitelistedHosts).forEach(function(key, index) {
	        	listbox.options[it++] = new Option(key, key);
			}, result.whitelistedHosts);
  		}
	});
}
//Function called on window load, obtains whether is the protection on or off
function load_on_off_switch()
{
	var checkbox = document.getElementById("switch-checkbox");
	//Obtain the information from storage
	browser.storage.sync.get(["requestShieldOn"], function(result)
	{
		//Check the box
		if (result.requestShieldOn || result.requestShieldOn == undefined)
		{
			checkbox.checked = true;
		}
		else
		{
			checkbox.checked = false;
		}
	});
}

//OnClick event handler for On/Off slider
function control_http_request_shield()
{
	var checkbox = document.getElementById("switch-checkbox");
	//Send appropriate message and store state into storage
	if (checkbox.checked)	//Turn ON
	{
		sendMessage({message:"turn request shield on"});
		browser.storage.sync.set({"requestShieldOn": true});
	}
	else
	{
		sendMessage({message:"turn request shield off"});
		browser.storage.sync.set({"requestShieldOn": false});
	}

}
