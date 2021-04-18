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
var blocked = [];
var backup = {};

/**
 * Blocking of web requests
 * Created separately so that the listener could be added and
 * removed during JSR level changes
 * @param details Page details passed by onBeforeRequest 
 * @returns \{cancel : false} if request 
 */
function request_blocking(details) {
	if (lock_domains.length > 0) {
		if (details.tabId != lock_tab){
			return {cancel : false};
		}
		var current_domain = get_root_domain(get_hostname(details.url));
		if (lock_domains.indexOf(current_domain) !== -1) {
			return {cancel : false};
		}

		if (details.url.indexOf("chrome-extension://") === 0){
			return {cancel : false};
		}
	
		if (!blocked.includes(details.url)){
			blocked.push(details.url);
		}
		return {cancel : true};
	}
	return {cancel : false};
}

/**
 * Blocks request to third party domains except for the lock domains
 * \todo change global blocking to per tab/frame based!
 */
browser.webRequest.onBeforeRequest.addListener(
	request_blocking,
	{urls: ["<all_urls>"]},
	["blocking"] 
);

var lock_tab = -1;
var unlock_url = "";
var unlock_msg = "";

/**
 * Backs up cookies for the locked domain
 * @param cookies_url URL to which the cookies should be related
 * @returns Promise which resolves to array of cookies
 */
function backup_cookies(cookies_url){
	return new Promise(
		function(resolve, reject){
			let cookie_backup = [];
			chrome.cookies.getAll({url : cookies_url}, (Cookies) => {
				//reduction because not all cookie parameters can be used in set()
				for (let cookie of Cookies){
					let reduced_cookie = {
						domain : cookie.domain,
						httpOnly : cookie.httpOnly,
						name : cookie.name,
						path : cookie.path,
						secure : cookie.secure,
						sameSite : cookie.sameSite,
						secure : cookie.secure,
						storeId : cookie.storeId,
						url : cookies_url,
						value : cookie.value
					}
					if (!cookie.session){
						reduced_cookie.expirationDate = cookie.expirationDate;
					}
					cookie_backup.push(reduced_cookie);
				}
				resolve(cookie_backup);
			});
		}
	);
}

/**
 * Restores cookies which were backed up on lock
 * @returns Promise which resolves after the restoration is done
 */
function restore_cookies(){
	return new Promise(
		function(resolve, reject){
			let cookies_restored = 0;
			if(backup.cookies.length == 0){
				resolve();
			}
			for (let cookie in backup.cookies){
				chrome.cookies.set(backup.cookies[cookie], () => {
					cookies_restored++;
					if(cookies_restored == backup.cookies.length){
						resolve();
					}
				});
			}
		}
	);
}

/**
 * Refreshes the tab on which a form was locked
 * Sends a restore message to data_backup.js with storages and indexed databases to be restored
 * then notifies the user about blocked requests to other domains
 */
function refresh_lock_tab(){
	restore_cookies().then(() => {
		browser.tabs.sendMessage(lock_tab, {"msg": "RestoreStorage", "data": backup}, () => {
			browser.tabs.update(lock_tab, {url: unlock_url}, (tab) => {
				started = null;
				show_notification("Form safety", unlock_msg); 
			});
		});
	});
}

/**
 * CLEARING STORAGES OF POTENTIAL LEAKS
 * This function is a modified version of the original function from Formlock.
 * ^Remove was changed to delete as few data from other domains as possible
 * ^Added data restoration message for the locked domain
 */
var started = null;
function clear_new_data() {   
	if (started !== null) {
		browser.browsingData.remove({
			"since": started,
			"origins": [`${unlock_url}`]
		  }, {
			"cacheStorage": true,
			"cookies": true,
			"fileSystems": true,
			"indexedDB": true,
			"localStorage": true,
			"serviceWorkers": true,
			"webSQL": true
		  }, () => {
			//clearing items which cannot be cleared with origins argument
			browser.browsingData.remove({
				"since": started
			}, {
				"passwords": true,
				"appcache": true,
				"cache": true,
				"downloads": true,
				"formData": true,
				"history": true,
				"pluginData": true
			}, refresh_lock_tab);
		  });
	}
}

/**
 * (1) Process the menu clicks
 * This function is a modified version of the original function from Formlock.
 * ^Backup of storage and cookies from locked page was added
 * \todo close new opened tabs? or tabs of the same domain? 
 */
