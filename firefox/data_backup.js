//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Matyáš Szabó
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

/**\file data_backup.js
 * Backup of pre-lock data to be used for restoration after form unlock
 * This file is a lighter version of it's Chrome countepart because Firefox doesn't support
 * .databases() method which would reveal database names for backup
 * \see https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases
 */

/**
 * Saves data from storages and cookies in key-value pairs into a JSON object
 * @returns object containing JSON with storages and cookies
 */
function backup_storages(){
	let local = {};
	let session = {};
	const local_keys = Object.keys(localStorage);
	for (let key of local_keys) {
    	local[key] = `${localStorage.getItem(key)}`;
	}
	const session_Keys = Object.keys(sessionStorage);
	for (let key of session_Keys){
		session[key] = `${sessionStorage.getItem(key)}`
	}
	return ({local, session});
}

/**
 * Restores values saved on start of lock
 * @param data JSON with data to be restored, includes storages, cookies and indexed databases
 */
function restore_data(data){
	//Restoration of pre-lock items
	for (let key in data.local){
		localStorage.setItem(key, data.local[key]);
	}
	for (let key in data.session){
		sessionStorage.setItem(key, data.session[key]);
	}
}

/**
 * Listens to messages from click_handler in formlock.js and responds either with
 * submit method and domain of form to be locked or with stored data to be backed
 * up
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
    if (request.msg == "BackupStorage" && document.URL == request.url) {
        let data = backup_storages();
		sendResponse({backup: data});
    }
    else if (request.msg == "RestoreStorage") {
        restore_data(request.data)
        sendResponse();
    }
});
