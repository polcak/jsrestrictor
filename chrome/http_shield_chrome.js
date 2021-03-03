//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Pavel Pohner, Martin Bednář
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

/** \file
 *
 * \brief This file contains Chrome specific functions for Network Boundary Shield.
 *
 * \ingroup NBS
 *
 * This file contains webRequest API listeners. These listeners handle HTTP requests in two different phases
 * (before send headers, on response started) and handle messages (on message event).
 */
 
/**
 * \brief Custom DNS cache created based on previous requests.
 *
 * Chromium-based web browsers do not provide DNS API to translate a domain name to the IP address.
 * This object dnsCache serves as a custom DNS cache that is filled from HTTP responces that have already been received.
 * When a new HTTP request is sent, the listener beforeSendHeadersListener looks at the domain name (from this HTTP request) in the dnsCache object.
 * If IP address (or addresses) are find for current domain name, this IP address (or addresses) are returned from listener and
 * domain name is successfully translated like by a DNS resolver.
 */
var dnsCache = new Object();


/**
 * The event listener, hooked up to webRequest onBeforeSendHeaders event.
 * The listener catches all requests, analyzes them, does blocking. Requests coming from public IP ranges targeting the private IPs are
 * blocked by default. Others are permitted by default.
 * Not possible to merge implementation of this function with implementation for Firefox,
 * because Chrome does not support async listerners for blocking requests
 * This function must not be asynchronous for Chrome.
 * See more: https://stackoverflow.com/questions/47910732/browserextension-webrequest-onbeforerequest-return-promise
 *
 * \param requestDetail Details of HTTP request.
 */
function beforeSendHeadersListener(requestDetail) {

	//If either of information is undefined, permit it
	//initiator happens to be undefined for the first request of the page loading the document itself
	if (requestDetail.initiator === undefined || requestDetail.url === undefined || requestDetail.initiator === "null" || requestDetail.url === "null")
	{
		return {cancel:false};
	}
	var sourceUrl = new URL(requestDetail.initiator);
	//Removing www. from hostname, so the hostnames are uniform
	sourceUrl.hostname = wwwRemove(sourceUrl.hostname);
	var targetUrl = new URL(requestDetail.url);
	//Removing www. from hostname, so the hostnames are uniform
	targetUrl.hostname = wwwRemove(targetUrl.hostname);

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
						//Source is IPv4 private
						isSourcePrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Source is IPv6 private
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
						//Destination is IPv4 private
						isDestinationPrivate = true;
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Destination is IPv6 private
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


/**
 * The event listener, hooked up to the webExtensions onMessage event.
 * The listener sends message response which contains information if the current site is whitelisted or not.
 * 
 * \param message Receives full message.
 * \param sender Sender of the message.
 * \param sendResponse Function for sending response.
 *
 */
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

/**
 * The event listener, hooked up to webRequest onResponseStarted event.
 * The listener analyzes a HTTP response and get an ip address and a hostname (a domain name) from the response.
 * This listener is filling the custom dnsCache object from the obtained IP address and the domain name.
 * In Chrome, custom DNS cache has to be created because Chrome does not have DNS API.
 *
 * \param responseDetails Details of HTTP response. responseDetails contains desired combination of an IP address and a corresponding domain name.
 */
function onResponseStartedListener(responseDetails)
{
	//It's neccessary to have both properities defined, otherwise the response can't be analyzed.
	if (responseDetails.ip === undefined || responseDetails.url === undefined)
	{
		return;
	}
	
	var targetUrl = new URL(responseDetails.url);
	//Removing www. from hostname, so the hostnames are uniform.
	targetUrl.hostname = wwwRemove(targetUrl.hostname);
	
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
