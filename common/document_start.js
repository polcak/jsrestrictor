//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020-2021  Libor Polcak
//  Copyright (C) 2021  Matus Svancar
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

/// Get current level configuration from the background script
browser.runtime.sendMessage({
		message: "get wrapping for URL",
		url: window.location.href
	},
	/// prepend domain and session hashes
	function handleResponse(reply) {
		browser.storage.local.get(["sessionHash", "visitedDomains"], function(storageData) {
			domains = storageData.visitedDomains;
			sessionHash = storageData.sessionHash
			let saveVisited = false;
			if (!domains[location.origin]) {
				domains[location.origin] = generateId();
				saveVisited = true;
			};
			var tempCode = `
				var domainHash = "${domains[location.origin]}";
				var sessionHash ="${sessionHash}";` + reply.code;
			reply.code = `(function() {${tempCode}})();`;
			injectScript(reply.code, reply.wrappers, reply.ffbug1267027);
			if (saveVisited === true) {
				browser.storage.local.set({
					"visitedDomains": domains
				})
			}
		});
	}
);
