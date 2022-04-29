/** \file
 * \brief Code that handles the configuration of the extension
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2020  Peter Hornak
 *  \author Copyright (C) 2020  Pavel Pohner
 *  \author Copyright (C) 2022  Marek Salon
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


const MANDATORY_METADATA = ["level_id", "level_text", "level_description"];


function prepare_level_config(action_descr, params) {
	var configuration_area_el = document.getElementById("configuration_area");
	configuration_area_el.textContent = "";
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
		<p>Note that for fingerprintability prevention, JShelter does not wrap objects that are not defined.</p>
	${unsupported_apis}
	<div>
	  <h2>${action_descr}</h2>
	</div>
	<form>

		<!-- Metadata -->
		<div class="main-section">
			<label for="level_text">Name:</label>
			<input id="level_text" value="${escape(params.level_text)}"></input>
			<input type="hidden" id="level_id" ${params.level_id != "" ? "disabled" : ""} value="${escape(params.level_id)}"></input>
		</div>
		<div class="main-section">
			<label for="level_description">Description:</label>
			<input id="level_description" value="${escape(params.level_description)}"></input>
		</div>

		<div id="tweaks"></div>
		
		<button id="save" class="jsr-button">Save custom level</button>
	</form>
</div>`);
	configuration_area_el.appendChild(fragment);

	delete params["wrappers"];
	let tweaks = Object.assign({}, wrapping_groups.empty_level, params);
	let tweaksContainer = document.getElementById("tweaks");
	let tweaksBusiness = Object.create(tweaks_gui);
	tweaksBusiness.get_current_tweaks = function() {
		let current = Object.assign({}, tweaks);
		for (id of MANDATORY_METADATA) {
			delete current[id];
		}
		return current;
	};
	tweaksBusiness.tweak_changed = function(group_id, desired_tweak) {
		tweaks[group_id] = desired_tweak;
	}
	tweaksBusiness.create_tweaks_html(tweaksContainer);

	document.getElementById("save").addEventListener("click", function(e) {
		e.preventDefault();
		let new_level = tweaks;
		for (id of MANDATORY_METADATA) {
			let elem = document.getElementById(id);
			new_level[id] = elem.value;
		};

		if (new_level.level_id.length > 0 && new_level.level_text.length > 0 && new_level.level_description.length) {
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
		<button class="level" id="${escape(currentId)}" title="${escape(levels[level].level_description)}">
			${escape(levels[level].level_text)}
		</button>
		<span class="help_ovisible">${escape(create_short_text(levels[level].level_description, 50))}</span>
		<span></span>
		<p class="hidden_help_text"><label for="${escape(currentId)}">${escape(levels[level].level_description)}</label></p>
		</li>`);
	levelsEl.appendChild(fragment);
	var lielem = document.getElementById(`li-${level}`); // Note that FF here requires unescaped ID
	if (levels[level].builtin === true) {
		var view = document.createElement("button");
		view.id = `show-tweaks-${escape(level)}`;
		view.classList.add("help");
		view.appendChild(document.createTextNode("⤵"));
		var tweaksEl = document.createElement("div");
		tweaksEl.classList.add("tweakgrid");
		tweaksEl.classList.add("hidden_descr");
		tweaksEl.id = `tweaks-${escape(level)}`;
		lielem.getElementsByTagName('button')[0].insertAdjacentElement("afterend", view);
		lielem.appendChild(tweaksEl);
		let tweaksBusiness = Object.create(tweaks_gui);
		tweaksBusiness.get_current_tweaks = function() {
			return getTweaksForLevel(level, {});
		};
		tweaksBusiness.create_tweaks_html(tweaksEl);
		view.addEventListener("click", function(ev) {
			tweaksEl.classList.toggle("hidden_descr");
			ev.preventDefault();
		});
	}
	else {
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
	prepareHiddenHelpText(lielem.getElementsByClassName('hidden_help_text'), lielem.getElementsByClassName('help_ovisible'));
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

window.addEventListener("load", async function() {
	if (!levels_initialised) {
		levels_updated_callbacks.push(insert_levels);
	}
	else {
		insert_levels();
	}
	await Promise.all([
		load_module_settings("nbs"),
		load_module_settings("fpd")
	])
	loadWhitelist("nbs");
	load_on_off_switch("nbs");
	loadWhitelist("fpd");
	load_on_off_switch("fpd");
});

document.getElementById("new_level").addEventListener("click", function() {
	let new_level = Object.assign({}, wrapping_groups.empty_level);
	let seq = Object.keys(levels).length;
	let new_id;
	do {
		new_id = "Custom" + String(seq);
		seq++;
	}	while (levels[new_id] !== undefined)
	new_level.level_id = new_id;
	prepare_level_config("Add new level", new_level)
});

document.getElementById("nbs-whitelist-show").addEventListener("click", () => show_whitelist("nbs"));
document.getElementById("nbs-whitelist-add-button").addEventListener("click", () => add_to_whitelist("nbs"));
document.getElementById("nbs-whitelist-input").addEventListener('keydown', (e) => {if (e.key === 'Enter') add_to_whitelist("nbs")});
document.getElementById("nbs-whitelist-remove-button").addEventListener("click", () => remove_from_whitelist("nbs"));
document.getElementById("nbs-whitelist-select").addEventListener('keydown', (e) => {if (e.key === 'Delete') remove_from_whitelist("nbs")});
document.getElementsByClassName("slider")[0].addEventListener("click", () => {setTimeout(control_slider, 200, "nbs")});

document.getElementById("fpd-whitelist-show").addEventListener("click", () => show_whitelist("fpd"));
document.getElementById("fpd-whitelist-add-button").addEventListener("click", () => add_to_whitelist("fpd"));
document.getElementById("fpd-whitelist-input").addEventListener('keydown', (e) => {if (e.key === 'Enter') add_to_whitelist("fpd")});
document.getElementById("fpd-whitelist-remove-button").addEventListener("click", () => remove_from_whitelist("fpd"));
document.getElementById("fpd-whitelist-select").addEventListener('keydown', (e) => {if (e.key === 'Delete') remove_from_whitelist("fpd")});
document.getElementsByClassName("slider")[1].addEventListener("click", () => {setTimeout(control_slider, 200, "fpd")});

async function load_module_settings(prefix) {
	let settings = await browser.runtime.sendMessage({purpose: prefix + "-get-settings"});
	if (settings) {
		let tweaksBusiness = Object.create(tweaks_gui);
		tweaksBusiness.previousValues = new Object();
		tweaksBusiness.tweak_changed = function(key, val) {
			let permissions = settings.def[key].params[val].permissions || [];
			browser.permissions.request({permissions: permissions}).then((granted) => {
				if (granted) {
					tweaksBusiness.previousValues[key] = val;
				}
				else {
					let inputElement = document.querySelector(`#${prefix}-${key}-setting input`);
					inputElement.value = tweaksBusiness.previousValues[key];
					inputElement.dispatchEvent(new Event("input"));
				}
				browser.runtime.sendMessage({purpose: prefix + "-set-settings", id: key, value: tweaksBusiness.previousValues[key]});
			});
		}

		let targetElement = document.getElementById(prefix + "-settings");
		for ([key, setting] of Object.entries(settings.def)) {
			tweaksBusiness.previousValues[key] = settings.val[key];
			tweaksBusiness.add_tweak_row(targetElement, {}, key, settings.val[key], setting.label, setting, true);
		}
	}
}

function show_whitelist(prefix) {
	loadWhitelist(prefix);
	var whitelist = document.getElementById(prefix + "-whitelist-container");
	whitelist.classList.toggle("hidden");
}

function add_to_whitelist(prefix)
{	
	//obtain input value
	var to_whitelist = document.getElementById(prefix + "-whitelist-input").value;
	if (to_whitelist.trim() !== '')
	{
		var listbox = document.getElementById(prefix + "-whitelist-select");
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
		update_whitelist(listbox, prefix);

	}
	else
	{
		alert("Please fill in the hostname first.");
	}

}

function remove_from_whitelist(prefix)
{	
	var listbox = document.getElementById(prefix + "-whitelist-select");
	var selectedIndexes = getSelectValues(listbox);

	var j = 0;
	for (var i = 0; i < selectedIndexes.length; i++)
	{
		listbox.remove(selectedIndexes[i]-j);
		j++;
	}
	update_whitelist(listbox, prefix);
}

function update_whitelist(listbox, prefix)
{
	//Create new associative array
	var whitelistedHosts = new Object();
	//Obtain all whitelisted hosts from listbox
	for (var i = 0; i < listbox.length; i++)
	{
		whitelistedHosts[listbox.options[i].text] = true;
	}

	if (prefix == "nbs") setStorageAndSendMessage({"nbsWhitelist":whitelistedHosts}, {message:"whitelist updated"});
	if (prefix == "fpd") setStorageAndSendMessage({"fpdWhitelist":whitelistedHosts}, {purpose:"update-fpd-whitelist"});
}

//Overwrite the whitelist in storage and send message to background
function setStorageAndSendMessage(setter, message)
{
	browser.storage.sync.set(setter);
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
function loadWhitelist(prefix)
{	
	var listbox = document.getElementById(prefix + "-whitelist-select");
	listbox.options.length = 0;
	
	var whitelistName;
	if (prefix == "nbs") whitelistName = "nbsWhitelist";
	if (prefix == "fpd") whitelistName = "fpdWhitelist";
	
	//Get the whitelist
	browser.storage.sync.get([whitelistName]).then(function(result)
	{
		if (result[whitelistName] != undefined)
      	{
      		//Create list box options for each item
	        var it = 0;
	        Object.keys(result[whitelistName]).forEach(function(key, index) {
	        	listbox.options[it++] = new Option(key, key);
			}, result[whitelistName]);
  		}
	});
}

//Function called on window load, obtains whether is the protection on or off
function load_on_off_switch(prefix)
{
	var checkbox = document.getElementById(prefix + "-switch");

	var flagName;
	if (prefix == "nbs") flagName = "requestShieldOn";
	if (prefix == "fpd") flagName = "fpDetectionOn";

	//Obtain the information from storage
	browser.storage.sync.get([flagName]).then(function(result)
	{
		//Check the box
		if (result[flagName] || result[flagName] == undefined)
		{
			checkbox.checked = true;
			toggleSettings(prefix, true);
		}
		else
		{
			checkbox.checked = false;
			toggleSettings(prefix, false);
		}
	});
}

//OnClick event handler for On/Off slider
function control_slider(prefix)
{
	var checkbox = document.getElementById(prefix + "-switch");
	//Send appropriate message and store state into storage
	if (checkbox.checked)	//Turn ON
	{
		if (prefix == "nbs") setStorageAndSendMessage({"requestShieldOn": true}, {message:"turn request shield on"});
		if (prefix == "fpd") setStorageAndSendMessage({"fpDetectionOn": true}, {purpose:"fpd-state-change"});
		toggleSettings(prefix, true);
	}
	else
	{
		if (prefix == "nbs") setStorageAndSendMessage({"requestShieldOn": false}, {message:"turn request shield off"});
		if (prefix == "fpd") setStorageAndSendMessage({"fpDetectionOn": false}, {purpose:"fpd-state-change"});
		toggleSettings(prefix, false);
	}
}

function toggleSettings(prefix, enable) {
	tweaksArr = document.querySelectorAll(`#${prefix}-settings input.tlev`);
	tweaksArr.forEach((node) => {
		node.disabled = !enable;
	})
}

function prepareHiddenHelpText(originally_hidden_elements, originally_visible_elements = []) {
	Array.prototype.forEach.call(originally_hidden_elements, it => it.classList.add("hidden_descr"));
	let all_elements = Array.from(originally_hidden_elements).concat(Array.from(originally_visible_elements));
	var ctrl = document.createElement("button");
	ctrl.innerText = "?";
	ctrl.classList.add("help");
	ctrl.addEventListener("click", function(ev) {
		Array.prototype.forEach.call(all_elements, it => it.classList.toggle("hidden_descr"));
		ev.preventDefault();
	});
	originally_hidden_elements[0].previousElementSibling.insertAdjacentElement("beforeend", ctrl);
}

window.addEventListener("DOMContentLoaded", function() {
	function prepareHelpText(prefix) {
		prepareHiddenHelpText(document.getElementsByClassName(prefix + "_description"));
	}

	prepareHelpText("jss");
	prepareHelpText("nbs");
	prepareHelpText("fpd");
});
