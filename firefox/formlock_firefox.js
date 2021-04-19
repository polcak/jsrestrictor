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

/**\file formlock_firefox.js
 * Firefox specific functions for formlock_common.js
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
