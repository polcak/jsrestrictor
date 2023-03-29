/** \file
 * \brief JS code for pop up
 *
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2020  Pavel Pohner
 *  \author Copyright (C) 2021  Marek Salon
 *  \author Copyright (C) 2022  Giorgio Maone
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

var site; // "https://www.example.com" from current tab will become "example.com"
var pageConfiguration = {};
var hits;
var current_level;
/**
 * Enable the refresh page option.
 */
function showRefreshPageOption(toggle = true) {
	let button = document.getElementById('refresh-page');
	button.addEventListener('click', function (e) {
		browser.tabs.reload();
		window.close();
	});
	(showRefreshPageOption = function(toggle = true) {
		button.disabled = !toggle;
	})(toggle);
}

/**
 * Visaully highlights the active level.
 */
function changeActiveLevel(activeEl) {
	Array.prototype.forEach.call(document.getElementsByClassName("level_control"),
		(el) => el.classList.remove("active"));
	activeEl.classList.add("active");
	showRefreshPageOption();
}

/**
 * Control the state of the Refresh button
 */
function enableRefreshIfNeeded() {
	let pageLevel = pageConfiguration.currentLevel;

	let level4comp = ({level_id, tweaks}) => JSON.stringify({level_id, tweaks});

	let needsRefresh = !pageLevel ||
		level4comp(pageLevel) !== level4comp(current_level);

	if (needsRefresh) {
		showRefreshPageOption();
	}
}

/**
 * Save level settings for current page, show correct button
 */
function modify_level(level, levelButton) {
	if (level) {
		current_level = level;
		saveDomainLevels();
	  if (levelButton) {
			changeActiveLevel(levelButton);
		}
		update_level_info();
		update_tweaks();
	}
}

/**
 * Load levels and add level setting buttons
 */
function add_level_buttons() {
	var selectEl = document.getElementById("level-select");
	function addButton(level) {
		let b = document.createElement("button");
		b.id = `select-${level.level_id}`;
		b.className = "level level_control";
		b.textContent = level.level_id;
	  b.title = level.level_text;
		return selectEl.appendChild(b);
	}
	// Add default level button
	addButton({level_id: "DEFAULT", level_text: `Default level (${default_level.level_id})`})
	.addEventListener("click", ev => {
		delete domains[site];
		modify_level(default_level, ev.target);
	});
	// Load built-in and custom levels
	for (let level_id in levels) {
		let level = levels[level_id];
		addButton(level).addEventListener("click", function (ev) {
			domains[site] = {
				level_id: level.level_id,
			};
			modify_level(level, ev.target);
		});
	}
	let  currentEl = document.getElementById(`select-${current_level.is_default ? "DEFAULT" : current_level.level_id}`);
	if (currentEl !== null) {
		currentEl.classList.add("active");
	}
}


function update_level_info() {
	document.getElementById("level-text").textContent = current_level.level_text;
	document.getElementById("level-description").textContent = ` - ${current_level.level_description}`;
}

function get_current_tweaks() {
	function defaultTweaks() {
		let tt = {}
		let tlev_id = current_level.level_id;
		for (let g of wrapping_groups.groups) {
			tt[g.id] = tlev_id; // FIXME this code suppose that each group has the same number of levels as the extension itself, the level should hold this information
		}
		return tt;
	}
	return Object.assign(defaultTweaks(), current_level.tweaks || {});
}

function create_group_descriptors(option_map) {
	let tweakEntries = Object.entries(get_current_tweaks()).map(([group_id, tlev_id]) => {
			let group = option_map[group_id];
			let label = group.label || group.name;
			group.groupHits = 0;
			for (let wrapper of group.wrappers) {
				if (hits[wrapper]) {
					group.groupHits += hits[wrapper];
				}
			}
			return { group_id, tlev_id, label, group, toString() { return this.label } };
		}
	);
	return tweakEntries;
}

