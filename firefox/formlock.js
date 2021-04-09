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

var lock_tab = 0;
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
			browser.cookies.getAll({url : cookies_url}).then((Cookies) => {
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
					if (cookie.firstPartyIsolate){
						reduced_cookie.firstPartyIsolate = cookie.firstPartyIsolate;
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
			if (backup.cookies.length == 0){
				resolve();
			}
			for (let cookie in backup.cookies){
				browser.cookies.set(backup.cookies[cookie]).then(() => {
					cookies_restored++;
					if(cookies_restored == backup.cookies.length){
						resolve();
					}
				});
			}
		}
	);
}

var started = null;

/**
 * Sends a restore message to data_backup.js with storages to be restored
 * then notifies the user about blocked requests to other domains
 */
function refresh_lock_tab() {
	browser.tabs.sendMessage(lock_tab, {"msg": "RestoreStorage", "data": backup}, () => {
		restore_cookies().then(() => {
			started = null;
			show_notification("Form safety", unlock_msg); 
		});
	});
};

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
			downloads: true,
			formData: true,
			history: true,
			indexedDB: true,
			pluginData: true,
			passwords: true,
			serverBoundCertificates: true,
			serviceWorkers: true
		  }).then(() => {
				/* Firefox doesn't support removing localStorage using since other than 0
				 * Added cookies too here because we are backing them up anyway
				 */
				let url = new URL(unlock_url);
				browser.browsingData.remove({
					since: 0,
					hostnames : [url.hostname] 
				},{
					localStorage: true,
					cookies: true
				});	
			  	refresh_lock_tab();
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
			unlock_msg = "Form unlocked. Third-party requests blocked " + blocked.length + ":\n";
			for (b in blocked) {
				unlock_msg += get_hostname(blocked[b]) + "\n";
			}
			browser.browserAction.setTitle({title: "Form locking"});
			browser.menus.update("lock", {"title": "Set Lock"});
			lock_domains = [];
			blocked = [];				
			unlock_url = tab.url.split("?")[0]; 
			browser.tabs.executeScript(tab.id, {code: `window.location.href='${unlock_url}';`}, function(tab) {
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
			browser.tabs.sendMessage(tab.id, {"msg": "FLGetClickedForm", "url": url}).then((payload) => {
				if (payload !== null) {
					started = (new Date()).getTime();
					// Page url and the form url
					var first = get_root_domain(get_hostname(tab.url));
					var second = get_root_domain(payload.domain);
					lock_tab = tab.id;
					lock_domains.push(first);
					if (first !== second) {
						lock_domains.push(second);
					}
					browser.browserAction.setTitle({title: lock_domains.join("\n")})
					show_notification("Form safety", "Locked. Requests are allowed to only:\n" + lock_domains.join("\n"));  
					browser.menus.update("lock", {"title": "Remove Lock"});  
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
	browser.menus.create({"title": "Form locking", "contexts": ["all"], "id": "Formstery"});
	browser.menus.create({"title": "Submit method: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitMethod"});
	browser.menus.create({"title": "Submits to: undefined", "contexts": ["all"], "parentId": "Formstery", id: "submitTo"});
	browser.menus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
	browser.menus.create({"title": "Explain sharing risks.", "contexts": ["all"], "parentId": "Formstery", "id": "explainRisks", "onclick": click_handler});
	browser.menus.create({"type": "separator", "contexts": ["all"], "parentId": "Formstery"});
	browser.menus.create({"title": lock_text, "contexts": ["all"], "parentId": "Formstery", "id": "lock", "onclick": click_handler}); 
}

create_context_menu();

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
	if (curr_level["level_id"] === "0"){
		if (menu_created){
			menu_created = false;
			browser.menus.remove("Formstery", () => {});
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

browser.tabs.onActivated.addListener((tab) => {
	browser.tabs.query({active : true, currentWindow : true}).then((active_tab) => {
		decide_context_menu(active_tab[0].url);
	});
});

/** 
 * INTERCEPTS PAGE SCRIPTS ON A NEW URL LOADED
 * This function is a modified version of the original function from Formlock
 * A check was added so that the scripts aren't injected into forbidden pages which would cause errors
 */
 browser.webNavigation.onCompleted.addListener(function(o) {
	//Do not inject when security level is 0
	decide_context_menu(o.url);
	let curr_level = getCurrentLevelJSON(o.url)[0];
	if (curr_level["level_id"] === "0"){
		//If user changed the level during lock then clear lock data to prevent blocking
		if (lock_domains.length > 0 && o.tabId == lock_tab){
			lock_domains = [];
			blocked = [];
			backup = {};
		}
		return;
	}

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
