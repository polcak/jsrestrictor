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

/**\file formlock_common.js
 * Background script for form locking
 * This script is a modified version of background.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

var lock_domains = [];
var blocked = [];
var backup = {};

var lock_tab = -1;
var unlock_url = "";
var unlock_msg = "";
var lock_form_id = -1;

var is_chrome = false;
if (browser === chrome) {
    is_chrome = true;
}

// Keeps Formlock setting for all visited sites
var FL_whitelist = new Object();

function sync_whitelist() {
	browser.storage.sync.get(["FL_whitelist"], function(result){
		if (result.FL_whitelist) {
			FL_whitelist = result.FL_whitelist;
		}
	});
}

sync_whitelist();

function update_settings(action, site) {
	if (action == "add_whitelisted") {
		if (FL_whitelist[site] != undefined){
			FL_whitelist[site] = true;
		}
		else {
			FL_whitelist[site] = true;
		}
	}
	else if (action == "remove_whitelisted") {
		if (FL_whitelist[site] != undefined){
			delete FL_whitelist[site];
		}
	}
	browser.storage.sync.set({"FL_whitelist": FL_whitelist});
}

function is_domain_whitelisted(domain) {
	domain = new URL(domain);
	domain = wwwRemove(domain.hostname);
	if (FL_whitelist[domain] == undefined) {
		return false;
	}
	else {
		if (FL_whitelist[domain] == true) {
			return true;
		}
		else {
			return false;
		}
	}
}

/**
 * Blocking of web requests
 * This function is a modified version of the original function from Formlock
 * ^Added tab based blocking
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

		current_domain = new URL(details.url);
		current_domain = wwwRemove(current_domain.hostname);

		if (is_domain_whitelisted(details.url)) {
			return {cancel : false};
		}

		for (let domain of lock_domains) {
			if (extractSubDomains(current_domain).includes(domain)) {
				return {cancel : false};
			}
		}

		if (details.url.indexOf("extension") === 0){
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
 */
browser.webRequest.onBeforeRequest.addListener(
	request_blocking,
	{urls: ["<all_urls>"]},
	["blocking"] 
);

/**
 * Refreshes the page to URL without queries and calls data restoration
 * This function is derived from click_handler() in the original
 * @param tab_url URL of the tab to be refreshed
 */
function unlock_form(tab_url) {
	// Remove LOCK
	unlock_msg = "Form unlocked. Third-party requests blocked " + blocked.length + ":\n";
	for (b in blocked) {
		unlock_msg += get_hostname(blocked[b]) + "\n";
	}
	browser.browserAction.setTitle({title: "Form locking"});
	unlock_url = tab_url.split("?")[0];
	clear_new_data();
}

/**
 * Backs up data and then limits communication to domain of the document and action url
 * This function is derived from click_handler() in the original
 * @param document_url URL of the document containing the form
 * @param action_url URL in the action attribute
 * @param tab_id ID of the locked tab
 */
function lock_form(document_url, action_url, tab_id) {
	browser.tabs.sendMessage(tab_id, {"msg": "BackupStorage"}, function(payload) {
		backup_cookies(document_url).then((saved_cookies) => {
			backup = payload.backup;
			backup.cookies = saved_cookies;

			started = (new Date()).getTime();
			// Page url and the form url
			var first = new URL(document_url);
			first = wwwRemove(first.hostname);
			var second = action_url;
			lock_tab = tab_id;
			lock_domains.push(first);
			if (!(extractSubDomains(first).includes(second))) {
				lock_domains.push(second);
			}
			browser.browserAction.setTitle({title: lock_domains.join("\n")})
			show_notification("Form safety", "Locked. Requests are allowed to only:\n" + lock_domains.join("\n"));  
		});
	});
}

function update_lock(document_url, action_url, form_id) {
	lock_form_id = form_id;
	// Page url and the form url
	var first = new URL(document_url);
	first = wwwRemove(first.hostname);
	var second = action_url;
	lock_domains.push(first);
	if (!(extractSubDomains(second).includes(first))) {
		lock_domains.push(second);
	}
}

