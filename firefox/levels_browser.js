/** \file
 * \brief Modifies the levels.js data structures to accomodate for Firefox-specific configuration
 *
 *  \author Copyright (C) 2022  Libor Polcak
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

var modify_wrapping_groups = function() {
	wrapping_groups.groups.forEach(function (group) {
		if (group.name === "windowname") {
			group.description2.push(browser.i18n.getMessage("jssgroupPersistentIdentifierOfTheBrowserTabFirefox88"))
		}
		else if (group.name === "wasm") {
			group.params = [
				{
					short: browser.i18n.getMessage("jssgroupWASMDisabled"),
					description: browser.i18n.getMessage("jssgroupWASMDisabledDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupWASMEnabled"),
					description: browser.i18n.getMessage("jssgroupWASMEnabledDescription"),
					config: [1],
				},
			];
		}
	});
};
var modify_builtin_levels = function() {
	delete level_2.windowname;
	delete level_3.windowname;
}
