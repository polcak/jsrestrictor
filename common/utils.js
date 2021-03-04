//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Matyáš Szabó
//
//  Derived from Formlock
//  Copyright (C) 2016  Oleksii Starov
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

/**\file utils.js
 * Helper functions for form locking
 * This script is a modified version of utils.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

var get_hostname = function(url) {
	var a = document.createElement('a');
	a.href = url;
	return a.hostname;
}

var get_root_domain = function(hostname) {
	if (hostname == undefined || hostname == null || hostname == "") return "(empty)";  
	var arr = hostname.split('.');
	if (arr.length > 1) {
		return arr[arr.length-2] + '.' + arr[arr.length-1];
	}
	else {
		return hostname;
	}
}
