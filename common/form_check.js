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

/**\file form_check.js
 * Evaluates whether forms on the page are potentially unsafe or not
 * This script is a modified version of form_check.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

// Using global URL of the current tab
var global_url = get_root_domain(get_hostname(taburl));

// Iterate over all forms
for (var f = 0; f < document.forms.length; ++f) {

	var current_url = get_root_domain(get_hostname(document.forms[f].getAttribute('action')));

	var violation = "";
	
	if (global_url !== current_url) {
		violation += "> Third-party: " + current_url + "\n";
	}
	
	if (document.forms[f].method === "get") {
		violation += "> Submit with GET\n";
	}
	/**
	 * If violations were found then colour the border red
	 * This will be changed to notifications in future commits
	 */
	if (violation !== "") {   
		document.forms[f].style.border = "medium solid red"; 
	}
}
