//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2020  Martin Bednar
// SPDX-License-Identifier: GPL-3.0-or-later
//

chrome.storage.sync = {
	__default__: 2, // Default protection level
	version: 2,     // The version of this storage
	custom_levels: {}, // associative array of custom level (key, its id => object)
	//{level_id: short string used for example on the badge
	//level_text: Short level description
	//level_description: Full level description
	//wrappers": list of wrappers and their parameters
	//}
	domains: {}, // associative array of levels associated with specific domains (key, the domain => object)
	//{level_id: short string of the level in use
	//}
}
