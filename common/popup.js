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
var default_lev_button;
var fpd_active = false;

// Provide cusom handlers for Tweaks GUI
let popup_tweaks = Object.create(tweaks_gui);
popup_tweaks.get_current_tweaks = function() {
	return getTweaksForLevel(current_level.level_id, current_level.tweaks);
};
popup_tweaks.tweak_changed = function(group_id, desired_tweak) {
	if (!current_level.tweaks) {
		current_level.tweaks = {};
	}
	current_level.tweaks[group_id] = desired_tweak;
	domains[site] = current_level;
	saveDomainLevels();
	enableRefreshIfNeeded();
};
popup_tweaks.assign_custom_params = function(group) {
	group.groupHits = hits[group.name] || 0;
};
popup_tweaks.customize_tweak_row = function (tweakRow, group) {
	// Don't show hits for WASM optimization group tweak
	if (group.name === "wasm") {
		tweakRow.querySelector(".hits").textContent = "-";
		return;
	}

	let groupHits = group.groupHits;
	if (groupHits >= 999) {
		groupHits = "1000 or more";
	}
	else if (!fpd_active) {
		let main = current_level[group.name];
		let tweaks = current_level.tweaks;
		if (!(tweaks && (tweaks[group.name] > 0))) {
			if ((tweaks && tweaks[group.name] === 0) || (!(main > 0))) {
				groupHits = String(groupHits) + " (unreliable)";
			}
		}
	}
	tweakRow.querySelector(".hits").textContent = groupHits;
};
popup_tweaks.cmp_groups = function (firstObj, secondObj) {
	let firstGr = firstObj.group;
	let secondGr = secondObj.group;
	return secondGr.groupHits - firstGr.groupHits;
};

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
 * Disable JSS for this page.
 */
async function disable_jss(orig_level) {
	//document.getElementById("jss-switch").checked = false;
	current_level = Object.assign(orig_level ? {restore: orig_level.level_id} : {}, level_0);
	if (orig_level && orig_level.tweaks) {
		current_level.restore_tweaks = orig_level.tweaks;
	}
	document.getElementById("js-settings").classList.add("hidden");
	document.getElementById("js-toggle-btn").classList.add("hidden");
	domains[site] = current_level;
	modify_level(current_level);
	document.getElementById("jss-switch").onchange = () => {
		enable_jss(orig_level);
		let widget = document.getElementById("js-toggle");
		widget.checked = true;
		widget.parentElement.classList.toggle("toggled", true);
	};
}