function sort_group_descriptors(tweakEntries) {
	return tweakEntries.sort(function (firstObj, secondObj) {
		let firstGr = firstObj.group;
		let secondGr = secondObj.group;
		return secondGr.groupHits - firstGr.groupHits;
	});
}

function add_tweak_row(tweaksContainer, option_map, group_id, tlev_id, label, group) {
	let tweakRow = document.getElementById("tweak-row").content.cloneNode(true);
	tweakRow.querySelector("label").textContent = label;
	let groupHits = group.groupHits;
	if (groupHits >= 999) {
		groupHits = "1000 or more";
	}
	tweakRow.querySelector(".hits").textContent = groupHits;

	let tlevUI = tweakRow.querySelector(".tlev");
	let status = tweakRow.querySelector(".status");
	let updateStatus = lid => {
		let l = levels[lid];
		if (l[group_id] === true) {
			status.innerHTML = "<strong>ON</strong> ";
			let optionsDes = document.createElement("em");
			let prefix = `${group_id}_`;
			let choices = [];
			for (let optId of Object.keys(l).filter(k => k.startsWith(prefix))) {
				let val = l[optId];
				let opt = option_map[optId];
				let des = opt.options && opt.options.length ? option_map[`${optId}_${val}`].description : val && opt.description || "";
				if (des) choices.push(des);
			}
			if (choices.length) {
				optionsDes.append(` - ${choices.join(" / ")}`);
				status.appendChild(optionsDes);
			}
		} else {
			status.innerHTML = "OFF";
		}
	}
	updateStatus(tlev_id);
  tweakRow.querySelector(".description").textContent = group.description;
	let more = tweakRow.querySelector(".more");
	let less = tweakRow.querySelector(".less");
	let longDescription = group.description2;
	if (!longDescription || longDescription.length === 0) {
		less.remove();
		more.remove();
	} else {
		more.onclick = function() {
			let parent = document.createElement("div");
			for (let line of longDescription) {
				parent.appendChild(document.createElement("p")).textContent = line;
			}
			more.replaceWith(parent);
			return false;
	  }
		less.onclick = function() {
			this.previousElementSibling.replaceWith(more);
			return false;
		}
	}

	tlevUI.value = tlevUI.nextElementSibling.value = parseInt(tlev_id);
	tlevUI.onchange = () => {
		if (!current_level.tweaks) current_level.tweaks = {};
		updateStatus(current_level.tweaks[group_id] = tlevUI.nextElementSibling.value = tlevUI.value);
		domains[site] = current_level;
		saveDomainLevels();
		enableRefreshIfNeeded();
	}
	tweaksContainer.appendChild(tweakRow);
}

function create_tweaks_html(tweaksContainer) {
	tweaksContainer.innerHTML = "";
	tweaksContainer.appendChild(document.getElementById("tweak-head").content);
	let {option_map} = wrapping_groups;
	let tweakEntries = sort_group_descriptors(create_group_descriptors(option_map));

	for (let { group_id, tlev_id, label, group} of tweakEntries) {
		add_tweak_row(tweaksContainer, option_map, group_id, tlev_id, label, group);
	}
	document.body.classList.add("tweaking");
}

function update_tweaks() {
	let tweaksContainer = document.getElementById("tweaks");
	document.body.classList.remove("tweaking");
	let tweakBtn = document.getElementById("btn-tweak");
	tweakBtn.disabled = true;

	if (current_level.tweaks && Object.keys(current_level.tweaks).length) {
		create_tweaks_html(tweaksContainer);
		tweakBtn.disabled = true;
	}
	else if (current_level.level_id !== "0") {
		tweakBtn.disabled = false;
		tweakBtn.onclick = function() {
			create_tweaks_html(tweaksContainer);
			tweakBtn.disabled = true;
		};
	}
}

/**
 * Fill the content of the JS Shield settings
 */
function fill_jsshield(msg) {
	current_level = msg;
	enableRefreshIfNeeded();

	add_level_buttons();
	update_level_info();
	update_tweaks();
}

