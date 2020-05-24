//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2019  Libor Polcak
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

const fadeOut = "0.3";
const fadeIn = "1.0";

var myAddon = new URL(browser.runtime.getURL ('./')); // get my extension / addon url
var url; // "www.example.com"

/**
 * Visaully highlights the active level.
 */
function changeActiveLevel(activeEl) {
	Array.prototype.forEach.call(document.getElementsByClassName("level_control"),
		(el) => el.classList.remove("active"));
	activeEl.classList.add("active");
	document.getElementById('set-level-on').innerHTML = "<a href='' id='refresh-page'>Refresh page</a>";
	document.getElementById('refresh-page').addEventListener('click', function (e) {
		browser.tabs.reload();
		window.close();
	});
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
	url.hostname = url.hostname.replace(/^www\./,'');
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
