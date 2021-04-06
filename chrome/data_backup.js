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
 * Currently supports storages and Indexeddb restoration
 */

/**
 * Fetches all keys and their values from given store using a cursor
 * @param object_store IDBObjectStore instance of store to be backed up
 * @returns Promise which resolves to array of all items in store including keys or rejects on error
 */
 function get_store_contents(object_store){
	return new Promise(
		function(resolve, reject){
			let contents = [];
			let request = object_store.openCursor();

			request.onerror = (event) => {
				reject();
			}

			request.onsuccess = (event) => {
				let cursor = event.target.result;
				if(cursor) {
					contents.push({prim_key: cursor.primaryKey, value: cursor.value});
					cursor.continue();
				}
				else{
					resolve(contents);
				}
			}
		}
	);
}

//Flag to note a failure during database operations
var db_fail = false;

/**
 * Tries to load contents of a given database for later restoration
 * @param database a list with databases' name and version - obtained by using .databases()
 * @returns Promise which resolves to arrays representing object stores and their values
 * \todo save indexes
 */
function load_db_contents(database){
	return new Promise(
		function(resolve, reject){
			let db_content = [];
			let db_request = indexedDB.open(database.name, database.version);

			db_request.onerror = () => {
				reject();
			}

			db_request.onsuccess = () => {
				let db = db_request.result;

				db.onversionchange = () => {
					db.close();
				}
                //Number of processed stores
				let counter = 0;
				for (let store_name of db.objectStoreNames){
					let transaction = db.transaction(store_name, "readonly");
					let object_store = transaction.objectStore(store_name);
					//Backup indexes
					let indexes_arr = [];
					for (let index_name of object_store.indexNames){
						let index = object_store.index(index_name);
						indexes_arr.push({name : index_name, unique : index.unique, path : index.keyPath, multi_entry : index.multiEntry});
					}
					//backup store contents
					get_store_contents(object_store).then((store_content) => {
						db_content.push({name : store_name, content : store_content, auto_incr : object_store.autoIncrement, key_path : object_store.keyPath,
										 indexes : indexes_arr});
						counter++;
                        //Wait untill all stores were loaded
						if(counter == db.objectStoreNames.length){
							db.close();
							resolve(db_content);
						}
					}, () => {
                        //Continue with backup, but note the load failure
                        db_fail = true;
						counter++;
					});
				}
			}
		}
	);
}

/**
 * Loads data of all indexed databases
 * Currently only available in Chrome because Firefox doesn't support .databases()
 * \see https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases
 * @returns JSON object with databases and their object stores
 */
async function backup_databases(){
    db_fail = false;
	let index_DBs = [];
	let databases = await indexedDB.databases();
	for (let database of databases){
		await load_db_contents(database).then((content) => {
			index_DBs.push({name : database.name, version: database.version, stores: content});
        } , () => {
			//Failed to open this database, continue with others
			db_fail = true;
		});
	}
    if(db_fail){
        show_notification("Data restoration" ,"Failures occured during data backup.\nData after unlock may be inconsistent.");
    }
	return index_DBs;
}

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
 * Uses data saved on lock to restore the store's contents
 * @param store JSON with data saved on lock like store contents and store properties
 * @param obj_store IDBObjectStore instance
 * @returns Promise which resolves if no error occured or rejects otherwise
 */
function restore_store(store, obj_store){
	return new Promise(
		function(resolve, reject){
			var items_inserted = 0;
            let insert_failed = false;
			if(store.auto_incr){
				for(let item of store.content){
					let request = obj_store.put(item.value, item.prim_key);
					request.onsuccess = () => {
						items_inserted++;
						if(items_inserted == store.content.length){
                            if(insert_failed){
                                return reject();
                            }
							return resolve();
						}
					}
					request.onerror = () => {
						items_inserted++;
						insert_failed = true;
						if(items_inserted == store.content.length){
                            if(insert_failed){
                                return reject();
                            }
							return resolve();
						}
					}
				}
			}
			else{
				for(let item of store.content){
					let request = obj_store.put(item.value);
					request.onsuccess = () => {
						items_inserted++;
						if(items_inserted == store.content.length){
                            if(insert_failed){
                                return reject();
                            }
							return resolve();
						}
					}
					request.onerror = () => {
						items_inserted++;
                        insert_failed = true;
						if(items_inserted == store.content.length){
                            if(insert_failed){
                                return reject();
                            }
							return resolve();
						}
					}
				}
			}	
		}
	);
}