async function init_jsshield() {
  // get the site of current tab
	site = await getCurrentSite();
	// abort per-site options if it can't be accessed
	if (!site) return;
	document.getElementById('site-settings').classList.add("enabled");
	document.getElementById('current-site').textContent = site;

	// fill the popup
	var port_to_background = browser.runtime.connect({name:"port_from_popup"});
	current_level = { level_id: "?" };

	port_to_background.onMessage.addListener(fill_jsshield);
}

// Open options in a new tab when clicking on the icon
document.getElementById("global-settings").addEventListener('click', function(e) {
	  browser.runtime.openOptionsPage();
	  window.close();
  });

for (let widget of document.querySelectorAll('.controls[type=checkbox]')) {
	let key = `controls-${widget.id}-checked`;
	widget.checked = localStorage.getItem(key) === 'true';
	(widget.onclick = () => {
		let {checked} = widget;
		widget.parentElement.classList.toggle("toggled", checked);
		localStorage.setItem(key, checked);
	})();
}

document.getElementsByClassName("slider")[0].addEventListener("click", () => {setTimeout(control_whitelist, 200, "nbs")});
document.getElementsByClassName("slider")[1].addEventListener("click", () => {setTimeout(control_whitelist, 200, "fpd")});

async function getCurrentSite() {
	if (typeof site !== "undefined") return site;
	try {
		// Check whether content scripts are allowed on the current tab:
		// if an exception is thrown, showing per-site settings is pointless,
		// because we couldn't operate here anyway
		[pageConfiguration = {}] = await browser.tabs.executeScript({code:
			`typeof pageConfiguration === "object" && pageConfiguration || {};`});

		let [tab] = await browser.tabs.query({currentWindow: true, active: true});
		hits = await browser.runtime.sendMessage({purpose: 'fpd-fetch-hits', tabId: tab.id});
		// Obtain and normalize hostname
		return site = wwwRemove(new URL(tab.url).hostname);
	} catch (e) {
		if (e.toString() === "Error: Missing host permission for the tab") {
			await async_sleep(200); // recursively call itself, this exception occurs in Firefox during an inactive tab activation (tab page was not reload after the browser start)
			return await getCurrentSite();
		}
		return site = null;
	}
}

/// Load switch state from storage for current site
async function load_on_off_switch(prefix)
{
	var flagName;
	if (prefix == "nbs") flagName = "requestShieldOn";
	if (prefix == "fpd") flagName = "fpDetectionOn";

	let result = await browser.storage.sync.get([flagName]);
	let container = document.getElementById(prefix + "_whitelist");
	if (result[flagName] === false)
	{
		container.classList.add("off");
	}
	else
	{
		container.classList.remove("off");
		//Ask background whether is this site whitelisted or not
		if (prefix == "nbs")
		{
			let response = await browser.runtime.sendMessage({message: "is current site whitelisted?", site});
			document.getElementById(prefix + "-switch").checked = response !== "current site is whitelisted";
		}
		if (prefix == "fpd")
		{
			let response = await browser.runtime.sendMessage({purpose: "fpd-whitelist-check", url: site});
			document.getElementById(prefix + "-switch").checked = !response;
		}
	}
}

/// Event handler for On/off switch
async function control_whitelist(prefix)
{
	let site = await getCurrentSite();
	var message;
	if (document.getElementById(prefix + "-switch").checked) {
		if (prefix == "nbs") message = "remove site from whitelist";
		if (prefix == "fpd") message = "remove-fpd-whitelist";
	}
	else {
		if (prefix == "nbs") message = "add site to whitelist";
		if (prefix == "fpd") message = "add-fpd-whitelist";
	}

	if (prefix == "nbs") browser.runtime.sendMessage({message, site});
	if (prefix == "fpd") browser.runtime.sendMessage({purpose: message, url: site});
	showRefreshPageOption();
}

addEventListener("DOMContentLoaded", async () => {
	await init_jsshield();
	if (!site) {
		return;
	}
	load_on_off_switch("nbs");
	load_on_off_switch("fpd");
});

