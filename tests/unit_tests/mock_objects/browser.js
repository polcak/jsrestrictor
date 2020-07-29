//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020 Martin Bednar
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