/**
 * Opens a new database with the same name and version as original was
 * @param database JSON with info about database to be restored
 * @returns Promise which resolves if everything went right or rejects with error message
 */
function restore_db(database){
	return new Promise(
		function(resolve, reject){
            let restore_fail = false;
			var db_request = indexedDB.open(database.name, database.version);

			db_request.onerror = () => {
                console.log(`Failed to open database: ${database.name} during restoration`);
				reject();
			}

			db_request.onblocked = (event) => {
				console.log(`database ${database.name} is blocked, preventing restoration`);
			}

			db_request.onupgradeneeded = () => {
				let db = db_request.result;
                //Recreate stores in the original database
				for(let store of database.stores){
					let obj_store;
                    if(store.auto_incr){
                       obj_store = db.createObjectStore(store.name, {autoIncrement : true});
                    }
                    else{
                        obj_store = db.createObjectStore(store.name, {keyPath : store.key_path});
                    }
					//Restore indexes of object stores
					for (let index in store.indexes){
						let new_index = store.indexes[index];
						obj_store.createIndex(new_index.name, new_index.path, {unique : new_index.unique, multiEntry : new_index.multi_entry});
					}
				}
			}

			db_request.onsuccess = () => {
				let db = db_request.result;
				let stores_restored = 0;
				for (let store of database.stores){
					let transaction = db.transaction(store.name, "readwrite");
					let obj_store = transaction.objectStore(store.name);
					restore_store(store, obj_store).then(() => {
						stores_restored++;
						if(stores_restored == database.stores.length){
                            if(restore_fail){
                                return reject();
                            }
							resolve();
						}
					}, () => {
						stores_restored++;
						if(stores_restored == database.stores.length){
                            if(restore_fail){
                                return reject();
                            }
							resolve();
						}
					});
				}
			}
		}
	);
}

/**
 * @param database JSON with data about a database stored on lock
 * @returns Promise which resolves if deletion succeeded, rejects on error
 */
function delete_database(database){
	return new Promise(
		function(resolve, reject){
			let db_deletion = indexedDB.deleteDatabase(database.name);
			db_deletion.onerror = () => {
				console.log(`Error while deleting database ${database.name}`);
				reject();
			}
			db_deletion.onsuccess = () => {
				resolve();
			}
		}
	);
}

/**
 * @param databases JSON with all backed up databases
 */
async function restore_databases(databases){
    let restore_fails = false;
	for (let database in databases){
		// Delete databases so that we can restore them without changing the on lock database version
		await delete_database(databases[database]).then(async () => {
			await restore_db(databases[database]).catch(() => {
				restore_fails = true;
			});
        }, () => {
			restore_fails = true;
		});
	}
    if(restore_fails){
        show_notification("Data restoration" ,"Database restoration ran into errors.\nStored data may be incosistent.");
    }
}

/**
 * Restores values saved on start of lock
 * \todo rethink cookie saving - maybe use the API? - consider their lifetimes
 * @param data JSON with data to be restored, includes storages, cookies and indexed databases
 */
async function restore_data(data){
	//Restoration of pre-lock items
	for (let key in data.local){
		localStorage.setItem(key, data.local[key]);
	}
	for (let key in data.session){
		sessionStorage.setItem(key, data.session[key]);
	}
    await restore_databases(data.indexed_DBs);
}

/**
 * Listens to messages from click_handler in formlock.js and responds either with
 * submit method and domain of form to be locked or with stored data to be backed
 * up
 */
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) { 
    if (request.msg == "BackupStorage" && document.URL == request.url) {
        let data = backup_storages();
		backup_databases().then((dbs) => {
			data.indexed_DBs = dbs;
			sendResponse({backup: data});
		});
        return true;
    }
    else if (request.msg == "RestoreStorage") {
        restore_data(request.data).then(() => {
            sendResponse();
        });
        return true;
    }
});
