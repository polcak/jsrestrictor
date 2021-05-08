//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2020  Pavel Pohner
//  Copyright (C) 2021  Matyas Szabo
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

const fadeOut = "0.3";
const fadeIn = "1.0";
var myAddon = new URL(browser.runtime.getURL ('./')); // get my extension / addon url
var url; // "www.example.com"

/**
 * Enable the refresh page option.
 */
function showRefreshPageOption() {
	document.getElementById('set-level-on').innerHTML = "<a href='' id='refresh-page'>Refresh page</a>";
	document.getElementById('refresh-page').addEventListener('click', function (e) {
		browser.tabs.reload();
		window.close();
	});
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
browser.tabs.query(queryInfo, function(tabs) {
	let tab = tabs[0];
	url = new URL(tab.url);
	// remove www
	url.hostname = wwwRemove(url.hostname);
	if (url.hostname == "" || url.hostname == myAddon.hostname || url.hostname == "newtab") {
		document.getElementById("current_site_level_settings").style.opacity = fadeOut;
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
			selectEl.appendChild(document.createRange().createContextualFragment(`<span class="level level_control" id="select-${level.level_id}" title="${level.level_text}">${escape(level.level_id)}</span>`));
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
	load_on_off_switches();
});

document.getElementsByClassName("slider")[0].addEventListener("click", () => {setTimeout(control_whitelist, 200)});
document.getElementById("formlock_slider").addEventListener("click", () => {setTimeout(control_formlock, 200)});

/// Load switch state from storage for current site
function load_on_off_switches()
{
	var checkbox = document.getElementById("switch-checkbox");

	browser.storage.sync.get(["requestShieldOn"], function(result)
	{
		if (result.requestShieldOn === false)
		{
			document.getElementById("http_shield_switch_wrapper").style.display = "none";
			document.getElementById("shield_off_message").innerHTML = "Network boundary shield is currently off.";
		}	
		else
		{
			var currentHost = "";
			//Obtain URL of the current site
			browser.tabs.query({currentWindow: true, active: true}, function (tabs) {
				//Obtain hostname
				currentHost = new URL(tabs[0].url);
				currentHost = wwwRemove(currentHost.hostname);
				//Ask background whether is this site whitelisted or not
				browser.runtime.sendMessage({message:"is current site whitelisted?", site:currentHost}, function (response) {
					//Check or uncheck the slider
					if (response === "current site is whitelisted")
					{
						checkbox.checked = false;
					}
					else
					{
						checkbox.checked = true;
					}
				});
			});
		}
	});

	var FL_checkbox = document.getElementById("switch-formlock-checkbox");

	browser.tabs.query({currentWindow: true, active: true}, function (tabs) {
		let curr_level = getCurrentLevelJSON(tabs[0].url)[0];
		if (curr_level.formlock !== true){
			document.getElementById("formlock_switch_wrapper").style.display = "none";
			document.getElementById("formlock_off_message").innerHTML = "Formlock is turned off on this website";
		}
		else {
			var currentHost = new URL(tabs[0].url);
			currentHost = wwwRemove(currentHost.hostname);
			browser.runtime.sendMessage({message : "are 3rd party requests blocked on this site?", site : tabs[0].url}, function (response) {
				//Check or uncheck the slider
				if (response === "no")
				{
					FL_checkbox.checked = false;
				}
				else
				{
					FL_checkbox.checked = true;
				}
			});
		}
	});
}

/// Event handler for On/off switch
function control_whitelist()
{
	var checkbox = document.getElementById("switch-checkbox");

	var currentHost = "";
	//Obtain current site URL
	browser.tabs.query({currentWindow: true, active: true}, function (tabs) {
		//Obtain hostname
		currentHost = new URL(tabs[0].url);
		currentHost = wwwRemove(currentHost.hostname);
		//Send approriate message based on slider's state
		if (!checkbox.checked)	//Turn ON
		{
			browser.runtime.sendMessage({message:"add site to whitelist", site:currentHost}, function (response) {});
		}
		else
		{
			browser.runtime.sendMessage({message:"remove site from whitelist", site:currentHost},
				function (response) {});
		}
	});
	showRefreshPageOption();
}

// Event handler for On/off Formlock switch
// This function is a copy of the one above
function control_formlock()
{
	var checkbox = document.getElementById("switch-formlock-checkbox");

	var currentHost = "";
	//Obtain current site URL
	browser.tabs.query({currentWindow: true, active: true}, function (tabs) {
		//Obtain hostname
		currentHost = new URL(tabs[0].url);
		currentHost = wwwRemove(currentHost.hostname);
		//Send approriate message based on slider's state
		if (!checkbox.checked)	//Turn ON
		{
			browser.runtime.sendMessage({message:"formlock add whitelisted site", site:currentHost}, function (response) {});
		}
		else
		{
			browser.runtime.sendMessage({message:"formlock remove whitelisted site", site:currentHost},
				function (response) {});
		}
	});
	showRefreshPageOption();
}
