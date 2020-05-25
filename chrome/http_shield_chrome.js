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

//Associative array of hosts, that are currently blocked based on their previous actions
var blockedHosts = new Object();
//Information about hosts, for which cant be used DNS query
var hostStatistics = new Object();

//Percentage of hosts, that can register an HTTP error response
var uniqueErrorHostsRatio = 10.0;
//If there are more hosts than uniqueErrorHostsLimit which are targeted from the same origin, the origin host becomes blocked
var uniqueErrorHostsLimit = 20;
//Number of Request Timed Out errors allowed for one origin
var errorsAllowed = 10;
//Number of HTTP client errors (eg. 404 not found, 403 forbidden etc.) per requestTimeInterval
var httpClientErrorsAllowed = 5;

//Errors that are considered as possible attacker threat
var httpErrorList = {400:true, 404:true, 405:true, 406:true, 408:true, 410:true, 413:true, 414:true, 415:true, 501:true, 503:true, 505:true};

//String that defines Request Timed Out error in Chrome
//according to: https://developer.chrome.com/extensions/webRequest#event-onErrorOccurred
//It's not backwards compatible, but it's the best we have
var chromeErrorString = "net::ERR_CONNECTION_TIMED_OUT";

//If the browser regained connectivity - came online
window.addEventListener("online", function()
{
  //Hook up the listener to the onErrorOccured webRequest event
  browser.webRequest.onErrorOccurred.addListener(
      onErrorOccuredListener,
      {urls: ["<all_urls>"]}
    );
});

//If the browser lost connectivity - gone offline
window.addEventListener("offline", function()
{
  //Disconnect the listener from the onErrorOccured webRequest event
  browser.webRequest.onErrorOccurred.removeListener(onErrorOccuredListener);
});

//Check the storage for requestShieldOn boolean
browser.storage.sync.get(["requestShieldOn"], function(result){
  //If not found (initialization) or true
  if (result.requestShieldOn == undefined || result.requestShieldOn)
  {
    //Hook up the listeners
    browser.webRequest.onBeforeSendHeaders.addListener(
      beforeSendHeadersListener,
      {urls: ["<all_urls>"]},
      ["blocking", "requestHeaders"]
    );

    browser.webRequest.onHeadersReceived.addListener(
      onHeadersReceivedRequestListener,
      {urls: ["<all_urls>"]},
      ["blocking"]
    );

    browser.webRequest.onErrorOccurred.addListener(
      onErrorOccuredListener,
      {urls: ["<all_urls>"]}
    );
  }
});

//Hook up the listener for receiving messages
browser.runtime.onMessage.addListener(messageListener);

//webRequest event listener, hooked to onErrorOccured event
//Catches all errors, checks them for Request Timed out errors
//Iterates error counter, blocks the host if limit was exceeded
//Takes object representing error in responseDetails variable
function onErrorOccuredListener(responseDetails) {
  
  //It's neccessary to have both of these defined, otherwise the error can't be analyzed
  if (responseDetails.initiator === undefined || responseDetails.url === undefined)
  {
    return {cancel:false};
  }
  var sourceUrl = new URL(responseDetails.initiator);
  //Removing www. from hostname, so the hostnames are uniform
  sourceUrl.hostname = sourceUrl.hostname.replace(/^www\./,''); 
  var targetUrl = new URL(responseDetails.url);
  targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');

  //Host found among user's trusted hosts, allow it right away
  if (checkWhitelist(sourceUrl.hostname))
  {
    return {cancel:false};
  }
  //Host found among user's untrusted, thus blocked, hosts, blocking it without further actions
  if (blockedHosts[sourceUrl.hostname] != undefined)
  {
    return {cancel:true};
  }

  //If the error is TIMED_OUT -> access to non-existing IP
  if (responseDetails.error == chromeErrorString)
  {
    //Count erros for given host
    if (hostStatistics[sourceUrl.hostname] != undefined)
    {
      hostStatistics[sourceUrl.hostname]["errors"] += 1;
    }
    else
    {
      hostStatistics[sourceUrl.hostname] = insertHostInStats(targetUrl.hostname);
      hostStatistics[sourceUrl.hostname]["errors"] = 1;
    }
    //Block the host if the error limit was exceeded
    if(hostStatistics[sourceUrl.hostname]["errors"] > errorsAllowed)
    {
      notifyBlockedHost(sourceUrl.hostname);
      blockedHosts[sourceUrl.hostname] = true;
    }

  }
  return {cancel:false};
}

