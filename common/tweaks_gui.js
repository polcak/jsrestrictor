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

	create_group_descriptors: function (option_map) {
			let tweakEntries = Object.entries(this.get_current_tweaks()).map(([group_id, tlev_id]) => {
					let group = option_map[group_id];
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

	add_tweak_row: function (tweaksContainer, option_map, group_id, tlev_id, label, group) {
			let tweakRow = document.getElementById("tweak-row").content.cloneNode(true);
			tweakRow.querySelector("label").textContent = label;
			this.customize_tweak_row(tweakRow, group);

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
			tlevUI.addEventListener("change", () => { // We need arrow here so that this refers to an tweaks_gui object
				let desired_tweak = tlevUI.value;
				tlevUI.nextElementSibling.value = desired_tweak; // FIXME, display user-friendly description next to the range
				this.tweak_changed(group_id, desired_tweak);
				updateStatus(tlev_id);
			});
			tweaksContainer.appendChild(tweakRow);
		},

	create_tweaks_html: function (tweaksContainer) {
			tweaksContainer.innerHTML = "";
			tweaksContainer.appendChild(document.getElementById("tweak-head").content);
			let {option_map} = wrapping_groups;
			let tweakEntries = this.sort_group_descriptors(this.create_group_descriptors(option_map));

			for (let { group_id, tlev_id, label, group} of tweakEntries) {
				this.add_tweak_row(tweaksContainer, option_map, group_id, tlev_id, label, group);
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