var click_handler = function(info, tab) {
	var url = info.frameUrl ? info.frameUrl : info.pageUrl;
	
	// Explain the form risks option
	if (info.menu_item_id === "explainRisks") {   
		browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}, function(payload) {
			if (payload !== null) {
				var violation = "";

				var global_url = get_root_domain(get_hostname(tab.url));
				var current_url = get_root_domain(payload.domain);

				if (global_url !== current_url) violation += "> Third-party: " + current_url + "\n"; 
				if (payload.method === "get") violation += "> Submit with GET\n";

				if (violation === "") violation = "Looks safe.";
				
				show_notification("Form safety", violation);
			}
		});
	}
	
	// Set the lock for one domain allowed
	if (info.menuItemId === "lock") {	
		if (lock_domains.length > 0) {
			//Restore saved data
			// Remove LOCK
			unlock_msg = "Unlocked. Third-party requests blocked " + blocked.length + ":\n";
			for (b in blocked) {
				unlock_msg += get_hostname(blocked[b]) + "\n";
			}
			browser.browserAction.setTitle({title: "FormLock"});
			browser.contextMenus.update("lock", {"title": "Set Lock"});
			lock_domains = [];
			blocked = [];
			unlock_url = tab.url.split("?")[0]; 
			
			browser.tabs.executeScript(tab.id, {code: `window.location.href=${unlock_url};`}, function(tab) {
				clear_new_data(); 
			});
		}
		else {
			browser.tabs.sendMessage(tab.id, {"msg": "BackupStorage", "url": url}, function(payload) {
				backup_cookies(tab.url).then((saved_cookies) => {
					backup = payload.backup;
					backup.cookies = saved_cookies;
				});
			});
			// Set LOCK
			browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}, function(payload) {
				if (payload !== null) {					
					started = (new Date()).getTime();
					// Page url and the form url
					if (!payload){
						show_notification("Form security",
						"No form detected. If you are sure that one is present then try again on an input field");
						return;
					}
					var first = get_root_domain(get_hostname(tab.url));
					var second = get_root_domain(payload.domain);
					lock_tab = tab.id;
					lock_domains.push(first);
					if (first !== second) {
						lock_domains.push(second);
					}
					browser.browserAction.setTitle({title: lock_domains.join("\n")})
					show_notification("Form safety", "Locked. Requests are allowed to only:\n" + lock_domains.join("\n"));  
					browser.contextMenus.update("lock", {"title": "Remove Lock"});  
				}
			});
		}   
	}
}; 

var menu_created = true;
/**
 * Creates context menu for form locking
 */
function create_context_menu(){
	// (2) Register the menu items
	menu_created = true;
	let lock_text = "";
	if (lock_domains.length > 0){
		lock_text = "Remove Lock";
	}
	else {
		lock_text = "Set Lock";
	}
	browser.contextMenus.create({"title": "Form locking", "contexts": ["all"], "id": "Formstery"});
	browser.contextMenus.create({"title": "Submit method: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitMethod"});
	browser.contextMenus.create({"title": "Submits to: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitTo"});
	browser.contextMenus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
	browser.contextMenus.create({"title": "Explain sharing risks.", "contexts": ["all"], "parentId": "Formstery", "id": "explainRisks", "onclick": click_handler});
	browser.contextMenus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
	browser.contextMenus.create({"title": lock_text, "contexts": ["all"], "parentId": "Formstery", "id": "lock", "onclick": click_handler}); 
}

create_context_menu();

/**
 * UPDATES THE CONTEXT MENU WITH CURRENT FORM'S INFO
 * Also shows notification when the content script form_check.js found a potentially
 * unsafe form
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.req === "FLClickedForm") {	  
		browser.contextMenus.update("submitMethod", {"title": "Submit method: " + request.method});
		browser.contextMenus.update("submitTo", {"title": "Submits to: " + get_root_domain(request.domain)});
	}
	else if (request.msg === "ViolationFound") {
		let tab_level = getCurrentLevelJSON(request.url)[0];
		if (tab_level.formlock !== true) {
			return;
		}
		else {
			if (lock_domains.length === 0) {
				let msg = "We've found a potentially unsafe form on this page.\n"
				msg += "If you need to fill out any sensitive information then we suggest you use the form lock feature"
				msg += "(Right click on the form, Set lock, submit the form then Remove lock)";
				show_notification("Form safety", msg);
			}
		}
	}
});

/**
 * Checks security level associated with page and creates or removes context menu
 * Created so that context menu would be removed or added when user switched between
 * pages with different security levels
 * @param tab_url URL of the active tab
 */
 function decide_context_menu(tab_url){
	if (!tab_url){
		return;
	}
	let curr_level = getCurrentLevelJSON(tab_url)[0];
	if (curr_level.formlock !== true){
		if (menu_created){
			menu_created = false;
			browser.contextMenus.remove("Formstery", () => {});
		}
	}
	else {
		//recreate context menu and restart blocking
		if (!menu_created){
			create_context_menu();
			menu_created = true;
		}
	}
}