//webRequest event listener, hooked to onErrorOccured event
//Catches all responses, analyzes those with record in hostStatistics
//Modifies counters, blocks if one of the limits was exceeded
function onHeadersReceivedRequestListener(headers)
{
  //It's neccessary to have both of these defined, otherwise the response can't be analyzed
  if (headers.initiator === undefined || headers.url === undefined)
  {
    return {cancel:false};
  }
  
  var sourceUrl = new URL(headers.initiator);
  //Removing www. from hostname, so the hostnames are uniform
  sourceUrl.hostname = sourceUrl.hostname.replace(/^www\./,''); 
  var targetUrl = new URL(headers.url);
  targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');

  //Host found among user's trusted hosts, allow it right away
  if (checkWhitelist(sourceUrl.hostname))
  {
    return {cancel:false};
  }

  //Host found among user's untrusted, thus blocked, hosts, blocking it without further actions
  if (blockedHosts[sourceUrl.hostname] != undefined)
  {
    return {cancel:true};
  }
  
  //If it's the error code that exists in httpErrorList
  if (httpErrorList[headers.statusCode] != undefined)
  {
    //Obtain record for given origin from statistics array
    //Record has to be there already, because it was inserted there while
    //encountering the request from this origin
    var currentHost = hostStatistics[sourceUrl.hostname];

    //Check if the target domain was already encountered for this source origin
    if (currentHost[targetUrl.hostname] != undefined)
    {
      //If so, iterate http errors variable for this origin and target domain
      currentHost[targetUrl.hostname]["httpErrors"] += 1;
      //If it's firt error from this target
      if(!currentHost[targetUrl.hostname]["hadError"])
      { 
        //Iterate global counter for this source origin
        currentHost["httpErrors"] += 1;
        //Set that we've seen the error from this target already
        currentHost[targetUrl.hostname]["hadError"] = true;

        //Allow atleast one error hosts, if 10% ratio is less than one error host
        //Set hosts to 10, if there are less than 10 hosts
        var hosts = currentHost["hosts"] < uniqueErrorHostsRatio ? uniqueErrorHostsRatio : currentHost["hosts"];
        var errors = currentHost["httpErrors"];
        var errorRatio =  errors*1.0 / hosts * 100;
        //If the ratio, or the fixed limit for source origin was exceeded
        if (errorRatio > uniqueErrorHostsRatio || errors > uniqueErrorHostsLimit)
        {
          //Block the origin
          notifyBlockedHost(sourceUrl.hostname);
          blockedHosts[sourceUrl.hostname] = true;
          return {cancel:true};
        }
      }
      //If the limit for http error response from target host was exceeded
      if(currentHost[targetUrl.hostname]["httpErrors"] > httpClientErrorsAllowed)
      {
        //Block the origin
        notifyBlockedHost(sourceUrl.hostname);
        blockedHosts[sourceUrl.hostname] = true;
        return {cancel:true};
      }
    }
  }
  //Successful response
  else if ((headers.statusCode >= 100) && (headers.statusCode < 400))
  {
    //Obtain record for given origin from statistics array
    var currentHost = hostStatistics[sourceUrl.hostname];
    //Check if we've seen this target for given source origin
    if (currentHost[targetUrl.hostname] != undefined)
    {
      //if so, check if it's the first successful response from this target URL
      if (currentHost[targetUrl.hostname]["successfulResponses"][targetUrl] === undefined)
      {
        //If so, note that we've seen this URL already
        currentHost[targetUrl.hostname]["successfulResponses"][targetUrl] = 1;
        //Decrement the counter
        currentHost[targetUrl.hostname]["httpErrors"] -= 0.5;
      }
      else
      {
        currentHost[targetUrl.hostname]["successfulResponses"][targetUrl] += 1;
      }

      //Normalize the number, if it's less than zero
      if (currentHost[targetUrl.hostname]["httpErrors"] < 0)
          currentHost[targetUrl.hostname]["httpErrors"] = 0;
    }
  }  
  return {cancel:false};
}

//Function that creates object representing source host
//Recieves target hostname in targetDomain argument
function insertHostInStats(targetDomain)
{
  var currentHost = new Object();
  currentHost[targetDomain] = new Object();
  currentHost[targetDomain]["requests"] = 1;
  currentHost[targetDomain]["httpErrors"] = 0;
  currentHost[targetDomain]["hadError"] = false;
  currentHost[targetDomain]["successfulResponses"] = new Object();
  currentHost["hosts"] = 1;
  currentHost["requests"] = 1;
  currentHost["httpErrors"] = 0;
  currentHost["errors"] = 0;

  return currentHost;
}

