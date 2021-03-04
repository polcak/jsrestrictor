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

/**
 * \defgroup NBS Network Boundary Shield
 *
 * \brief The Network Boundary Shield (NBS) is a protection against attacks from an external network (the Internet)
 * to an internal network - especially against a reconnaissance attacks when a web browser is abused as a proxy.
 * See, for example, the ForcePoint report https://www.forcepoint.com/sites/default/files/resources/files/report-attacking-internal-network-en_0.pdf,
 * https://www.forcepoint.com/blog/x-labs/attacking-internal-network-public-internet-using-browser-proxy.
 *
 * The NBS functionality is based on filtering HTTP requests. The Network Boundary Shield uses blocking webRequest API to handle HTTP requests.
 * This means that processing of each HTTP request is paused before it is analyzed and allowed (if it seems benign) or blocked (if it is suspicious).
 *
 * The main goal of NBS is to prevent attacks like a public website requests a resource from the
 * internal network (e.g. the logo of the manufacturer of the local router); NBS will detect that
 * a web page hosted on the public Internet tries to connect to a local IP address. NBS blocks only
 * HTTP requests from a web page hosted on a public IP address to a private network resource. The
 * user can allow specific web pages to access local resources (e.g. when using Intranet services).
 *
 * NBS uses CSV files provided by IANA
 * (https://www.iana.org/assignments/locally-served-dns-zones/locally-served-dns-zones.xml) to
 * determine public and local IP address prefixes. Both IPv4 and IPv6 is supported. The CSV files
 * are downloaded during the $(PROJECT_NAME) building process.
 * 
 * The NBS has only a small impact on the web browser performance. The impact differs for each implementation.
 *
 * More information about the Network Boundary Shield can be obtained from the master thesis by Pavel Pohner: https://www.vutbr.cz/studenti/zav-prace/detail/129272 (in Czech).
 */

 /** \file
 *
 * \brief This file contains common functions for Network Boundary Shield.
 *
 * \ingroup NBS
 *
 * This file contains basic logic of the NBS, NBS global variables and objects,
 * functions for reading and parsing CSV files, and functions for identifying and processing IP addresses and checking IP ranges.
 */

//Chrome compatibility
/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
if ((typeof browser) === "undefined") {
	var browser = chrome;
}
/// \endcond

/**
 * Locally served IPV4 DNS zones loaded from IANA.
 */
var localIPV4DNSZones;

/**
 * Locally served IPV6 DNS zones loaded from IANA.
 */
var localIPV6DNSZones;

/**
 * Associtive array of hosts, that are currently among trusted "do not blocked" hosts.
 */
var doNotBlockHosts = new Object();

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
browser.storage.sync.get(["whitelistedHosts"], function(result){
		if (result.whitelistedHosts != undefined)
			doNotBlockHosts = result.whitelistedHosts;
	});

/// Hook up the listener for receiving messages
browser.runtime.onMessage.addListener(commonMessageListener);
browser.runtime.onMessage.addListener(messageListener);

/// Check the storage for requestShieldOn object
browser.storage.sync.get(["requestShieldOn"], function(result){
	//If found object is true or undefined, turn the requestShieldOn
	if (result.requestShieldOn == undefined || result.requestShieldOn)
	{
		//Hook up the listeners
		browser.webRequest.onBeforeSendHeaders.addListener(
			beforeSendHeadersListener,
			{urls: ["<all_urls>"]},
			["blocking", "requestHeaders"]
		);

		if (typeof onResponseStartedListener === "function")
		{
			browser.webRequest.onResponseStarted.addListener(
			onResponseStartedListener,
			{urls: ["<all_urls>"]},
			["responseHeaders"]
			);
		}
	}
});
/// \endcond

/**
 * The function for reading a locally stored csv file.
 *
 * \param _path String with a fully-qualified URL. E.g.: moz-extension://2c127fa4-62c7-7e4f-90e5-472b45eecfdc/beasts/frog.dat
 *
 * \returns promise for returning content of the file as a string.
 */