var injected_tabs = [];

/**
 * Listens to the change of active tab
 * Also if the tab is injected with form_check then sends message to check
 * vulnerability of forms
 */
browser.tabs.onActivated.addListener((tab) => {
	browser.tabs.query({active : true, currentWindow : true}, (active_tab) => {
		decide_context_menu(active_tab[0].url);
		if (injected_tabs.includes(active_tab[0].id)) {
			browser.tabs.sendMessage(active_tab[0].id, {msg : "CheckForms"});
		}
	});
});

//Removes tabId from injected pages if the user navigated elsewhere on injected tab
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	if (changeInfo.status === "loading"){
		if (injected_tabs.includes(tabId)) {
			const index = injected_tabs.indexOf(tabId);
			injected_tabs.splice(index, 1);
		}
	}
});

/**
 * Prevents lock tab from opening more tabs
 */
browser.tabs.onCreated.addListener((tab) => {
	if (lock_domains.length > 0){
		/* Prevent the locked tab from opening more tabs
		 * Also prevents user on lock_tab to open new tabs
		 */
		if (tab.openerTabId == lock_tab) {
			browser.tabs.remove(tab.id);
			show_notification("Form security", 
			"Opening new tabs from the locked tab is disabled during form lock for security reasons");
		}
	}
});


/** 
 * INTERCEPTS PAGE SCRIPTS ON A NEW URL LOADED
 * This function is a modified version of the original function from Formlock.
 * ^A check was added so that the scripts aren't injected into forbidden pages which would cause errors
 * ^JSR security level check in order to not inject pages on level 0
 */
browser.webNavigation.onCompleted.addListener(function(tab) {
	//Do not inject when security level is 0
	browser.tabs.get(tab.tabId, (tab_info) => {
		decide_context_menu(tab_info.url);
		let curr_level = getCurrentLevelJSON(tab_info.url)[0];
		if (curr_level.formlock !== true){
			//If user changed the level during lock then clear lock data to prevent blocking
			if (lock_domains.length > 0 && tab.tabId == lock_tab){
				lock_domains = [];
				blocked = [];
				backup = {};
			}
			//If tab was previously injected but lvl changed to 0
			if (injected_tabs.includes(tab.tabId)) {
				const index = injected_tabs.indexOf(tab.tabId);
				injected_tabs.splice(index, 1);
			}
			return;
		}
	
		//Prevent needless injection attempts into irrelevant pages
		if(tab.url.indexOf("chrome\:\/\/") != -1 || tab.url === "about:blank"){
			return;
		}

		//Do not inject the same tab repeatedly
		if (injected_tabs.includes(tab.tabId)) {
			return;
		}
		injected_tabs.push(tab.tabId);
		
		// (1) Monitoring mouse events
		browser.tabs.executeScript(tab.tabId, {file: "utils.js", allFrames: true}, function(Tab) {
			// UTILS ->
			browser.tabs.executeScript(tab.tabId, {
					allFrames: true,
					file: "mouse_track.js"
			});
			// <- UTILS
		});
		
		// (2) Highlighting risky forms
		browser.tabs.executeScript(tab.tabId, {file: "utils.js", allFrames: true}, function(Tab) {
			// UTILS ->
			browser.tabs.get(tab.tabId, function(Tab) { 
				// Passing the tab URL
				browser.tabs.executeScript(tab.tabId, { 
					allFrames: true,
					code: "var taburl = \"" + tab.url + "\";"
				}, 
				function() {
					// Main code
					browser.tabs.executeScript(tab.tabId, {
						allFrames: true,
						file: "form_check.js"
					});
				});
			}); 
			// <- UTILS
		});
	});
});
