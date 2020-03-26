//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2019  Martin Timko
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


if ((typeof chrome) !== "undefined") {
  var browser = chrome;
}

function escape(str)
{
	var map =
	{
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return str.replace(/[&<>"']/g, (c) =>  map[c]);
}

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

function show_domain_level(levelsEl, domain) {
	var displayedEl = document.getElementById(`dl-${escape(domain)}`);
	if (displayedEl !== null) {
		displayedEl.remove();
	}
	var fragment = document.createRange().createContextualFragment(`<li class="custom_domain_level" id="dl-${escape(domain)}" jsr_domain="${escape(domain)}">
			<span>
				${escape(domain)}
			</span>
			<select id="dl-change-${escape(domain)}"></select>
			<span id="li-exist-group-${escape(domain)}">
				<button id="overwrite-dl-${escape(domain)}">Overwrite</button>
				<button id="delete-dl-${escape(domain)}">Remove</button>
			</span>
			<span id="li-removed-group-${escape(domain)}" class="hidden">
				<button id="restore-dl-${escape(domain)}">Restore</button>
			</span>
		</li>`);
	levelsEl.appendChild(fragment);
	update_domain_level(document.getElementById(`dl-change-${escape(domain)}`), domains[domain].level_id);
	document.getElementById(`overwrite-dl-${escape(domain)}`).addEventListener("click", function(e) {
		e.preventDefault();
		let domainLevel = document.getElementById(`dl-change-${escape(domain)}`).value;
		domains[domain] = {
			level_id: domainLevel,
		}
		saveDomainLevels();
	});
	document.getElementById(`delete-dl-${escape(domain)}`).addEventListener("click", remove_domain.bind(null, domain));
	document.getElementById(`restore-dl-${escape(domain)}`).addEventListener("click", restore_domain.bind(null, domain, domains[domain]));
}

function insert_domain_levels() {
	// Insert all known levels to GUI
	var allDomainsElement = document.getElementById("domain-level-list");
	for (let domain in domains) {
		show_domain_level(allDomainsElement, domain);
	}
}

window.addEventListener("load", function() {
	if (!levels_initialised) {
		levels_updated_callbacks.push(insert_domain_levels);
	}
	else {
		insert_domain_levels();
	}
});

document.getElementById("add_domain").addEventListener("click", function (e) {
	e.preventDefault();
	let domainEl = document.getElementById("domain-text");
	let domain = domainEl.value;
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
		dlel.appendChild(document.createRange().createContextualFragment(`<option value="${escape(levelid)}">${escape(levels[levelid].level_text)}: ${escape(levels[levelid].level_description)}</option>`));
	};
	dlel.value = finalValue;
}
update_domain_level(document.getElementById("domain-level"));

document.getElementById("save-all-domain-levels").addEventListener("click", function (e) {
	e.preventDefault();
	Array.prototype.forEach.call(document.getElementsByClassName("undo"), (el) => el.remove());
	Array.prototype.forEach.call(document.getElementsByClassName("custom_domain_level"), function (el) {
		domains[el.attributes["jsr_domain"].value] = {
			level_id: el.getElementsByTagName("select")[0].value,
		};
	});
	saveDomainLevels();
});

document.getElementById("delete-all-domain-levels").addEventListener("click", function (e) {
	domains = {};
	saveDomainLevels();
	Array.from(document.getElementsByClassName("custom_domain_level")).forEach((el) => el.remove());
});
