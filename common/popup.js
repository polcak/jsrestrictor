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

var myAddon = new URL(browser.runtime.getURL ('./')); // get my extension / addon url
var url; // "www.example.com"

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

//find url of current tab where popup showed
var queryInfo = {
  active: true,
  currentWindow: true
};
browser.tabs.query(queryInfo).then(function(tabs) {
	let tab = tabs[0];
	url = new URL(tab.url);
	// remove www
	url.hostname = wwwRemove(url.hostname);
	if (url.hostname == "" || url.hostname == myAddon.hostname || url.hostname == "newtab") {
		document.getElementById("site-settings").style.display = "none";
		return;
	}
	else {
		document.getElementById('current-site').innerHTML = url.hostname;
	}
	// fill the popup
	var port_to_background = browser.runtime.connect({name:"port_from_popup"});
	var current_level = { level_id: "?" };
	port_to_background.onMessage.addListener(function(msg) {
		current_level = msg;
		var selectEl = document.getElementById("level-select");
		selectEl.innerHTML = `<span class="level level_control" id="default_level_select" title="Set the default level">Default</span>`;
		document.getElementById(`default_level_select`).addEventListener("click", function () {
			delete domains[url.hostname];
			saveDomainLevels();
			changeActiveLevel(this);
			current_level = default_level;
		});
		for (let level_id in levels) {
			let level = levels[level_id];
			selectEl.appendChild(document.createRange().createContextualFragment(`<span class="level level_control" id="select-${level.level_id}" title="${level.level_text}">${escape(level.level_id + ": " + level.level_text)}</span>`));
			document.getElementById(`select-${level.level_id}`).addEventListener("click", function () {
				domains[url.hostname] = {
					level_id: level.level_id,
				};
				saveDomainLevels();
				changeActiveLevel(this);
				current_level = level;
			});
		}
		if (current_level.is_default) {
			document.getElementById(`default_level_select`).classList.add("active");
		}
		else {
			var currentEl = document.getElementById(`select-${current_level.level_id}`);
			if (currentEl !== null) {
				currentEl.classList.add("active");
			}
		}
	});
});

// Open options in a new tab when clicking on the icon
document.getElementById('controls').addEventListener('click', function (e) {
	browser.runtime.openOptionsPage();
	window.close();
});

window.addEventListener("load", function() {
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
	let tabs = await browser.tabs.query({currentWindow: true, active: true});
	//Obtain hostname
	return wwwRemove(new URL(tabs[0].url).hostname);
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
		let site = await getCurrentSite();
		//Ask background whether is this site whitelisted or not
		let response = await browser.runtime.sendMessage({message: "is current site whitelisted?", site});
		document.getElementById("shield-switch").checked = response !== "current site is whitelisted";
	}
}

/// Event handler for On/off switch
async function control_whitelist()
{
	let site = await getCurrentSite();
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