var tabs_notified = [];

/**
 * UPDATES THE CONTEXT MENU WITH CURRENT FORM'S INFO
 * This function is a modified version of the original function from Formlock
 * ^shows notification when the content script form_check.js found a potentially
 * unsafe form
 */
 browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg === "ViolationFound") {
		let tab_level = getCurrentLevelJSON(request.document_url)[0];
		if (tab_level.formlock !== true) {
			return;
		}
		else {
			if (sender.tab.id != lock_tab) {
				if (is_domain_whitelisted(sender.tab.url)) {
					return;
				}
				lock_tab = sender.tab.id;
				lock_form_id = request.form_id;
				lock_form(request.document_url, request.action_url, sender.tab.id);
			}
			else {
				if (request.form_id != lock_form_id) {
					update_lock(request.document_url, request.action_url, request.form_id);
				}
			}
			if (!tabs_notified.includes(sender.tab.id)) {
				tabs_notified.push(sender.tab.id);
			}
			else {
				return;
			}
			let msg = `You've clicked on a potentially unsafe form.\n
Form safety violations are:\n${request.violation}`;
			show_notification("Form safety", msg);
		}
	}
	else if (request.msg === "ReallowNotifs") {
		if (tabs_notified.includes(sender.tab.id)) {
			const index = tabs_notified.indexOf(sender.tab.id);
			tabs_notified.splice(index, 1);
		}
	}
	// From popup.js
	else if (request.message == "formlock add whitelisted site") {
		update_settings("add_whitelisted", request.site, null);
	}
	else if (request.message == "formlock remove whitelisted site") {
		update_settings("remove_whitelisted", request.site, null);
	}
	else if (request.message == "are 3rd party requests blocked on this site?") {
		if (is_domain_whitelisted(request.site)) {
			sendResponse("no");
		}
		else {
			sendResponse("yes");
		}
	}
	// From options.js
	else if (request.message == "FL_whitelist updated") {
		sync_whitelist();
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
			//Chromium also blocks user opened tabs, therefore this message
            if (is_chrome){
                show_notification("Form security", 
                `Opening new tabs from the locked tab is disabled during form lock for security reasons
You can lift the lock by refreshing the page`);
            }
		}
	}
});

/**
 * Checks for page JSR level and injects code
 * @param tab_info Contains url of the tab
 * @param tab Original tab object, used because tab_info id caused errors
 */
function handle_tab(tab_info, tab) {
	let curr_level = getCurrentLevelJSON(tab_info.url)[0];
    if (curr_level.formlock !== true){
        //If user changed the level during lock then clear lock data to prevent blocking
        if (lock_domains.length > 0 && tab.tabId == lock_tab){
            lock_domains = [];
            blocked = [];
            backup = {};
        }
    }

	// Unlock form if user landed on a new page after submit or refreshed
	if (tab.tabId == lock_tab) {
		unlock_form(tab_info.url);
	}

    //Prevent needless injection attempts into irrelevant pages
    if(tab.url.indexOf("about\:") != -1 || tab.url === "about:blank" ||
        tab.url.indexOf("chrome\:\/\/") != -1){
        return;
    }
    
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
}

/** 
 * INTERCEPTS PAGE SCRIPTS ON A NEW URL LOADED
 * This function is a modified version of the original function from Formlock.
 * ^A check was added so that the scripts aren't injected into forbidden pages which would cause errors
 * ^JSR security level check in order to not inject pages on level 0
 */
 browser.webNavigation.onCompleted.addListener(function(tab) {
	//Do not inject when security level is 0
    if (is_chrome) {
        //Chrome
        browser.tabs.get(tab.tabId, (tab_info) => {
            handle_tab(tab_info, tab);
        });
    }
    else {
        //Firefox
        browser.tabs.get(tab.tabId).then((tab_info) => {
            handle_tab(tab_info, tab);
        }, (error_msg) => {
            console.log(error_msg)
        });
    }
});
