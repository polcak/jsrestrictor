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
 * \brief Custom DNS cache (associtive array) created based on previous requests.
 *
 * Chromium-based web browsers do not provide DNS API to translate a domain name to the IP address.
 * This object dnsCache serves as a custom DNS cache that is filled from HTTP responces that have already been received.
 * When a new HTTP request is sent, the listener beforeSendHeadersListener looks at the domain name (from this HTTP request) in the dnsCache object.
 * If IP address (or addresses) are find for current domain name, this IP address (or addresses) are returned from listener and
 * domain name is successfully translated like by a DNS resolver.
 */
var dnsCache = new Object();

/**
 * \brief Associtive array of hosts, that are currently among blocked hosts.
 *
 * Once a host sends an HTTP request from the public to the private network, it gets to the blocked hosts.
 * Other HTTP queries from this guest will be blocked regardless of whether they are going to a public or private network.
 * This more stringent measure only applies to Chrome-based web browsers.
 * This is because Chrome-based web browsers can't resolve a domain name to an IP address using the DNS API before sending HTTP request.
 * If one HTTP request is in the direction from the public to the internal network,
 * all other requests are also considered offensive because it is not possible to verify the opposite (missing DNS API), and other HTTP requests will be blocked.
 */
var blockedHosts = new Object();


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

	//Host found among user's trusted hosts, allow it right away
	if (checkWhitelist(sourceUrl.hostname))
	{
		return {cancel:false};
	}

	//Host found among blocked hosts, cancel HTTPS request right away
	if (sourceUrl.hostname in blockedHosts)
	{
		return {cancel:true};
	}
	
	//Blocking direction Public -> Private
	if (isRequestFromPublicToPrivateNet(sourceUrl.hostname, targetUrl.hostname))
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
 * \brief Based on the provided hostnames, the function analyzes whether the HTTP request is going from the public to the private network.
 *
 * First, each hostname is translated to an IP address (based on the own DNS cache), if the hostname is not already an IP address.
 * Subsequently, it is analyzed whether the IP addresses are from the public or private range based on the locally served DNS zones loaded from IANA.
 *
 * \param sourceHostname Hostname without "www" from HTTP request source URL.
 * \param targetHostname Hostname without "www" from HTTP request target URL.
 *
 * Returns TRUE when HTTP request is going from the public to the private network, FALSE otherwise.
 */
function isRequestFromPublicToPrivateNet(sourceHostname, targetHostname) {
	var targetIP;
	var sourceIP;
	var isSourcePrivate = false;
	var isDestinationPrivate = false;
	
	//Checking type of SOURCE URL
	if (isIPV4(sourceHostname)) //SOURCE is IPV4 adddr
	{
		//Checking privacy of IPv4
		if (isIPV4Private(sourceHostname))
		{
			//Source is IPv4 private
			isSourcePrivate = true;
		}
	}
	else if(isIPV6(sourceHostname)) //SOURCE is IPV6
	{
		//Checking privacy of IPv6
		if (isIPV6Private(sourceHostname))
		{
			//Source is IPv6 private
			isSourcePrivate = true;
		}
	}
	else //SOURCE is hostname
	{
		//Search the DNS cache for the source domain
		if (dnsCache[sourceHostname] !== undefined) {
			//More IPs could have been found, for each of them
			for (let ip of dnsCache[sourceHostname])
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

	//Analyzing targetHostname
	//Check IPv4/IPv6 and privacy
	if (isIPV4(targetHostname))
	{
		if (isIPV4Private(targetHostname))
		{
			isDestinationPrivate = true;

		}
	}
	else if(isIPV6(targetHostname))
	{
		if (isIPV6Private(targetHostname))
		{
			isDestinationPrivate = true;
		}
	}
	else //Target is hostname
	{
		//Search the DNS cache for the target domain
		if (dnsCache[targetHostname] !== undefined) {
			//More IPs could have been found, for each of them
			for (let ip of dnsCache[targetHostname])
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
	
	//Return if is direction Public -> Private	
	return (!isSourcePrivate && isDestinationPrivate);
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
 * This listener also adds suspicious guests to blocked ones.
 * Once a host sends an HTTP request from the public to the private network, it gets to the blocked hosts.
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
	
	//Analyze request direction only when responseDetails.initiator is defined.
	//When responseDetails.initiator is undefined, can not analyze request direction.
	if(responseDetails.initiator !== undefined) {
		var sourceUrl = new URL(responseDetails.initiator);
		//Removing www. from hostname, so the hostnames are uniform
		sourceUrl.hostname = wwwRemove(sourceUrl.hostname);
		// Suspected of attacking, other HTTP requests by this host will be blocked.
		if(isRequestFromPublicToPrivateNet(sourceUrl.hostname, targetUrl.hostname)) {
			blockedHosts[sourceUrl.hostname] = true;
		}
	}
}