//webRequest event listener, hooked to onBeforeSendHeaders event
//Catches all requests, analyzes them, does blocking,
//modifies counters, blocks if one of the limits was exceeded
function beforeSendHeadersListener(requestDetail) {

  //It's neccessary to have both of these defined, otherwise the response can't be analyzed
  if (requestDetail.initiator === undefined || requestDetail.url === undefined)
  {
    return {cancel:false};
  }

  var sourceUrl = new URL(requestDetail.initiator);
  //Removing www. from hostname, so the hostnames are uniform
  sourceUrl.hostname = sourceUrl.hostname.replace(/^www\./,''); 
  var targetUrl = new URL(requestDetail.url);
  targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');

  var isSourcePrivate = false;
  var isDestinationPrivate = false;

  //Host found among user's trusted hosts, allow it right away
  if (checkWhitelist(sourceUrl.hostname))
  {
    return {cancel:false};
  }

  //Host found among user's untrusted, thus blocked, hosts, blocking it without further actions
  if (blockedHosts[sourceUrl.hostname] != undefined)
  {
    return {cancel:true};
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
      //Source is IPv4 private
      isSourcePrivate = true;
    }
  }
  else //SOURCE is hostname
  {
      //Checking if target URL is IPv4 private or IPv6 private
      if ((isIPV4(targetUrl.hostname) && isIPV4Private(targetUrl.hostname)) || (isIPV6(targetUrl.hostname) && isIPV6Private(targetUrl.hostname)))
      {
          //If so, block the request - strict
          notifyBlockedRequest(sourceUrl.hostname, targetUrl.hostname, requestDetail.type);
          return {cancel:true};
      }
      //Target is either host name or public IP
      var currentHost = hostStatistics[sourceUrl.hostname];

      //If its the first time we're seeing this source host
      if (currentHost == undefined)
      {
        currentHost = insertHostInStats(targetUrl.hostname);
        hostStatistics[sourceUrl.hostname] = currentHost;
        return {cancel:false};
      }
      //Check if we've seen this target for this source host
      if (currentHost[targetUrl.hostname] != undefined)
      {
        currentHost[targetUrl.hostname].requests += 1;
      }
      else //If not, just insert the stats
      {
        currentHost[targetUrl.hostname] = new Object();
        currentHost[targetUrl.hostname]["requests"] = 1;
        currentHost[targetUrl.hostname]["httpErrors"] = 0;
        currentHost[targetUrl.hostname]["hadError"] = false;
        currentHost[targetUrl.hostname]["successfulResponses"] = new Object();
        currentHost["hosts"] += 1;
      }
      return {cancel:false};
  }
  //Check the target domain
  if (isIPV4(targetUrl.hostname))
  {
    if (isIPV4Private(targetUrl.hostname))
    {
      //Its private IPv4
      isDestinationPrivate = true;
    }
  }
  else if(isIPV6(targetUrl.hostname))
  {
    if (isIPV6Private(targetUrl.hostname))
    {
      //Its private IPv6
      isDestinationPrivate = true;
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

//Creates and presents notification to the user
//works with webExtensions notification API
function notifyBlockedRequest(origin, target, resource) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("img/icon-48.png"),
    "title": "Blocked suspicious request!",
    "message": "Request from originUrl " + origin + " to targetUrl " + target + " was blocked. If it's unwanted behaviour, please go to options and add an exception."
  });
}

//Creates and presents notification to the user
//works with webExtensions notification API
function notifyBlockedHost(host) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("img/icon-48.png"),
    "title": "Host was blocked!",
    "message": "Host: " + host + " was blocked based on suspicious actions. If it's unwanted behaviour, please add an exception in options or popup."
  });
}

//webRequest event listener, hooked to onMessage event
//obtains message string in message, message sender in sender
//and function for sending response in sendResponse
//Does approriate action based on message text
function messageListener(message, sender, sendResponse)
{
  //Message sent from options.js, whitelist was updated
  if (message.message === "whitelist updated")
  {
    //Updating whitelist from storage
    browser.storage.sync.get(["whitelistedHosts"], function(result){
      doNotBlockHosts = result.whitelistedHosts;
    });
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

    browser.webRequest.onHeadersReceived.addListener(
    onHeadersReceivedRequestListener,
    {urls: ["<all_urls>"]},
    ["blocking"]
    );

    browser.webRequest.onErrorOccurred.addListener(
      onErrorOccuredListener,
      {urls: ["<all_urls>"]}
    );
  }
  //HTTP request shield was turned off
  else if (message.message === "turn request shield off")
  {
    //Disconnect the listeners
    browser.webRequest.onBeforeSendHeaders.removeListener(beforeSendHeadersListener);
    browser.webRequest.onHeadersReceived.removeListener(onHeadersReceivedRequestListener);
    browser.webRequest.onErrorOccurred.removeListener(onErrorOccuredListener);
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
  //Message came from popup,js, asking whether is this site whitelisted
  else if (message.message === "is current site whitelisted?")
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

