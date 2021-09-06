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

function configureInjection({code, wrappers, domainHash, sessionHash}) {
	configureInjection = () => false; // one shot
	if (!code) return true; // nothing to wrap, bail out!
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
	var prng = new alea(domainHash);
	${code}
	})()`;
	try {
		wrappersPort = patchWindow(aleaCode);

		wrappersPort.onMessage = msg => {
			if (msg.wrapperName) {
				let {wrapperName, wrapperType, wrapperArgs, delta} = msg;
				let count = wrapperAccessCounters.get(wrapperName) || 0;
				wrapperAccessCounters.set(wrapperName, count + delta);
				if (count % 100 === 0) console.debug("Updated access counts", wrapperAccessCounters);

				// limit messages for performance reasons
				if (count < 1000) {
					// resend access information to FPD background script
					browser.runtime.sendMessage({
						purpose: "fp-detection",
						resource: wrapperName,
						type: wrapperType,
						args: wrapperArgs,
					});
				}
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
};