async function enable_jss(level) {
	let isdefault = !domains[site];
	if (!level) {
		level = Object.assign({}, default_level);
		if (level.level_id === level_0.level_id) {
			level = Object.assign({}, level_2);
			isdefault = false;
		}
		else {
			isdefault = true;
		}
	}
	if (level.level_id === level_0.level_id) {
		document.getElementById("jss-switch").checked = false;
		let restore = level.restore;
		if (restore) {
			disable_jss(Object.assign(level.restore_tweaks ? {tweaks: level.restore_tweaks} : {}, levels[restore]));
		}
		else {
			disable_jss();
		}
		return;
	}
	if (isdefault) {
		delete domains[site];
	}
	else {
		domains[site] = level;
	}
	modify_level(level, isdefault ? default_lev_button : levels[level.level_id].button);
	document.getElementById("js-settings").classList.remove("hidden");
	document.getElementById("js-toggle-btn").classList.remove("hidden");
	document.getElementById("jss-switch").onchange = () => {
		isdefault ? disable_jss() : disable_jss(current_level);
	};
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
		b.textContent = level.level_text;
		b.title = level.level_description;
		level.button = b;
		return selectEl.appendChild(b);
	}
	// Add default level button
	default_lev_button = addButton({level_id: "DEFAULT", level_description: "You can set of of the levels as the global default level. Use this level for this page.", level_text: `Default level (${default_level.level_text})`});
	default_lev_button.addEventListener("click", ev => {
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
	const LIMIT = 300;
	document.getElementById("level-text").textContent = current_level.level_text;
	let descriptionEl = document.getElementById("level-description");
	let moreEl = document.getElementById("current_site_level_settings").querySelector(".more");
	let lessEl = document.getElementById("current_site_level_settings").querySelector(".less");
	let shortDescr = create_short_text(current_level.level_description, LIMIT);
	descriptionEl.textContent = ` - ${shortDescr}`;
	if (current_level.level_description != shortDescr) {
		lessEl.classList.add("hidden_descr");
		moreEl.classList.remove("hidden_descr");
		moreEl.onclick = function() {
			descriptionEl.textContent = " - " + current_level.level_description;
			moreEl.classList.add("hidden_descr");
			lessEl.classList.remove("hidden_descr");
			return false;
		}
		lessEl.onclick = function() {
			descriptionEl.textContent = ` - ${shortDescr}`;
			lessEl.classList.add("hidden_descr");
			moreEl.classList.remove("hidden_descr");
			return false;
		}
	}
	else {
		lessEl.classList.add("hidden_descr");
		moreEl.classList.add("hidden_descr");
	}
}

function update_tweaks() {
	let tweaksContainer = document.getElementById("tweaks");
	document.body.classList.remove("tweaking");
	let tweakBtn = document.getElementById("btn-tweak");
	tweakBtn.disabled = true;

	if (current_level.tweaks && Object.keys(current_level.tweaks).length) {
		popup_tweaks.create_tweaks_html(tweaksContainer);
		tweakBtn.disabled = true;
	}
	else if (current_level.level_id !== "0") {
		tweakBtn.disabled = false;
		tweakBtn.onclick = function() {
			popup_tweaks.create_tweaks_html(tweaksContainer);
			tweakBtn.disabled = true;
		};
	}
}

/**
 * Fill the content of the JS Shield settings
 */
function fill_jsshield(msg) {
	current_level = msg;
	enable_jss(msg);
	enableRefreshIfNeeded();
	fpdGetSeverity();

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

{
	let widget = document.getElementById('js-toggle');
	let key = `controls-${widget.id}-checked`;
	widget.checked = localStorage.getItem(key) === 'true';
	(widget.onchange = () => {
		let {checked} = widget;
		widget.parentElement.classList.toggle("toggled", checked);
		localStorage.setItem(key, checked);
	})();
}

document.getElementById("nbs-switch").addEventListener("change", () => {setTimeout(control_whitelist, 200, "nbs")});
document.getElementById("fpd-switch").addEventListener("change", () => {setTimeout(control_whitelist, 200, "fpd")});

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
		return site = getEffectiveDomain(tab.url);
	} catch (e) {
		if (e.toString() === "Error: Missing host permission for the tab") {
			await async_sleep(200); // recursively call itself, this exception occurs in Firefox during an inactive tab activation (tab page was not reload after the browser start)
			return await getCurrentSite();
		}
		return site = null;
	}
}


document.getElementById("severity_value").addEventListener("click", async function () {
	let [tab] = await browser.tabs.query({currentWindow: true, active: true});
	browser.runtime.sendMessage({purpose: "fpd-create-report", tabId: tab.id});
});

/// Get fingerprinting severity from FPD and show it in a popup
async function fpdGetSeverity() {
	let [tab] = await browser.tabs.query({currentWindow: true, active: true});
	let response = await browser.runtime.sendMessage({purpose: "fpd-fetch-severity", tabId: tab.id});
	if (response) {
		let element = document.getElementById("severity_value");
		if (response[1]) {
			element.innerText = response[1];
			document.getElementById("severity_container").classList.remove("hidden");
		}
		if (response[2]) {
			element.style.backgroundColor = response[2];
		}
	}
	setTimeout(fpdGetSeverity, 2000);
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
			fpd_active = !response;
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
