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

// Implementation of HTTP webRequest shield, file: http_shield_chrome.js
// Contains Chrome specific functions
// Event handlers for webRequest API, notifications and messaging

/// Associative array of hosts, that are currently blocked based on their previous actions
var blockedHosts = new Object();
/// Custom DNS cache created based on previous requests.
var dnsCache = new Object();


function dnsResolveChrome(hostname) {
	//Resoluting DNS query for target domain
	if (dnsCache[hostname] !== undefined) {
		//More IPs could have been found, for each of them
		for (let ip of dnsCache[hostname])
		{
			//Check whether it's IPv4
			if (isIPV4(ip))
			{
				 if (isIPV4Private(ip))
				 {
					//IPv4 is private
					return true;
				 }
			}
			else if (isIPV6(ip))
			{
				if (isIPV6Private(ip))
				{
					//IPv6 is private
					return true;
				}
			}
		}
	}
	return false;
}

/// webRequest event listener, hooked to onMessage event
/// obtains message string in message, message sender in sender
/// and function for sending response in sendResponse
/// Does approriate action based on message text
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
			sendResponse("current site is whitelisted");
			return true;
		}
		else
		{
			sendResponse("current site is not whitelisted");
			return true;
		}
	}
}

function onResponseStartedListener(responseDetails) {
	//It's neccessary to have both properities defined, otherwise the response can't be analyzed
	if (responseDetails.ip === undefined || responseDetails.url === undefined) //initiator
	{
		return;
	}
	
	var targetUrl = new URL(responseDetails.url);
	//Removing www. from hostname, so the hostnames are uniform
	targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');
	
	if (!isIPV4(targetUrl.hostname) && !isIPV6(targetUrl.hostname)) {
		if (dnsCache[targetUrl.hostname] === undefined) {
			dnsCache[targetUrl.hostname] = [responseDetails.ip];
		}
		else if (dnsCache[targetUrl.hostname].indexOf(responseDetails.ip) === -1) {
			dnsCache[targetUrl.hostname].push(responseDetails.ip);
		}
	}
}
