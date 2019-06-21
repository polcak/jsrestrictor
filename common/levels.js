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

// levels of protection

var level_0_time_precision = 1;
var level_0 = {
	"level_text": "0",
	"wrappers": [
		["CanvasRenderingContext2D.prototype.getImageData"],
		["HTMLCanvasElement.prototype.toBlob"],
		["HTMLCanvasElement.prototype.toDataURL"],
		["Performance.prototype.now", level_0_time_precision],
		["performance.getEntries", level_0_time_precision],
		["performance.getEntriesByName", level_0_time_precision],
		["performance.getEntriesByType", level_0_time_precision],
		["window.Date", level_0_time_precision],
		["window.XMLHttpRequest", false, true],
	]
}

var level_1 = level_0;
var level_2 = level_0;
var level_3 = level_0;

//
// default extension_settings_data setting. used on install
var extension_settings_data = level_0;

// Level aliases
const L0 = 0;
const L1 = 1;
const L2 = 2;
const L3 = 3;
const LC = 4;	// custom
const LD = 5;	// default

var levels = [level_0, level_1, level_2, level_3]

browser.storage.sync.get(null, function (res) {
	var custom_level = res.extension_settings_data;
	custom_level["level_text"] = "C";
	levels[LC] = custom_level;
});

function getCurrentLevelJSON() {
	var level = 0; // FIXME get level
	return levels[level];
}