let readFile = (_path) => {
	return new Promise((resolve, reject) => {
		//Fetching locally stored CSV file in same-origin mode
		fetch(_path, {mode:'same-origin'})
			.then(function(_res) {
				//Return data as a blob
				return _res.blob();
			})
			.then(function(_blob) {
				var reader = new FileReader();
				//Wait until the whole file is read
				reader.addEventListener("loadend", function() {
					resolve(this.result);
				});
				//Read blob data as text
				reader.readAsText(_blob);
			})
			.catch(error => {
				reject(error);
			});
	});
};

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
// Obtain file path in user's file system and read CSV file with IPv4 local zones
readFile(browser.runtime.getURL("ipv4.dat"))
	.then(_res => {
		//Parse loaded CSV and store it in prepared variable
		localIPV4DNSZones = parseCSV(_res, true);
	})
	.catch(_error => {
		console.log(_error );
	});

// Obtain file path in user's file system and read CSV file with IPv6 local zones
readFile(browser.runtime.getURL("ipv6.dat"))
	.then(_res => {
		//Parse loaded CSV and store it in prepared variable
		localIPV6DNSZones = parseCSV(_res, false);
	})
	.catch(_error => {
		console.log(_error );
	});
/// \endcond

/**
 * Checks validity of IPv4 addresses.
 *
 * \param url An URL that may or may not contains an IPv4 address instead of a domain name.
 *
 * \returns TRUE if the url matches IPv4 regex, FALSE otherwise.
 */
function isIPV4(url)
{
	var reg = new RegExp("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$");
	return reg.test(url);
}

/**
 * Checks validity IPV6 address.
 *
 * \param url An URL that may or may not contains an IPv6 address instead of a domain name.
 *
 * \returns TRUE, if URL is valid IPV6 address, FALSE otherwise.
 */
function isIPV6(url)
{
	url = url.substring(1, url.length - 1);
	var reg = new RegExp("^(?:(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){6})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:::(?:(?:(?:[0-9a-fA-F]{1,4})):){5})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){4})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,1}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){3})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,2}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){2})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,3}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:[0-9a-fA-F]{1,4})):)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,4}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,5}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,6}(?:(?:[0-9a-fA-F]{1,4})))?::))))$", 'm');
	return reg.test(url);
}

/**
 * Checks whether the ipAddr is found in IPv4 localZones.
 * If the IPv4 address is found in any IPv4 local zone, it means that this IPv4 address is private.
 * IPv4 local zone is e.g. 192.168.000.000/16.
 *
 * \param ipAddr Valid IPv4 address.
 *
 * \returns TRUE if ipAddr exists in localZones fetched from IANA, FALSE otherwise.
 */
function isIPV4Private(ipAddr)
{
	//Split IP address on dots, obtain 4 numbers	
	var substrIP = ipAddr.split('.');
	//Convert IP address into array of 4 integers
	var ipArray = substrIP.map(function(val){
	return parseInt(val, 10);
	});
	//For each IPv4 locally served zone
	for (var i = 0; i < localIPV4DNSZones.length; i++)
	{
		//Split the zone into array of J numbers
		var zone = localIPV4DNSZones[i].split('.');
		var k = 0;
		//For each number of local zone IP
		//(Decrementing, because local zones IPs are reverted
		for (var j = zone.length - 1; j >= 0; j--)
		{
			//Check if the corresponding numbers match
			//If not, then break and move onto next local zone
			if (ipArray[k] != zone[j])
			{
			break;
			}
			else if(j == 0) //Checked all numbers of local zone
			{
			return true;
			}
			k++;
		}
	}
	return false;
}

/**
 * Checks whether the ipAddr is found in IPv6 localZones.
 * If the IPv6 address is found in any IPv6 local zone, it means that this IPv6 address is private.
 * IPv6 local zone is e.g. fe80::/10.
 *
 * \param ipAddr Valid IPv6 address.
 *
 * \returns TRUE if ipAddr exists in localZones fetched from IANA, FALSE otherwise.
 */
