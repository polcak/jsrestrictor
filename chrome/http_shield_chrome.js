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


/// Custom DNS cache created based on previous requests.
var dnsCache = new Object();


/// webRequest event listener, hooked to onBeforeSendHeaders event
/// Catches all requests, analyzes them, does blocking
/// Not possible to merge implementation of this function with implementation for Firefox,
/// because Chrome does not support async listerners for blocking requests
/// This function must not be asynchronous for Chrome.
/// See more: https://stackoverflow.com/questions/47910732/browserextension-webrequest-onbeforerequest-return-promise
function beforeSendHeadersListener(requestDetail) {

	//If either of information is undefined, permit it
	//initiator happens to be undefined for the first request of the page loading the document itself
	if (requestDetail.initiator === undefined || requestDetail.url === undefined)
	{
		return {cancel:false};
	}
	var sourceUrl = new URL(requestDetail.initiator);
	//Removing www. from hostname, so the hostnames are uniform
	sourceUrl.hostname = sourceUrl.hostname.replace(/^www\./,'');
	var targetUrl = new URL(requestDetail.url);
	//Removing www. from hostname, so the hostnames are uniform
	targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');

	var targetIP;
	var sourceIP;
	var isSourcePrivate = false;
	var isDestinationPrivate = false;

	//Host found among user's trusted hosts, allow it right away
	if (checkWhitelist(sourceUrl.hostname))
	{
		return {cancel:false};
	}

	//Checking type of SOURCE URL
	if (isIPV4(sourceUrl.hostname)) //SOURCE is IPV4 adddr
	{
		//Checking privacy of IPv4
		if (isIPV4Private(sourceUrl.hostname))
		{
			//Source is IPv4 private
			isSourcePrivate = true;
		}
	}
	else if(isIPV6(sourceUrl.hostname)) //SOURCE is IPV6
	{
		//Checking privacy of IPv6
		if (isIPV6Private(sourceUrl.hostname))
		{
			//Source is IPv6 private
			isSourcePrivate = true;
		}
	}
	else //SOURCE is hostname
	{
		//Search the DNS cache for the source domain
		if (dnsCache[sourceUrl.hostname] !== undefined) {
			//More IPs could have been found, for each of them
			for (let ip of dnsCache[sourceUrl.hostname])
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					 if (isIPV4Private(ip))
					 {
						//IPv4 is private
						isSourcePrivate = true;
					 }
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//IPv6 is private
						isSourcePrivate = true;
					}
				}
			}
		}
	}

	//Analyzing targetUrl
	//Check IPv4/IPv6 and privacy
	if (isIPV4(targetUrl.hostname))
	{
		if (isIPV4Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;

		}
	}
	else if(isIPV6(targetUrl.hostname))
	{
		if (isIPV6Private(targetUrl.hostname))
		{
			isDestinationPrivate = true;
		}
	}
	else //Target is hostname
	{
		//Search the DNS cache for the target domain
		if (dnsCache[targetUrl.hostname] !== undefined) {
			//More IPs could have been found, for each of them
			for (let ip of dnsCache[targetUrl.hostname])
			{
				//Check whether it's IPv4
				if (isIPV4(ip))
				{
					 if (isIPV4Private(ip))
					 {
						//IPv4 is private
						isDestinationPrivate = true;
					 }
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//IPv6 is private
						isDestinationPrivate = true;
					}
				}
			}
		}
	}
	
	//Blocking direction Public -> Private
	if (!isSourcePrivate && isDestinationPrivate)
	{
		notifyBlockedRequest(sourceUrl.hostname, targetUrl.hostname, requestDetail.type);
		return {cancel:true}
	}
	else //Permitting others
	{
		return {cancel: false};
	}
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


/// webRequest event listener, hooked to onResponseStarted event
/// analyze HTTP response
/// get ip address and hostname (domain) from response
/// creating custom dns cache in object dnsCache from obtained ip address and domain
/// In Chrome, custom DNS cache has to be created because Chrome does not have dns API.
function onResponseStartedListener(responseDetails) {
	//It's neccessary to have both properities defined, otherwise the response can't be analyzed.
	if (responseDetails.ip === undefined || responseDetails.url === undefined)
	{
		return;
	}
	
	var targetUrl = new URL(responseDetails.url);
	//Removing www. from hostname, so the hostnames are uniform.
	targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');
	
	//If target hostname is IPv4 or IPv6 do not create any DNS record in cache.
	if (!isIPV4(targetUrl.hostname) && !isIPV6(targetUrl.hostname)) {
		if (dnsCache[targetUrl.hostname] === undefined) {
			//DNS entry for this domain not created yet.
			dnsCache[targetUrl.hostname] = [responseDetails.ip];
		}
		else if (dnsCache[targetUrl.hostname].indexOf(responseDetails.ip) === -1) {
			//DNS entry or entries already created for this domain.
			//Push new IP address if it does not already exist.
			dnsCache[targetUrl.hostname].push(responseDetails.ip);
		}
	}
}
