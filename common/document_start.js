//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later

/// Get current level configuration from the background script
browser.runtime.sendMessage({
		message: "get wrapping for URL",
		url: window.location.href
	},
	function handleResponse(reply) {
		injectScript(reply.code, reply.wrappers, reply.ffbug1267027);
	}
);
