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

/**\file mouse_track.js
 * Mouse tracking for form selection and locking
 * This script is a modified version of mouse_track.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

if ((typeof browser) === "undefined") {
	var browser = chrome;
}

var clicked_element1 = null;
var clicked_element2 = null;

// listens to mouse clicks for form selection
document.addEventListener("mousedown", function(event) {
	// Right click
	if (event.button == 2) { 
		// Keep two copies
		clicked_element1 = event.target;
		clicked_element2 = event.target;
		
		var p = clicked_element1;
		while (p && p.tagName != "FORM") {	 
			p = p.parentElement;
		}
		
		// Active notification to prepare menu
		if (p != null) {
			var domain = get_hostname(p.getAttribute('action'));
			browser.runtime.sendMessage({req: "FLClickedForm", method: p.method, domain: domain});
		}
		else {
			browser.runtime.sendMessage({req: "FLClickedForm"});
		}
		
		clicked_element1 = null;
	}
}, true);

/**
 * Listens to messages from click_handler in formlock.js and responds with
 * submit method and domain of form to be locked  
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
	// Retrive the clicked form for locking
	if (request.msg == "FLGetClickedForm" && document.URL == request.url) {
		var p = clicked_element2;
		
		while (p && p.tagName != "FORM") {	 
			p = p.parentElement;
		}
		
		if (p != null) {
			var domain = get_hostname(p.getAttribute('action')); 
			sendResponse({method: p.method, domain: domain});
		}
		
		clicked_element2 = null;
	}
});

//Alerts user to any changes in browser's storage
browser.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
		  var storageChange = changes[key];
		  alert('Storage key "%s" in namespace "%s" changed. ' +
					  'Old value was "%s", new value is "%s".',
					  key,
					  namespace,
					  storageChange.oldValue,
					  storageChange.newValue);
		}
});
