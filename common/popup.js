/** \file
 * \brief JS code for pop up
 *
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2020  Pavel Pohner
 *  \author Copyright (C) 2021  Marek Salon
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

async function init() {
  // get the site of current tab
	site = await getCurrentSite();
	// abort per-site options if it can't be accessed
	if (!site) return;
	document.getElementById('site-settings').classList.add("enabled");
	document.getElementById('current-site').textContent = site;

	// fill the popup
	var port_to_background = browser.runtime.connect({name:"port_from_popup"});
	var current_level = { level_id: "?" };
	port_to_background.onMessage.addListener(function(msg) {
		current_level = msg;
		document.body.innerHTML += `<div>${JSON.stringify(wrapping_groups)}</div>`;
		var selectEl = document.getElementById("level-select");
		function addButton(level) {
			let b = document.createElement("button");
			b.id = `select-${level.level_id}`;
			b.className = "level level_control";
			b.textContent = level.level_id;
		  b.title = level.level_text;
			return selectEl.appendChild(b);
		}
		addButton({level_id: "DEFAULT", level_text: `Default level (${default_level.level_id})`})
		.addEventListener("click", ev => {
			delete domains[site];
		 	update(default_level, ev.target);
		});
		for (let level_id in levels) {
			let level = levels[level_id];
			addButton(level).addEventListener("click", ev => {
				domains[site] = {
					level_id: level.level_id,
				};
				update(level, ev.target);
			});
		}
		let  currentEl = document.getElementById(`select-${current_level.is_default ? "DEFAULT" : current_level.level_id}`);
		if (currentEl !== null) {
			currentEl.classList.add("active");
		}

		update();

		function update(level, element) {
			if (level) {
				current_level = level;
				saveDomainLevels();
			  if (element) changeActiveLevel(element);
			}
			document.getElementById("level-text").textContent = current_level.level_text;
			document.getElementById("level-description").textContent = ` - ${current_level.level_description}`;
			let tweaks = document.getElementById("tweaks");
			tweaks.innerHTML = "";
			if (current_level.tweaks) {
				tweaks.appendChild(document.getElementById("tweak-head").content);
				let tweakRow = document.getElementById("tweak-row").content.cloneNode(true);
				for (let [group, tlev_id] of Object.entries(current_level.tweaks)) {
					tweakRow.querySelector("label").textContent = group;
					tweakRow.querySelector(".tlev").value = parseInt(tlev_id);
					tweaks.appendChild(tweakRow);
				}
			}
		}
	});
}

// Open options in a new tab when clicking on the icon
document.getElementById('controls').addEventListener('click', function (e) {
	browser.runtime.openOptionsPage();
	window.close();
});

window.addEventListener("load", function() {
	if (!site) return;
 	load_fp_switch();
	load_on_off_switch();
});

document.getElementsByClassName("slider")[0].addEventListener("click", () => {setTimeout(control_whitelist, 200)});
document.getElementsByClassName("slider")[1].addEventListener("click", () => {setTimeout(control_fp_detection, 200)});

/// Load switch FPD state from storage
function load_fp_switch()
{
	browser.storage.sync.get(["fpDetectionOn"]).then(function(result)
	{
		document.getElementById("fpd-switch").checked = result.fpDetectionOn
	});
}

async function getCurrentSite() {
	if (typeof site !== "undefined") return site;
	try {
		// Check whether content scripts are allowed on the current tab:
		// if an exception is thrown, showing per-site settings is pointless,
		// because we couldn't operate here anyway
		await browser.tabs.executeScript({code: ""});

		let [tab] = await browser.tabs.query({currentWindow: true, active: true});
		// Obtain and normalize hostname
		return site = wwwRemove(new URL(tab.url).hostname);
	} catch (e) {
		return site = null;
	}
}

/// Load switch state from storage for current site
async function load_on_off_switch()
{
	let {requestShieldOn} = await browser.storage.sync.get(["requestShieldOn"]);
	let container = document.getElementById("http_shield_whitelist");
	if (requestShieldOn === false)
	{
		container.classList.add("off");
	}
	else
	{
		container.classList.remove("off");
		//Ask background whether is this site whitelisted or not
		let response = await browser.runtime.sendMessage({message: "is current site whitelisted?", site});
		document.getElementById("shield-switch").checked = response !== "current site is whitelisted";
	}
}

/// Event handler for On/off switch
async function control_whitelist()
{
	let message = `${document.getElementById("shield-switch").checked ? "remove" : "add"} site to whitelist`;
	if (document.getElementById("switch-checkbox").checked) {
		message = "remove site from whitelist";
	}
	else {
		message = "add site to whitelist";
	}
	browser.runtime.sendMessage({message, site});
	showRefreshPageOption();
}

/// Event handler for On/off switch
function control_fp_detection()
{
	var checkbox = document.getElementById("fpd-switch");
	browser.storage.sync.set({fpDetectionOn: checkbox.checked});
	browser.runtime.sendMessage({purpose:"fpd-state-change", enabled: checkbox.checked});
	showRefreshPageOption();
}

init();
