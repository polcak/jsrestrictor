/** \file
 * \brief This file contains functions for Network Boundary Shield in Chromium-based browsers.
 *
 *  \author Copyright (C) 2020  Pavel Pohner
 *  \author Copyright (C) 2020-2021 Martin Bednář
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

/** \file
 *
 * \brief This file contains Chrome specific functions for Network Boundary Shield.
 *
 * \ingroup NBS
 *
 * This file contains webRequest API listeners. These listeners handle HTTP requests in two different phases
 * (before send headers, on response started) and handle messages (on message event).
 *
 * Chromium-based web browsers do not provide DNS web extension API to translate a domain name to
 * the IP address. NBS creates a dnsCache that is filled during a processing of the first request
 * to each domain.
 *
 * * The resolved IP address for a domain is found during onResponseStarted event listener (and not
 *   blocked),
 * * Once known requests from public IP address to local IP address are blocked during
 *   onBeforeSendHeaders event listener.
 *
 * Additionally, if a domain initiates an attack, it is detected and registered in the blockedHosts
 * associative array. All successive requests by such hosts are blocked until the extension is
 * reloaded or the host whitelisted.
 *
 * \bug If multiple requests are performed in parallel before the first one reaches onResponseStarted,
 *   all requests go through.
 */

/**
 * \brief Custom DNS cache (associtive array) created based on previous requests.
 *
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
 * \brief The event listener, hooked up to webRequest onBeforeSendHeaders event.
 *
 * The listener catches all requests, analyzes them, does blocking. Requests coming from public IP ranges targeting the private IPs are
 * blocked by default. Others are permitted by default.
 *
 * \note It is not possible to merge implementation of this function with implementation for Firefox,
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
	var sourceDomain = getEffectiveDomain(requestDetail.initiator);
	var targetDomain = getEffectiveDomain(requestDetail.url);

	//Host found among user's trusted hosts, allow it right away
	if (isNbsWhitelisted(sourceDomain))
	{
		return {cancel:false};
	}

	//Host found among blocked hosts, cancel HTTPS request right away
	if (sourceDomain in blockedHosts)
	{
		notifyBlockedRequest(sourceDomain, targetDomain, requestDetail.tabId);
		return {cancel: nbsSettings.blocking ? true : false};
	}
	
	//Blocking direction Public -> Private
	var requestAnalysis = isRequestFromPublicToPrivateNet(sourceDomain, targetDomain);
	if (requestAnalysis.crossboundary)
	{
		if (!requestAnalysis.undefinedtargetip) {
			notifyBlockedRequest(sourceDomain, targetDomain, requestDetail.tabId);
		}
		return {cancel: nbsSettings.blocking ? true : false}
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
 * \return Returns an object with two properties:
 *
 *  * crossboundary: boolean (true when HTTP request is going from the public to the private network, false otherwise),
 *  * undefinedtargetip: boolean (true if the IP address of the target is undefined, i.e. 0.0.0.0 or [::], false otherwise).
 */
function isRequestFromPublicToPrivateNet(sourceHostname, targetHostname) {
	var targetIP;
	var sourceIP;
	var isSourcePrivate = false;
	var isDestinationPrivate = false;
	var result = {
		crossboundary: false,
		undefinedtargetip: false
	}

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
			if (targetHostname === "0.0.0.0") {
				result.undefinedtargetip = true;
			}
		}
	}
	else if(isIPV6(targetHostname))
	{
		if (isIPV6Private(targetHostname))
		{
			isDestinationPrivate = true;
			if (targetHostname === "::") {
				result.undefinedtargetip = true;
			}
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
						if (ip === "0.0.0.0") {
							result.undefinedtargetip = true;
						}
					}
				}
				else if (isIPV6(ip))
				{
					if (isIPV6Private(ip))
					{
						//Destination is IPv6 private
						isDestinationPrivate = true;
						if (ip === "::") {
							result.undefinedtargetip = true;
						}
					}
				}
			}
		}
	}

	//Return if is direction Public -> Private	
	result.crossboundary = !isSourcePrivate && isDestinationPrivate;
	return result;
}

/**
 * \brief The event listener, hooked up to webRequest onResponseStarted event.
 *
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
	
	var targetDomain = getEffectiveDomain(responseDetails.url);
	
	//If target hostname is IPv4 or IPv6 do not create any DNS record in cache.
	if (!isIPV4(targetDomain) && !isIPV6(targetDomain)) {
		if (dnsCache[targetDomain] === undefined) {
			//DNS entry for this domain not created yet.
			dnsCache[targetDomain] = [responseDetails.ip];
		}
		else if (dnsCache[targetDomain].indexOf(responseDetails.ip) === -1) {
			//DNS entry or entries already created for this domain.
			//Push new IP address if it does not already exist.
			dnsCache[targetDomain].push(responseDetails.ip);
		}
	}
	
	//Analyze request direction only when responseDetails.initiator is defined.
	//When responseDetails.initiator is undefined, can not analyze request direction.
	if(responseDetails.initiator !== undefined) {
		var sourceDomain = getEffectiveDomain(responseDetails.initiator);

		// Suspected of attacking, other HTTP requests by this host will be blocked.
		var requestAnalysis = isRequestFromPublicToPrivateNet(sourceDomain, targetDomain);
		if (requestAnalysis.crossboundary) {
			notifyBlockedHost(sourceDomain);
			blockedHosts[sourceDomain] = true;
		}
	}
}

/**
 * Creates and presents notification to the user.
 * Works with webExtensions notification API.
 * Creates notification about blocked host.
 *
 * \param host Host added to the black-list (blockedHosts).
 */
function notifyBlockedHost(host) {
	let message = `All subsequent HTTP requests from ${host} will be blocked.`;
	if (nbsSettings.blocking == 0) {
		message = `Enable requests blocking to block all requests from ${host} to local network.`;
	}
	browser.notifications.create("nbs-" + host, {
		"type": "basic",
		"iconUrl": browser.extension.getURL("img/icon-48.png"),
		"title": `Network Boundary Shield ${nbsSettings.blocking ? "blocked" : "detected"} suspicious host!`,
		"message": message
	});
	setTimeout(() => {
		browser.notifications.clear("nbs-" + host);
	}, 6000);
}
