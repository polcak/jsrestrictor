/** \file
 * \brief Code that handles domain-specific levels handling in options
 *
 *  \author Copyright (C) 2019-2022  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
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


function restore_domain(domain, settings) {
	domains[domain] = settings;
	saveDomainLevels();
	var existPref = document.getElementById(`li-exist-group-${escape(domain)}`);
	existPref.classList.remove("hidden");
	var removedPref = document.getElementById(`li-removed-group-${escape(domain)}`);
	removedPref.classList.add("hidden");
	var lielem = document.getElementById(`dl-${escape(domain)}`);
	lielem.classList.remove("undo");
}

function remove_domain(domain) {
	// See https://alistapart.com/article/neveruseawarning/
	var existPref = document.getElementById(`li-exist-group-${escape(domain)}`);
	existPref.classList.add("hidden");
	var removedPref = document.getElementById(`li-removed-group-${escape(domain)}`);
	removedPref.classList.remove("hidden");
	var lielem = document.getElementById(`dl-${escape(domain)}`);
	lielem.classList.add("undo");
	delete domains[domain];
	saveDomainLevels();
}

function show_restore_domain_level(levelLiEl, domain) {
	let level = Object.assign({}, levels[domains[domain].restore]);
	if (domains[domain].restore_tweaks) {
		level.tweaks = domains[domain].restore_tweaks;
	}
	if (!level) {
		return false;
	}
	var fragment = document.createRange().createContextualFragment(`
			<span class="domain">
				${escape(domain)}
			</span>
			<span>JavaScript shield disabled</span>
			<button id="enable-jss-${escape(domain)}">Restore level ${escape(level.level_id)}</button>`);
	levelLiEl.appendChild(fragment);
	document.getElementById(`enable-jss-${escape(domain)}`).addEventListener("click", function(e) {
		e.preventDefault();
		domains[domain] = level;
		levelLiEl.innerHTML = "";
		saveDomainLevels();
		show_domain_level_custom_level(levelLiEl, domain);
	});
	return true;
}

function show_domain_level(levelsEl, domain) {
	var displayedEl = document.getElementById(`dl-${escape(domain)}`);
	if (displayedEl !== null) {
		displayedEl.remove();
	}
	var fragment = document.createRange().createContextualFragment(`<li class="custom_domain_level" id="dl-${escape(domain)}" jsr_domain="${escape(domain)}">
		</li>`);
	levelsEl.appendChild(fragment);
	let levelLiEl = document.getElementById(`dl-${escape(domain)}`);
	if (domains[domain].restore) {
		if (show_restore_domain_level(levelLiEl, domain)) {
			return;
		}
		else {
			domains[domain] = level_0;
			saveDomainLevels();
		}
	}
	show_domain_level_custom_level(levelLiEl, domain);
}

function show_domain_level_custom_level(levelLiEl, domain) {
	let tweaks = Object.assign({}, domains[domain].tweaks || {});
	var fragment = document.createRange().createContextualFragment(`
			<span class="domain">
				${escape(domain)}
			</span>
			<select id="dl-change-${escape(domain)}"></select>
			<span id="tweaks-text-${escape(domain)}">tweaked</span>
			<button id="show-tweaks-${escape(domain)}" class="help">⤵</button>
			<span id="li-exist-group-${escape(domain)}">
				<button id="overwrite-dl-${escape(domain)}">Save</button>
				<button id="delete-dl-${escape(domain)}">Remove</button>
			</span>
			<span id="li-removed-group-${escape(domain)}" class="hidden">
				<button id="restore-dl-${escape(domain)}">Restore</button>
			</span>
			<div class="tweakgrid" id="tweaks-${escape(domain)}"></div>`);
	levelLiEl.appendChild(fragment);
	let levelSelectEl = document.getElementById(`dl-change-${escape(domain)}`);
	update_domain_level(levelSelectEl, domains[domain].level_id);
	document.getElementById(`overwrite-dl-${escape(domain)}`).addEventListener("click", function(e) {
		e.preventDefault();
		let domainLevel = levelSelectEl.value;
		domains[domain] = {
			level_id: domainLevel,
		}
		if (Object.keys(tweaks).length > 0) {
			domains[domain].tweaks = tweaks;
		}
		saveDomainLevels();
	});
	document.getElementById(`delete-dl-${escape(domain)}`).addEventListener("click", remove_domain.bind(null, domain));
	document.getElementById(`restore-dl-${escape(domain)}`).addEventListener("click", restore_domain.bind(null, domain, domains[domain]));
	let tweaksEl = document.getElementById(`tweaks-${escape(domain)}`);
	let tweaksTextEl = document.getElementById(`tweaks-text-${escape(domain)}`);
	let tweaksBusiness = Object.create(tweaks_gui);
	tweaksBusiness.get_current_tweaks = function() {
		return getTweaksForLevel(domains[domain].level_id, tweaks);
	};
	tweaksBusiness.tweak_changed = function(group_id, desired_tweak) {
		if ((desired_tweak === levels[levelSelectEl.value][group_id]) || (desired_tweak === 0 && levels[levelSelectEl.value][group_id] === undefined)) {
			delete tweaks[group_id];
		}
		else {
			tweaks[group_id] = desired_tweak;
		}
		if (Object.keys(tweaks).length > 0) {
			domains[domain].tweaks = tweaks;
			tweaksTextEl.classList.remove("hidden_descr");
		}
		else {
			tweaksTextEl.classList.add("hidden_descr");
		}
	}
	tweaksBusiness.create_tweaks_html(tweaksEl);
	if (Object.keys(tweaks).length == 0) {
		tweaksEl.classList.add("hidden_descr");
		tweaksTextEl.classList.add("hidden_descr");
	}
	levelSelectEl.addEventListener("change", function(e) {
		let oldtweaks = domains[domain].tweaks || {};
		domains[domain] = {
			level_id: this.value,
		}
		if (Object.keys(oldtweaks).length > 0) {
			domains[domain].tweaks = oldtweaks;
		}
		tweaksBusiness.create_tweaks_html(tweaksEl);
	});
	document.getElementById(`show-tweaks-${escape(domain)}`).addEventListener("click", function(ev) {
		tweaksEl.classList.toggle("hidden_descr");
		ev.preventDefault();
	});
}

function insert_domain_levels() {
	// Insert all known levels to GUI
	var allDomainsElement = document.getElementById("domain-level-list");
	for (let domain in domains) {
		if (domain === escape(domain)) {
			// Do not display invalid domains inserted before https://pagure.io/JShelter/webextension/issue/45 fix
			// Note that an invalid domain can be inserted through advanced options
			show_domain_level(allDomainsElement, domain);
		}
		else {
			console.error("Invalid domain in configuration: " + domain);
		}
	}
}

window.addEventListener("load", function() {
	if (!levels_initialised) {
		levels_updated_callbacks.push(insert_domain_levels);
		levels_updated_callbacks.push(update_domain_level.bind(null, document.getElementById("domain-level")));
	}
	else {
		insert_domain_levels();
		update_domain_level(document.getElementById("domain-level"));
	}
});

document.getElementById("add_domain").addEventListener("click", function (e) {
	e.preventDefault();
	let domainEl = document.getElementById("domain-text");
	let domain = domainEl.value;
	if (escape(domain) !== domain) {
		alert("Unsupported domain " + domain);
		return;
	}
	let domainLevel = document.getElementById("domain-level");
	if (domain in domains) {
		let ok = confirm(`Settings for domain ${domain} already exists and will be overriden.`);
		if (!ok) {
			return;
		}
	}
	domains[domain] = {
		level_id: domainLevel.value,
	}
	saveDomainLevels();
	domainEl.value = "";
	var allDomainsElement = document.getElementById("domain-level-list");
	show_domain_level(allDomainsElement, domain);
});

function update_domain_level(dlel, set_value) {
	var finalValue = set_value || dlel.value;
	dlel.textContent = "";
	for (let levelid in levels) {
		let descr = levels[levelid].level_description;
		dlel.appendChild(document.createRange().createContextualFragment(`<option value="${escape(levelid)}">${escape(levels[levelid].level_text)}: ${escape(create_short_text(descr, 50))}</option>`));
	};
	dlel.value = finalValue;
}

document.getElementById("save-all-domain-levels").addEventListener("click", function (e) {
	e.preventDefault();
	Array.prototype.forEach.call(document.getElementsByClassName("undo"), (el) => el.remove());
	Array.prototype.forEach.call(document.getElementsByClassName("custom_domain_level"), function (el) {
		let new_val = el.getElementsByTagName("select")[0].value;
		domains[el.attributes["jsr_domain"].value].level_id = new_val;
	});
	saveDomainLevels();
});

document.getElementById("delete-all-domain-levels").addEventListener("click", function (e) {
	domains = {};
	saveDomainLevels();
	Array.from(document.getElementsByClassName("custom_domain_level")).forEach((el) => el.remove());
});
