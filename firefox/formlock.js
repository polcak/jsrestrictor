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

/**\file formlock.js
 * Background script for form locking
 * This script is a modified version of background.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

var lock_domains = [];
//var lockTab = null;
var blocked = [];

/**
 * Blocks request to third party domains except for the lock domains
 * \todo change global blocking to per tab/frame based!
 * \todo do not push urls that are already in the list
 */
browser.webRequest.onBeforeRequest.addListener(
	function(details) {
		var f_cancel = false;
		if (lock_domains.length > 0) {
			f_cancel = true;
			var current_domain = get_root_domain(get_hostname(details.url));
			if (lock_domains.indexOf(current_domain) !== -1) {
				f_cancel = false;
			}
		
			if (f_cancel) {
				blocked.push(details.url);
			}
		}
		return {cancel: f_cancel};
	},
	{urls: ["<all_urls>"]},
	["blocking"] 
);

var started = null;

/**
 * CLEARING STORAGES OF POTENTIAL LEAKS
 * @param callback function which refreshes the page
 * This function is a modified version of the original function from Formlock
 * ^Changed items in the list to match:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/DataTypeSet
 * ^Changed the code to handle the returned promise in Firefox version
 */
function clear_new_data(callback) {   
	if (started !== null) {
		browser.browsingData.remove({
			since: started
		  }, {
			cache: true,
			cookies: true,
			downloads: true,
			formData: true,
			history: true,
			indexedDB: true,
			pluginData: true,
			passwords: true,
			serverBoundCertificates: true,
			serviceWorkers: true
		  }).then(() => {
				//firefox doesn't support removing localStorage using since other than 0
				browser.browsingData.remove({
					since: 0
				},{
					localStorage: true
				});	
			  	callback();
			}, (error) => {
			  console.error(error);
		  });
	}
}

/**
 * (1) Process the menu clicks
 * \todo close new opened tabs? or tabs of the same domain?
 * This function is a modified version of the original function from Formlock
 * ^Changed message sending to be more on par with Mozilla documentation
 * ^Replaced alerts with notifications because Firefox doesn't allow alert in bg scripts 
 */
function click_handler(info, tab) {
	var url = info.frameUrl ? info.frameUrl : info.pageUrl;
	
	// Explain the form risks option
	if (info.menu_item_id === "explainRisks") {   
		browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}).then(payload => {
			if (payload !== null) {
				var violation = "";

				var global_url = get_root_domain(get_hostname(tab.url));
				var current_url = get_root_domain(payload.domain);

				if (global_url !== current_url) violation += "> Submits to third-party: " + current_url + "\n"; 
				if (payload.method === "get") violation += "> Submits with GET\n";

				if (violation === "") violation = "This form appears to be safe";
				
				browser.notifications.create({
					"type": "basic",
					"iconUrl": browser.extension.getURL("img/icon-48.png"),
					"title": "Form safety info:",
					"message": `${violation}`
				});
			}
		});
	}
	
	// Set the lock for one domain allowed
	if (info.menuItemId === "lock") {	
		if (lock_domains.length > 0) {
			// Remove LOCK
			var msg = "Form unlocked. Third-party requests blocked " + blocked.length + ":\n";
			for (b in blocked) {
				msg += get_hostname(blocked[b]) + "\n";
			}
			browser.browserAction.setTitle({title: "Form locking"});
			browser.menus.update("lock", {"title": "Set LOCK"});
			lock_domains = [];
			blocked = [];				
			var old_url = tab.url.split("?")[0]; 
			browser.tabs.executeScript(tab.id, {code: `window.location.href='about:blank';`}, function(tab) {
				var callback = function () {
					browser.tabs.update(tab.id, {url: old_url});
					started = null;
					browser.notifications.create({
						"type": "basic",
						"iconUrl": browser.extension.getURL("img/icon-48.png"),
						"title": "Form safety info:",
						"message": `${msg}`
					}); 
				};
				clear_new_data(callback);  
			});			
		}
		else {
			// Set LOCK
			browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}).then(payload=> {
				if (payload !== null) {					
					started = (new Date()).getTime();
					// Page url and the form url
					var first = get_root_domain(get_hostname(tab.url));
					var second = get_root_domain(payload.domain);
					lock_domains.push(first);
					if (first !== second) {
						lock_domains.push(second);
					}
					browser.browserAction.setTitle({title: lock_domains.join("\n")})
					browser.notifications.create({
						"type": "basic",
						"iconUrl": browser.extension.getURL("img/icon-48.png"),
						"title": "Form safety info:",
						"message": `Locked. Requests are allowed only to:\n ${lock_domains}\n`
					});
					browser.menus.update("lock", {"title": "Remove LOCK"});  
				}
			});
		}   
	}
};

// (2) Register the menu items
browser.menus.create({"title": "Form locking", "contexts": ["all"], "id": "Formstery"});
browser.menus.create({"title": "Submit method: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitMethod"});
browser.menus.create({"title": "Submits to: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitTo"});
browser.menus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
browser.menus.create({"title": "Explain sharing risks.", "contexts": ["all"], "parentId": "Formstery", "id": "explainRisks", "onclick": click_handler});
browser.menus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
browser.menus.create({"title": "Set LOCK", "contexts": ["all"], "parentId": "Formstery", "id": "lock", "onclick": click_handler}); 

/**
 * UPDATES THE CONTEXT MENU WITH CURRENT FORM'S INFO
 * \todo consider reliability and usability of this approach!
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.req === "FLClickedForm") {	  
		browser.menus.update("submitMethod", {"title": "Submit method: " + request.method});
		browser.menus.update("submitTo", {"title": "Submits to: " + get_root_domain(request.domain)});
	}
});

/** 
 * INTERCEPTS PAGE SCRIPTS ON A NEW URL LOADED
 * This function is a modified version of the original function from Formlock
 * A check was added so that the scripts aren't injected into forbidden pages which would cause errors
 */
browser.webNavigation.onCompleted.addListener(function(o) {
	//Prevent needless injection attempts into irrelevant pages
	if(o.url.indexOf("chrome\:\/\/") != -1 || o.url === "about:blank"){
		return;
	}
	
	// (1) Monitoring mouse events
	browser.tabs.executeScript(o.tabId, {file: "utils.js", allFrames: true}, function(tab) {
		// UTILS ->
		browser.tabs.executeScript(o.tabId, {
				allFrames: true,
				file: "mouse_track.js"
		});
		// <- UTILS
	});
	
	// (2) Highlighting risky forms
	browser.tabs.executeScript(o.tabId, {file: "utils.js", allFrames: true}, function(tab) {
		// UTILS ->
		browser.tabs.get(o.tabId, function(tab) { 
			// Passing the tab URL
			browser.tabs.executeScript(o.tabId, { 
				allFrames: true,
				code: "var taburl = \"" + tab.url + "\";"
			}, 
			function() {
				// Main code
				browser.tabs.executeScript(o.tabId, {
					allFrames: true,
					file: "form_check.js"
				});
			});
		}); 
		// <- UTILS
	});
});
