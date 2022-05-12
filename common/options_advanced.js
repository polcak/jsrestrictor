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

function load_config_to_text() {
	browser.storage.sync.get(null).then(function (item) {
		document.getElementById("levels-storage-text").value = JSON.stringify(item, null, '\t');
	});
}

window.addEventListener("DOMContentLoaded", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-load").addEventListener("click", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-save").addEventListener("click", function() {
	try {
		checkAndSaveConfig(JSON.parse(document.getElementById("levels-storage-text").value));
	}
	catch (e) {
		alert("The configuration is not valid.");
		return;
	}
	load_config_to_text();
});
