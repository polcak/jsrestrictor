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

function prepare_level_config(action_descr, params = wrapping_groups.create_default()) {
	var configuration_area_el = document.getElementById("configuration_area");
	configuration_area_el.textContent = "";
	function create_wrapping_groups_html() {
		function process_group(html, group) {
			function process_select_option(param_property, html, option) {
				return html + `
						<option value="${option.value}" ${params[param_property] === option.value.toString() ? "selected" : ""}>${option.description}</option>
					`
			}
			function process_select(group_option) {
				return `
					<span class="table-left-column">${group_option.description}:</span>
					<select id="${group_option.id}">
							${group_option.options.reduce(process_select_option.bind(null, group_option.id), "")}
					</select>
				`;
			}
			function process_checkbox(group_option) {
				return `
					<input type="checkbox" id="${group_option.id}" ${params[group_option.id] ? "checked" : ""}>
					<span class="section-header">${group_option.description}</span>
				`;
			}
			function process_radio_option(param_property, html, option) {
				return html + `
						<input type="radio" id="${option.id}" name="${param_property}"  ${params[option.id] ? "checked" : ""}></input>
						<span class="section-header">${option.description}</span>
					`
			}
			function process_radio(group_option) {
				return `
					${group_option.options.reduce(process_radio_option.bind(null, group_option.id), "")}
				`;
			}
			function process_option(html, option) {
				processors = {
					select: process_select,
					"input-checkbox": process_checkbox,
					"input-radio": process_radio,
				};
				return html + `
					<div class="row">
						${processors[option.ui_elem](option)}
					</div>
					`;
			}
			function process_descriptions(html, descr) {
				return html + `
					<span class="table-left-column">${descr}</span><br>
				`;
			}
			return html + `
				<div class="main-section">
					<input type="checkbox" id="${group.id}" ${params[group.id] ? "checked" : ""}>
					<span class="section-header">${group.description}:</span>
				</div>
					<div id="${group.name}_options" class="${params[group.id] ? "" : "hidden"}">
						${group.description2.reduce(process_descriptions, "")}
						${group.options.reduce(process_option, "")}
					</div>
			`;
		}
		return wrapping_groups.groups.reduce(process_group, "");
	}
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

		${create_wrapping_groups_html()}
		
		<button id="save" class="jsr-button">Save custom level</button>
	</form>
</div>`);

	configuration_area_el.appendChild(fragment);
	function connect_options_group(group) {
		document.getElementById(group.id).addEventListener("click", function(e) {
			var options_el = document.getElementById(group.name + "_options");
			if (this.checked) {
				options_el.classList.remove("hidden");
			}
			else {
				options_el.classList.add("hidden");
			}
		});
	}
	wrapping_groups.groups.forEach(g => connect_options_group(g));

	document.getElementById("save").addEventListener("click", function(e) {
		e.preventDefault();
		new_level = {
			level_id: document.getElementById("level_id").value,
			level_text: document.getElementById("level_text").value,
			level_description: document.getElementById("level_description").value,
			wrappers: []
		};

		if (document.getElementById("htmlcanvaselement").checked) {
			new_level.wrappers.push(
				// H-C
				["CanvasRenderingContext2D.prototype.getImageData"],
				["HTMLCanvasElement.prototype.toBlob"],
				["HTMLCanvasElement.prototype.toDataURL"],
			);
		}
		if (document.getElementById("time_precision").checked) {
			var precision = document.getElementById("time_precision_precision").value;
			var randomize = document.getElementById("time_precision_randomize").checked;

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
		if (document.getElementById("xhr").checked) {
			new_level.wrappers.push(
				// AJAX
				["window.XMLHttpRequest", document.getElementById("xhr_behaviour_block").checked, document.getElementById("xhr_behaviour_ask").checked],
			);
		}
		if (document.getElementById("hardware").checked) {
			new_level.wrappers.push(
				// DM
				["navigator.deviceMemory"],
				// HTML-LS
				["navigator.hardwareConcurrency"],
			);
		}

		if (document.getElementById("arrays").checked) {
			let doMapping = document.getElementById("arrays_mapping").checked;
			let arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
			for (let a of arrays) {
				new_level.wrappers.push([`window.${a}`, doMapping]);
			}
			new_level.wrappers.push(
				["window.DataView", doMapping],
			);
		}
		if (document.getElementById("shared_array").checked) {
			let block = document.getElementById("shared_array_approach_block").checked;
			new_level.wrappers.push(
				// SHARED
				["window.SharedArrayBuffer", block],
			);
		}
		if (document.getElementById("webworker").checked) {
			let polyfill = document.getElementById("webworker_approach_polyfill").checked;
			new_level.wrappers.push(
				// WORKER
				["window.Worker", polyfill],
			);
		}
		if (document.getElementById("battery").checked) {
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
			time_precision: "Performance.prototype.now" in lev &&
					"performance.getEntries" in lev &&
					"performance.getEntriesByName" in lev &&
					"performance.getEntriesByType" in lev &&
					"window.Date" in lev,
			time_precision_precision: "Performance.prototype.now" in lev ? lev["Performance.prototype.now"][0] : 100,
			time_precision_randomize: "window.Date" in lev ? lev["window.Date"][1] : false,
			htmlcanvaselement: "CanvasRenderingContext2D.prototype.getImageData" in lev &&
					"HTMLCanvasElement.prototype.toBlob" in lev &&
					"HTMLCanvasElement.prototype.toDataURL" in lev,
			hardware: "navigator.deviceMemory" in lev &&
					"navigator.hardwareConcurrency" in lev,
			xhr: "window.XMLHttpRequest" in lev,
			xhr_behaviour_block: "window.XMLHttpRequest" in lev ? lev["window.XMLHttpRequest"][0] : true,
			xhr_behaviour_ask: "window.XMLHttpRequest" in lev ? lev["window.XMLHttpRequest"][1] : false,
			arrays: "window.Uint8Array" in lev,
			arrays_mapping: "window.Uint8Array" in lev ? lev["window.Uint8Array"][0] : false,
			shared_array: "window.SharedArrayBuffer" in lev,
			shared_array_approach_block: "window.SharedArrayBuffer" in lev ? (lev["window.SharedArrayBuffer"][0]) : true,
			shared_array_approach_polyfill: "window.SharedArrayBuffer" in lev ? !(lev["window.SharedArrayBuffer"][0]) : false,
			webworker: "window.Worker" in lev,
			webworker_approach_polyfill: "window.Worker" in lev ? (lev["window.Worker"][0]) : true,
			webworker_approach_slow: "window.Worker" in lev ? !(lev["window.Worker"][0]) : false,
			battery: "navigator.getBattery" in lev,
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
