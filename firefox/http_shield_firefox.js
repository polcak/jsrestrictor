//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020  Pavel Pohner
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

/// Implementation of HTTP webRequest shield, file: http_shield_firefox.js
/// Contains Firefox specific functions
/// Event handlers for webRequest API, notifications and messaging

browser.runtime.onMessage.addListener(messageListener);

/// Event listener hooked up to webExtensions onMessage event
/// Receives full message in message,
/// sender of the message in sender,
/// function for sending response in sendResponse
/// Does appropriate action based on message
function messageListener(message, sender, sendResponse)
{
	//Message came from popup,js, asking whether is this site whitelisted
	if (message.message === "is current site whitelisted?")
	{
		//Read the current hostname
		var currentHost = message.site;
		//Response with appropriate message
		if (checkWhitelist(currentHost))
		{
			return Promise.resolve("current site is whitelisted");
		}
		else
		{
			return Promise.resolve("current site is not whitelisted");
		}
	}
}