function isIPV6Private(ipAddr)
{
	//Expand shorten IPv6 addresses to full length
	ipAddr = expandIPV6(ipAddr);
	//Split into array of fields
	var substrIP = ipAddr.split(":");
	//Join the fields into one string
	ipAddr = substrIP.join("").toUpperCase();
	//For each IPv6 locally served zone
	for (var i = 0; i < localIPV6DNSZones.length; i++)
	{
		var zone = localIPV6DNSZones[i];
		//For each char of zone
		for (var j = 0; j < zone.length; j++)
		{
			//Compare the chars, if they do not match, break and move onto next zone		
			if (ipAddr.charAt(j) != zone.charAt(j))
			{
			break;
			}
			//Checked all chars of current zone -> private IP range
			else if(j == zone.length - 1)
			{
			return true;
			}
		}
	}
	return false;
}

/**
 * Function for parsing CSV files obtained from IANA.
 * It strips .IN-ADDR and .IP6 from zones and comma delimiter, merges them into array by CSV rows.
 *
 * \param csv CSV obtained from IANA.
 * \param ipv4 Boolean, saying whether the csv is IPv4 CSV or IPv6.
 *
 * \returns an array of parsed CSV values.
 */
function parseCSV(csv, ipv4)
{
	//converting into array
	var csvArray = CSVToArray(csv);
	var DNSzones = [];

	if (ipv4) //ipv4.csv
	{
	//cycle through first column of the CSV -> obtaining IP zones
	//Starting with i = 1, skipping the CSV header
	for (var i = 1; i < csvArray.length; i++)
	{
		//i-1, means start from 0
		//Obtains IP zone, strips .IN-ADDR from the end of it, stroes into array	
		DNSzones[i-1] = csvArray[i][0].substring(0, csvArray[i][0].indexOf(".IN-ADDR"));
	}
	return DNSzones;
	}
	else //ipv6.csv
	{
		//Same as ipv4
		for (var i = 1; i < csvArray.length-1; i++)
		{
			DNSzones[i-1] = csvArray[i][0].substring(0, csvArray[i][0].indexOf(".IP6"));
		}

		for (var i = 0; i < DNSzones.length; i++)
		{
			//Additionally splits the IP zone on dots	
			var splitted = DNSzones[i].split(".");
			DNSzones[i] = "";
			//Joins splitted IP zone into one string
			for (var j = splitted.length - 1; j >= 0 ; j--)
			{
			DNSzones[i] += splitted[j];

			}
		}
		return DNSzones;
	}
}

/**
 * Auxillary function for parsing CSV files.
 * Converts CSV to array.
 *
 * \param strData Loaded CSV file as a string.
 *
 * \returns array containing CSV rows.
 */
function CSVToArray(strData){
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
		// Delimiters.
		"(\\,|\\r?\\n|\\r|^)" +
		// Quoted fields.
		"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		// Standard fields.
		"([^\"\\,\\r\\n]*))"
		),
		"gi"
		);
	//Array to hold data
	var csvData = [[]];
	//Array to hold regex matches
	var regexMatches = null;
	//While not match
	while (regexMatches = objPattern.exec(strData)){
		// Get the delimiter that was found
		var strMatchedDelimiter = regexMatches[1];
		if (strMatchedDelimiter.length && (strMatchedDelimiter != ",")){
		//New row
		csvData.push([]);
		}
		// captured data (quoted or unquoted)
		if (regexMatches[2]){
		//quoted
		var strMatchedValue = regexMatches[2].replace(
			new RegExp( "\"\"", "g" ),
			"\""
			);
		} else {
			//non-quoted value.
			var strMatchedValue = regexMatches[3];

		}
		//Add to data array
		csvData[csvData.length - 1].push( strMatchedValue );
	}
	// Return the parsed data
	return( csvData );
}

/**
 * Function for expanding shorten ipv6 addresses.
 * 
 * \param ip6addr Valid ipv6 address.
 *
 * \returns expanded ipv6 address in string.
 */
