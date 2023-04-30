/** \file
 * \brief JS code for the JS Shield tweak GUI
 *
 *  \author Copyright (C) 2022  Giorgio Maone
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

let tweaks_gui = {

	create_group_descriptors: function (group_map) {
			let tweakEntries = Object.entries(this.get_current_tweaks()).map(([group_id, tlev_id]) => {
					let group = group_map[group_id];
					let label = group.label || group.name;
					this.assign_custom_params(group);
					return { group_id, tlev_id, label, group, toString() { return this.label } };
				}
			);
			return tweakEntries;
		},

	sort_group_descriptors: function (tweakEntries) {
			return tweakEntries.sort((firstObj, secondObj) => this.cmp_groups(firstObj, secondObj));
		},

	add_tweak_row: function (tweaksContainer, group_map, group_id, tlev_id, label, group, no_default=false) {
			let tweakRow = document.getElementById("tweak-row").content.cloneNode(true);
			tweakRow.querySelector("label").textContent = label;
			this.customize_tweak_row(tweakRow, group);

			let tlevUI = tweakRow.querySelector(".tlev");
			tlevUI.max = group.params.length; // 0 (off) .. array length
			if (no_default) { // without 0 (off)
				tlevUI.max = tlevUI.max-1;
			}
			let status = tweakRow.querySelector(".status");
			let help = tweakRow.querySelector(".help");
			let explainer = tweakRow.querySelector(".explainer");
		  tweakRow.querySelector(".description").textContent = group.description;
			let more = tweakRow.querySelector(".more");
			let longDescription = group.description2;
			for (let line of longDescription) {
				more.appendChild(document.createElement("p")).textContent = line;
			}

			tlevUI.value = parseInt(tlev_id);
			let updateLevelInfo = function (changed) {
				let desired_tweak = parseInt(tlevUI.value);
				let showStatus = (l) => {
					tlevUI.nextElementSibling.value = l.short;
					status.innerHTML = `<strong>${l.description}</strong>`;
					if (l.description2) {
						for (let line of l.description2) {
							status.innerHTML += `<p>${line}</p>`;
						}
					}
				}
				if (no_default) {
					showStatus(group.params[desired_tweak]);
				}
				else {
					if (desired_tweak !== 0) {
						showStatus(group.params[desired_tweak - 1]);
					}
					else {
						showStatus({short:"Unprotected", description:"Unprotected"});
					}
				}
				if (changed) {
					this.tweak_changed(group_id, desired_tweak);
				}
			}.bind(this);
			updateLevelInfo();
			tlevUI.addEventListener("input", updateLevelInfo.bind(this, false));
			tlevUI.addEventListener("change", updateLevelInfo.bind(this, true));

			help.addEventListener("click", function(ev) {
				explainer.classList.toggle("hidden_descr");
				ev.preventDefault();
			});
			tweaksContainer.appendChild(tweakRow);
		},

	create_tweaks_html: function (tweaksContainer) {
			tweaksContainer.innerHTML = "";
			tweaksContainer.appendChild(document.getElementById("tweak-head").content);
			let {group_map} = wrapping_groups;
			let tweakEntries = this.sort_group_descriptors(this.create_group_descriptors(group_map));

			for (let { group_id, tlev_id, label, group} of tweakEntries) {
				this.add_tweak_row(tweaksContainer, group_map, group_id, tlev_id, label, group, group_id === "wasm");
			}
			document.body.classList.add("tweaking");
		},

	/**
	 * Return tweaks to be displayed.
	 */
	get_current_tweaks: function() {
		return {};
	},

	/**
	 * Redefine if you want to perform an action when the user changes tweaks
	 */
	tweak_changed: function(group_id, desired_tweak) {
	},

	/**
	 * Add custom parameters to this processed groups (called for each group)
	 *
	 * Redefined if you want to display dynamic values, such as number of calls on current page.
	 * You should use this value in modified customize_tweak_row() or cmp_groups().
	 * Otherwise, it will not have any effect.
	 */
	assign_custom_params: function(group) {
	},

	/**
	 * Display custom parameters on a row to user (called for each row, i.e. group)
	 */
	customize_tweak_row: function(tweakRow, group) {
	},

	/**
	 * Compare two groups
	 *
	 * The default implementation keeps the original positions. Note that Array.prototype.sort assigns
	 * items in a different order in Firefox and Chrome-based browsers.
	 *
	 * \return 0: No change in position.
	 */
	cmp_groups: function(firstGr, secondGr) {
		return 0;
	}
}
