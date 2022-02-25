/** \file
 * \brief Main script launched when a page is being loaded by a browser
 *
 *  \author Copyright (C) 2020  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2021  Giorgio Maone
 *  \author Copyright (C) 2021  Marek Salon
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

var wrappersPort;
var pageConfiguration = null;
function configureInjection({currentLevel, code, wrappers, domainHash, sessionHash, fpdOn}) {
	if (pageConfiguration) return; // one shot
	pageConfiguration = {currentLevel, fpdOn};
	if (!code) return true; // nothing to wrap, bail out!
	if (!fpdOn) {
		code = code.replace(/\/\/ FPD_S[\s\S]*?\/\/ FPD_E/, ''); // remove fpd wrappers from injected code
		if (wrappers.length === 0) {
			return true; // nothing to wrap and fpd is also off
		}
	}
	if(browser.extension.inIncognitoContext){
		// Redefine the domainHash for incognito context:
		// Compute the SHA256 hash of the original hash so that the incognito hash is:
		// * significantly different to the original domainHash,
		// * computationally difficult to revert,
		// * the same for all incognito windows (for the same domain).
		var hash = sha256.create();
		hash.update(JSON.stringify(domainHash));
		domainHash = hash.hex();
	}
	var aleaCode = `(() => {
	var domainHash =  ${JSON.stringify(domainHash)};
	${alea}
	var prng = alea(domainHash); // Do not use this in wrappers, create your own prng to generate repeatable sequences
	${code}
	})()`;
	try {
		wrappersPort = patchWindow(aleaCode);	
		wrappersPort.onMessage = msg => {
			if (msg.wrapperName) {
				let {wrapperName, wrapperType, wrapperArgs} = msg;			
				// pass access logs to FPD background script
				browser.runtime.sendMessage({
					purpose: "fp-detection",
					resource: wrapperName,
					type: wrapperType,
					args: wrapperArgs,
				});
			}
		}
		return true;
	} catch (e) {
		console.error(e, `Trying to run\n${aleaCode}`)
	}
	return false;
}

if ("configuration" in window) {
	console.debug("Early configuration found!", configuration);
	configureInjection(configuration);
} else {
	/// Get current level configuration from the background script
	configureInjection(browser.runtime.sendSyncMessage({
			message: "get wrapping for URL",
			url: window.location.href
		}
	));
}

/**
 * Event listener that listens for background script messages.
 *
 * \param callback Function that clears localStorage and sessionStorage.
 */
 browser.runtime.onMessage.addListener(function (message) {
    if (message.cleanStorage) { 
        localStorage.clear();
        sessionStorage.clear();
    }
});