function expandIPV6(ip6addr)
{
	ip6addr = ip6addr.substring(1, ip6addr.length - 1);
	var expandedIP6 = "";
	//Check for omitted groups of zeros (::)
	if (ip6addr.indexOf("::") == -1)
	{
		//There are none omitted groups of zeros
		expandedIP6 = ip6addr;
	}
	else
	{
		//Split IP on one compressed group
		var splittedIP = ip6addr.split("::");
		var amountOfGroups = 0;
		//For each group
		for (var i = 0; i < splittedIP.length; ++i)
		{
			//Split on :	
			amountOfGroups += splittedIP[i].split(":").length;
		}
		expandedIP6 += splittedIP[0] + ":";
		//For each splitted group
		for (var i = 0; i < 8 - amountOfGroups; ++i)
		{
			//insert zeroes	
			expandedIP6 += "0000:";
		}
		//Insert the rest of the splitted IP
		expandedIP6 += splittedIP[1];
	}
	//Split expanded IPv6 into parts
	var addrParts = expandedIP6.split(":");
	var addrToReturn = "";
	//For each part
	for (var i = 0; i < 8; ++i)
	{
		//check the length of the part
		while(addrParts[i].length < 4)
		{
			//if it's less than 4, insert zero
			addrParts[i] = "0" + addrParts[i];
		}
		addrToReturn += i != 7 ? addrParts[i] + ":" : addrParts[i];
	}
	return addrToReturn;
}

/**
 * Check if the hostname or any of it's domains is whitelisted.
 *
 * \param hostname Any hostname (subdomains allowed).
 *
 * \returns TRUE when domain (or subdomain) is whitelisted, FALSE otherwise.
 */
function checkWhitelist(hostname)
{
	//Calling a function from url.js
	var domains = extractSubDomains(hostname);
	for (var domain of domains)
	{
		if (doNotBlockHosts[domain] != undefined)
		{
			return true;
		}
	}
	return false;
}

/**
 * Creates and presents notification to the user.
 * Works with webExtensions notification API.
 * Creates notification about blocked request.
 *
 * \param origin Origin of the request.
 * \param target Target of the request.
 * \param resource Type of the resource.
 */
function notifyBlockedRequest(origin, target, resource) {
	browser.notifications.create({
		"type": "basic",
		"iconUrl": browser.extension.getURL("img/icon-48.png"),
		"title": "Network boundary shield blocked suspicious request!",
		"message": `Request from ${origin} to ${target} blocked.\n\nMake sure that you are on a benign page. If you want to allow web requests from ${origin}, please, go to the JS Restrictor settings and add an exception.`
	});
}

/**
 * Event listener hooked up to webExtensions onMessage event.
 * Does appropriate action based on message (e.g. Turn on/off the NBS, add/remove a site to/from whitelist, ...).
 * 
 * \param message Receives full message.
 * \param sender Sender of the message.
 * \param sendResponse Function for sending response.
 */
function commonMessageListener(message, sender, sendResponse)
{
	//Message came from options.js, updated whitelist
	if (message.message === "whitelist updated")
	{
		//actualize current doNotBlockHosts from storage
		browser.storage.sync.get(["whitelistedHosts"], function(result){
			doNotBlockHosts = result.whitelistedHosts;
		});
	}
	//Mesage came from popup.js, whitelist this site
	else if (message.message === "add site to whitelist")
	{
			//Obtain current hostname and whitelist it
			var currentHost = message.site;
			doNotBlockHosts[currentHost] = true;
			browser.storage.sync.set({"whitelistedHosts":doNotBlockHosts});
	}
	//Message came from popup.js, remove whitelisted site
	else if (message.message === "remove site from whitelist")
	{
			//Obtain current hostname and remove it
			currentHost = message.site;
			delete doNotBlockHosts[currentHost];
			browser.storage.sync.set({"whitelistedHosts":doNotBlockHosts});
	}
	//HTTP request shield was turned on
	else if (message.message === "turn request shield on")
	{
		//Hook up the listeners
		browser.webRequest.onBeforeSendHeaders.addListener(
			beforeSendHeadersListener,
			{urls: ["<all_urls>"]},
			["blocking", "requestHeaders"]
		);

		if (typeof onResponseStartedListener === "function")
		{
			browser.webRequest.onResponseStarted.addListener(
			onResponseStartedListener,
			{urls: ["<all_urls>"]},
			["responseHeaders"]
			);
		}
	}
	//HTTP request shield was turned off
	else if (message.message === "turn request shield off")
	{
		//Disconnect the listeners
		browser.webRequest.onBeforeSendHeaders.removeListener(beforeSendHeadersListener);
		
		if (typeof onResponseStartedListener === "function")
		{
			browser.webRequest.onResponseStarted.removeListener(onResponseStartedListener);
		}
	}
}
