/** \file
 * \brief Main script launched when a page is being loaded by a browser
 *
 *  \author Copyright (C) 2020  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2021  Giorgio Maone
 *  \author Copyright (C) 2021  Marek Salon
 *  \author Copyright (C) 2023  Martin Zmitko
 *  \author Copyright (C) 2026  Dzianis Pilipenka
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

var wrappersPort = null;
var pageConfiguration = null;
var pendingConfig = null;

function wrapWindow(currentLevel, fpdWrappers, wrappersConf) {
	const code = fp_assemble_injection(currentLevel, fpdWrappers, `
		init(${JSON.stringify(wrappersConf)});
	`);
	return patchWindow(code);
}

function createHandleWrappersPortMessage(getConf) {
	return function(msg) {
			if (msg.wrapperName) {
				let {wrapperName, wrapperType, wrapperArgs, stack} = msg;
				// pass access logs to FPD background script
				browser.runtime.sendMessage({
					purpose: "fp-detection",
					content: msg,
				});
			}
			if (msg.init) {
				// initialize on late demand
				return getConf();
			}
	}
}

// ── Bootstrap listener ───────────────────────────────────────────
// MAIN world (wrappers_generated.js) sends us a random portId
// via this one-time event. Both scripts run at document_start,
// so no page script can intercept this.
 
window.addEventListener("jshelter-bootstrap", function (e) {
	var portId = e.detail.portId;

	// Port matching wrappers_generated.js protocol
	// ISOLATED side: listen on "page", send on "extension"
	var retStack = [];
	function fire(ev, detail) {
		window.dispatchEvent(new CustomEvent(portId + ":" + ev, {
		    detail: detail, composed: true
		}));
	}

	wrappersPort = {
		postMessage: function(msg) {
			retStack.push({});
			fire("extension", {msg: msg});
			var ret = retStack.pop();
			if (ret.error) throw ret.error;
			return ret.value;
		},
		onMessage: null
	};

	window.addEventListener(portId + ":page", function(event) {
		if (typeof wrappersPort.onMessage === "function" && event.detail) {
			var ret = {};
			try {
				ret.value = wrappersPort.onMessage(event.detail.msg, event);
			} catch (error) {
				ret.error = error;
			}
			fire("return:extension", ret);
		}
	}, true);

	window.addEventListener(portId + ":return:page", function(event) {
		if (event.detail && retStack.length) {
			retStack[retStack.length - 1] = event.detail;
		}
	}, true);

	wrappersPort.onMessage = createHandleWrappersPortMessage(() => pendingConfig);

	if (pendingConfig) {
		wrappersPort.postMessage(pendingConfig);
	}
}, true);

function configureInjection({currentLevel, fpdWrappers, fpdTrackCallers, domainHash, incognitoHash}) {
	if (pageConfiguration) return; // one shot
	pageConfiguration = {currentLevel, fpdWrappers, fpdTrackCallers, domainHash, incognitoHash};
	console.debug(`Configuration injected: ${document.readyState}\n${document.title} ${document.documentElement.outerHTML}`);
	if (browser.extension.inIncognitoContext) {
		domainHash = incognitoHash;
	}

	var wrappersConf = {
			fpdTrackCallers,
			domainHash,
	};
	function patchWindowPath() {
		wrappersPort = wrapWindow(currentLevel, fpdWrappers, wrappersConf);

		// initialize in case the userScript API already injected
		console.debug(wrappersPort, wrappersConf);
		wrappersPort.postMessage(wrappersConf);

		wrappersPort.onMessage = createHandleWrappersPortMessage(() => wrappersConf);
	}
	try {
		if (typeof exportFunction === "function") {
			// ── Firefox path ──
			// Native exportFunction + Xray wrappers available.
			// Inject code string via patchWindow.
			patchWindowPath();
		} else {
			// ── Chrome path ──
			// wrappers_generated.js handles MAIN world.
			// Just store config; bootstrap listener will deliver it.
			pendingConfig = wrappersConf;
			pendingConfig.currentLevel = currentLevel;
			pendingConfig.fpdWrappers = fpdWrappers;
			if (wrappersPort) {
				wrappersPort.postMessage(pendingConfig);
			}
		}
		return true;
	} catch (e) {
		console.error(e, "Trying to initialize wrappers.");
	}
	return false;
}

/**
 * See https://pagure.io/JShelter/paper2022/c/a7e7e88edecfa19c3a52542b553bf1dc9b4388a9?branch=cnil,
 * https://codeberg.org/JShelter/webextension/issues/70 and
 * https://codeberg.org/JShelter/webextension/issues/46#comment-793783
 * for more information on the early injection mechanism.
 */
if ("configuration" in window) {
	console.debug("Early configuration found!", configuration);
	configureInjection(configuration);
} else if ("sendSyncMessage" in browser.runtime) { 
	// Get configuration snapshot from the service worker via SyncMessage (nscl/common/SyncMessage.js)
	configureInjection(browser.runtime.sendSyncMessage({
			message: "get wrapping for URL",
			url: window.location.href
		}
	));
}

/**
 * Event listener that listens for background script messages.
 *
 * \param callback Function that clears certain storage facilities.
 */
browser.runtime.onMessage.addListener(function (message) {
	if (message.cleanStorage) { 
		localStorage.clear();
		sessionStorage.clear();
		window.name = "";

		if (!message.ignoreWorkaround) {
			// clear indexedDB (only Chrome)
			if (window.indexedDB && indexedDB.databases) {	
				indexedDB.databases().then(dbs => {
					dbs.forEach(db => indexedDB.deleteDatabase(db.name))
				}).catch(err => console.error(err));
			}
		
			// clear cacheStorage
			if (window.caches) {
				caches.keys().then((names) => {
					for (let name of names) {
						caches.delete(name);
					}
				}).catch(err => console.error(err));
			}

			// clear cookies (only JS)
			// Source: https://stackoverflow.com/a/66698063/17661959
			document.cookie.replace(
				/(?<=^|;).+?(?=\=|;|$)/g, 
				name => location.hostname
				  .split(/\.(?=[^\.]+\.)/)
				  .reduceRight((acc, val, i, arr) => i ? arr[i]='.'+val+acc : (arr[i]='', arr), '')
				  .map(domain => document.cookie=`${name}=;${location.protocol == 'https:' ? 'Secure;' : ''}max-age=0;path=/;domain=${domain}`)
			);
		}

		// clear storages of all injected windows (using BrowsingData)
		browser.runtime.sendMessage({
			purpose: "fpd-clear-storage",
			url: window.location.href
		});
	}
});
