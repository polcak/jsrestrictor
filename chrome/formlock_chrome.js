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

/**\file formlock_chrome.js
 * Chrome specific functions for formlock_common.js
 * This script is a modified version of background.js from Formlock
 * (https://github.com/ostarov/Formlock). The author Oleksii Starov has agreed
 * to it's usage in this project as long as he was mentioned in original files.
 */

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
 * Sends a restore messages to data_backup.js with storages and indexed databases to be restored
 * then notifies the user about blocked requests to other domains
 */
function refresh_lock_tab(){
	browser.tabs.sendMessage(lock_tab, {"msg": "RestoreDatabases", "indexed_DBs" : backup.indexed_DBs}, () => {
		browser.tabs.executeScript(lock_tab, {code: `window.location.href='${unlock_url}';`}, function(tab) {
			browser.tabs.update(lock_tab, {url: unlock_url}, (tab) => {
				restore_cookies().then(() => {
					browser.tabs.sendMessage(lock_tab, {"msg": "RestoreStorage", "local": backup.local, "session": backup.session}, () => {
						started = null;
						show_notification("Form safety", unlock_msg);
						lock_tab = -1;
						lock_domains = [];
						blocked = [];
						refreshed = false;
					});
				});
			});
		});
	});
}

var started = null;
/**
 * CLEARING STORAGES OF POTENTIAL LEAKS
 * This function is a modified version of the original function from Formlock.
 * ^Remove was changed to delete as few data from other domains as possible
 * ^Added data restoration message for the locked domain
 */
function clear_new_data() {
	if (started !== null) {
		browser.browsingData.remove({
			"since": started
		  }, {
			"cacheStorage": true,
			"cookies": true,
			"fileSystems": true,
			"indexedDB": true,
			"localStorage": true,
			"serviceWorkers": true,
			"webSQL": true,
			"passwords": true,
			"appcache": true,
			"cache": true,
			"downloads": true,
			"formData": true,
			"history": true,
			"pluginData": true
		  },refresh_lock_tab);
	}
}
