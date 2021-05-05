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

var safe_types = ["button", "color", "reset", "submit", "hidden"];
/**
 * Checks if an input element is of an unsafe type
 * Throws an exception if the type is unsafe
 * Safe types are considered to be button, color, reset, submit and hidden
 * @param element HTML element 
 */
function check_element(element) {
	if(element.nodeName == "INPUT") {
		if (!safe_types.includes(element.getAttribute("type"))){
			throw 'unsafe';
		}
	}
	for (let node in element.childNodes){
		check_element(element.childNodes[node]);
	}
}

/**
 * Checks whether given form is safe or not
 * checks if form uses GET method or has action attribute different than
 * the tab url then sends a message to formlock_common.js
 * This function is a modified version of the original function from Formlock
 * ^Forms are not highlighted as not to make JSR detectable
 * ^Criteria for unsafe forms was tweaked in order to allow search bars and such
 * @param curr_form form object
 */
function check_form(curr_form) {
	let susceptible = false;
	//Skip search bars
	if (curr_form.getAttribute("role") == "search") {
		return;
	}
	try {
		check_element(curr_form);
	} catch (error) {
		susceptible = true;
	}
	//No violation means that there are no inputs of worthy value
	if (!susceptible) {
		return;
	}
	curr_form.addEventListener("focusin", () => {
		let violation_msg = "";
		var current_url = get_root_domain(get_hostname(curr_form.getAttribute('action')));
	
		if (global_url !== current_url) {
			violation_msg += "Form submits to third party\n";
		}
		
		if (curr_form.method === "get") {
			violation_msg += "Form uses GET submition method";
		}
	
		if (violation_msg) {
			browser.runtime.sendMessage({msg : "ViolationFound", document_url : document.URL, action_url : current_url, violation : violation_msg});
		}
	});
}

for (var f = 0; f < document.forms.length; ++f) {
	let curr_form = document.forms[f];
	check_form(curr_form);
}

/**
 * Sends message to formlock_common.js to reallow form safety notifications on this tab
 */
window.addEventListener("beforeunload", () => {
	browser.runtime.sendMessage({msg : "ReallowNotifs"});
});
