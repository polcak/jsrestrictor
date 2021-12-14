/** \file
 * \brief Code that handles the configuration of the extension
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2020  Peter Hornak
 *  \author Copyright (C) 2020  Pavel Pohner
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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


/// A map where to look for the values in HTML elements
const html_element_value_source = {
	"select": "value",
	"input-checkbox": "checked",
	"input-radio": "checked",
};

function prepare_level_config(action_descr, params = wrapping_groups.empty_level) {
	var configuration_area_el = document.getElementById("configuration_area");
	configuration_area_el.textContent = "";
	function create_wrapping_groups_html() {
		function process_group(html, group) {
			function process_select_option(param_property, html, option) {
				return html + `
						<option value="${option.value}" ${params[param_property] === option.value ? "selected" : ""}>${option.description}</option>
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
			let = supportedapis = are_all_api_unsupported(group.wrappers) ? "notsupportedapis" : "";
			return html + `
				<div class="main-section ${supportedapis}">
					<input type="checkbox" id="${group.id}"  ${params[group.id] ? "checked" : ""}>
					<span class="section-header">${group.description}:</span>
				</div>
					<div id="${group.name}_options" class="${supportedapis} ${params[group.id] ? "" : "hidden"}">
						${group.description2.reduce(process_descriptions, "")}
						${group.options.reduce(process_option, "")}
					</div>
			`;
		}
		return wrapping_groups.groups.reduce(process_group, "");
	}
	function find_unsupported_apis(html, wrapper) {
		if (is_api_undefined(wrapper)) {
			return html + `<li> <code>${wrapper}</code>.</li>`;
		}
		return html;
	}
	var unsupported_apis = wrapping_groups.groups.reduce((acc, group) =>
		group.wrappers.reduce(find_unsupported_apis, acc), "");
	if (unsupported_apis !== "") {
		unsupported_apis = `<div class="unsupported_api"><p>Your browser does not support:</p>${unsupported_apis}</div>`;
	}
	var fragment = document.createRange().createContextualFragment(`
<div>
		<p>Note that for fingerprintability prevention, JS Restrictor does not wrap objects that are not defined.</p>
	${unsupported_apis}
	<div>
	  <h2>${action_descr}</h2>
	</div>
	<form>

		<!-- Metadata -->
		<div class="main-section">
			<span class="section-header">Name:</span>
			<input id="level_text" value="${escape(params.level_text)}"></input>
		</div>
		<div class="main-section">
			<span class="section-header">Short ID:</span>
			<input id="level_id" ${params.level_id != "" ? "disabled" : ""} value="${escape(params.level_id)}"></input>
		</div>
		<div>
			<span class="table-left-column">This ID is displayed above the JSR icon. If you use an
					already existing ID, this custom level will replace the original level.</span>
		</div>
		<div class="main-section">
			<span class="section-header">Description:</span>
			<input id="level_description" value="${escape(params.level_description)}"></input>
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
		new_level = {};
		for (property in wrapping_groups.empty_level) {
			let p = wrapping_groups.option_map[property];
			let convertor = (p && p.data_type) ? window[p.data_type] : (a) => a;
			let elem = document.getElementById(property);
			let value_getter = (p && p.ui_elem && (p.ui_elem in html_element_value_source)) ? html_element_value_source[p.ui_elem] : "value";
			new_level[property] = convertor(elem[value_getter]);
		};

		if (new_level.level_id.length > 0 && new_level.level_text.length > 0 && new_level.level_description.length) {
			if (new_level.level_id.length > 3) {
				alert("Level ID too long, provide 3 characters or less");
				return;
			}
			async function updateLevels(new_level, stored_levels) {
				custom_levels = stored_levels.custom_levels;
				let ok = false;
				if (new_level.level_id in custom_levels) {
					ok = window.confirm("Custom level " + new_level.level_id + " already exists. It will be overriden.");
				}
				else {
					ok = true;
				}
				if (ok) {
					custom_levels[new_level.level_id] = new_level;
					try {
						await browser.storage.sync.set({custom_levels: custom_levels});
						location = "";
					}
					catch (err) {
						alert("Custom level were not updated, please try again later.");
					}
				}
			}
			browser.storage.sync.get("custom_levels").then(updateLevels.bind(null, new_level));
		}
		else {
			alert("Please provide all required fields: ID, Name, and Decription");
		}
	});
}

function edit_level(id) {
	prepare_level_config("Edit level " + escape(id), levels[id]);
}

function restore_level(id, level_params) {
	function restoreLevel(settings) {
		var custom_levels = settings.custom_levels;
		custom_levels[id] = level_params;
		browser.storage.sync.set({"custom_levels": custom_levels});
		var existPref = document.getElementById(`li-exist-group-${escape(id)}`);
		existPref.classList.remove("hidden");
		var removedPref = document.getElementById(`li-removed-group-${escape(id)}`);
		removedPref.classList.add("hidden");
		var lielem = document.getElementById(`li-${id}`);
		lielem.classList.remove("undo");
	}
	browser.storage.sync.get("custom_levels").then(restoreLevel);
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
	if (levels[level].builtin !== true) {
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
	function remove_level(settings) {
		var custom_levels = settings.custom_levels;
		// See https://alistapart.com/article/neveruseawarning/
		var existPref = document.getElementById(`li-exist-group-${escape(id)}`);
		existPref.classList.add("hidden");
		var removedPref = document.getElementById(`li-removed-group-${escape(id)}`);
		removedPref.classList.remove("hidden");
		var lielem = document.getElementById(`li-${id}`);
		lielem.classList.add("undo");
		delete custom_levels[id];
		browser.storage.sync.set({"custom_levels": custom_levels});
	}
	browser.storage.sync.get("custom_levels").then(remove_level);
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
	browser.storage.sync.get(["whitelistedHosts"]).then(function(result)
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
	browser.storage.sync.get(["requestShieldOn"]).then(function(result)
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

////////////////////////////////////////////////////////////////////////////////
// Debugging
function load_config_to_text() {
	browser.storage.sync.get(null).then(function (item) {
		document.getElementById("levels-storage-text").value = JSON.stringify(item, null, '\t');
	});
}

document.getElementById("logoimg").addEventListener("dblclick", function() {
	document.getElementById("sect-devel").style.display = "block";
	load_config_to_text();
});

document.getElementById("levels-storage-load").addEventListener("click", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-save").addEventListener("click", function() {
	browser.storage.sync.set(JSON.parse(document.getElementById("levels-storage-text").value));
});
