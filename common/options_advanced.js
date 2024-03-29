/** \file
 * \brief Code that handles the configuration of the extension
 *
 *  \author Copyright (C) 2022  Libor Polcak
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

let original_config = undefined;
document.getElementById("levels-storage-undo").classList.add("hidden");

function load_config_to_text(keep_config = false) {
	browser.storage.sync.get(null).then(function (item) {
		document.getElementById("levels-storage-text").value = JSON.stringify(item, null, '\t');
		if (keep_config) {
			original_config = item;
		}
	});
}

window.addEventListener("DOMContentLoaded", function() {
	load_config_to_text(true);
});

document.getElementById("levels-storage-load").addEventListener("click", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-save").addEventListener("click", async function() {
	try {
		await checkAndSaveConfig(JSON.parse(document.getElementById("levels-storage-text").value));
	}
	catch (e) {
		alert("The configuration is not valid.");
		return;
	}
	load_config_to_text();
	document.getElementById("levels-storage-undo").classList.remove("hidden");
});

document.getElementById("levels-storage-reset").addEventListener("click", async function() {
	await checkAndSaveConfig({});
	load_config_to_text();
	document.getElementById("levels-storage-undo").classList.remove("hidden");
});

document.getElementById("levels-storage-undo").addEventListener("click", async function() {
	if (original_config !== undefined) {
		try {
			let current_config = await browser.storage.sync.get(null);
			await checkAndSaveConfig(original_config);
			load_config_to_text();
			original_config = current_config;
		}
		catch (e) {
			alert("An unexpected error during configuration restore. Please check and fix the configuration manually.");
		}
	}
});

window.addEventListener("DOMContentLoaded", function() {
	function appendElement(type, innerHtml) {
		let el = document.createElement(type);
		el.innerHTML = innerHtml;
		parent.appendChild(el);
		return el;
	}
	let parent = document.getElementById("builtin-jss-tweaks");
	for ([d, settings] of Object.entries(tweak_domains_builtin)) {
		appendElement("h4", d);
		appendElement("p", browser.i18n.getMessage("JSSBuiltinExceptionsAppliedTo",
			levels[settings.level_id].level_text) + ` <a href="${settings.explanation}">${settings.explanation}</a>`);
		var currentTweaksEl = appendElement("div", "");
		currentTweaksEl.classList.add("tweakgrid");
		let tweaksBusiness = Object.create(tweaks_gui);
		tweaksBusiness.get_current_tweaks = function() {
			return settings.tweaks;
		};
		tweaksBusiness.create_tweaks_html(currentTweaksEl);
	}
});

