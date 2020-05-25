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

// Implementation of HTTP webRequest shield, file: http_shield_firefox.js
// Contains Firefox specific functions
// Event handlers for webRequest API, notifications and messaging

//Hooking up the messageListener to message event
browser.runtime.onMessage.addListener(messageListener);

//Check the storage for requestShieldOn object
browser.storage.sync.get(["requestShieldOn"], function(result){
  //If found object is true or undefined, turn the requestShieldOn
  if (result.requestShieldOn == undefined || result.requestShieldOn)
  {
    //Hookup the event handler for event onBeforeSendHeaders from webRequest API
    browser.webRequest.onBeforeSendHeaders.addListener(
      beforeSendHeadersListener,
      {urls: ["<all_urls>"]},
      ["blocking", "requestHeaders"]
    );
  }
});

//webRequest event listener
//Listens to onBeforeSendHeaders event, receives detail of HTTP request in requestDetail
//Catches the request, analyzes it's origin and target URLs and blocks it/permits it based
//on their IP adresses. Requests coming from public IP ranges targeting the private IPs are
//blocked by default. Others are permitted by default.
async function beforeSendHeadersListener(requestDetail) {  
  //If either of information is undefined, permit it 
  //originUrl happens to be undefined for the first request of the page loading the document itself
  if (requestDetail.originUrl === undefined || requestDetail.url === undefined)
  {
    return {cancel:false};
  } 
  var sourceUrl = new URL(requestDetail.originUrl);
  var fullSourceDomain = sourceUrl.hostname;
  //Removing www. from hostname, so the hostnames are uniform
  sourceUrl.hostname = sourceUrl.hostname.replace(/^www\./,''); 

  var targetUrl = new URL(requestDetail.url);
  var fullTargetDomain = targetUrl.hostname;
  //Removing www. from hostname, so the hostnames are uniform
  targetUrl.hostname = targetUrl.hostname.replace(/^www\./,'');

  var targetIP;
  var sourceIP;
  var isSourcePrivate = false;
  var isDestinationPrivate = false;
  var destinationResolution = "";
  var sourceResolution = "";

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
    //Resoluting DNS query for source domain
    sourceResolution = browser.dns.resolve(fullSourceDomain).then((val) =>
    {
      //Assigning source IPs
      sourceIP = val;
      //More IPs could have been found, for each of them
      for (let ip of sourceIP.addresses)
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
    });
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
    //Resoluting DNS query for destination domain
    destinationResolution = browser.dns.resolve(fullTargetDomain).then((val) =>
    {
      //Assigning source IPs
      targetIP = val;
      //More IPs could have been found, for each of them
      for (let ip of targetIP.addresses)
      {
        //Checking type
        if (isIPV4(ip))
        {   
           //Checking privacy
           if (isIPV4Private(ip))
           {
              isDestinationPrivate = true;
           }
        }
        else if (isIPV6(ip))
        {
          if (isIPV6Private(ip))
          {
            isDestinationPrivate = true;
          }
        }
      }
    });
  }  
  //Wait till all DNS resolutions are done, because its neccessary for upcoming actions
  await Promise.all([sourceResolution, destinationResolution]);

  //Blocking direction Public -> Private
  if (!isSourcePrivate && isDestinationPrivate)
  {
    notify(sourceUrl.hostname, targetUrl.hostname, requestDetail.type);
    return {cancel:true}
  } 
  else //Permitting others
  {
    return {cancel: false};
  }
}

//Function that works with webExtensions notifications
//Creates notification about blocked request
//Arguments:
//  origin - origin of the request
//  target - target of the request
//  resource - type of the resource
function notify(origin, target, resource) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("img/icon-48.png"),
    "title": "Blocked suspicious request!",
    "message": "Request from originUrl " + origin + " to targetUrl " + target + " was blocked. If it's unwanted behaviour, please go to options and add an exception."
  });
}

//Event listener hooked up to webExtensions onMessage event
//Receives full message in message,
//sender of the message in sender,
//function for sending response in sendResponse
//Does appropriate action based on message
async function messageListener(message, sender, sendResponse)
{
  //Message came from options.js, updated whitelist
  if (message.message === "whitelist updated")
  {
    //actualize current doNotBlockHosts from storage
    browser.storage.sync.get(["whitelistedHosts"], function(result){
      doNotBlockHosts = result.whitelistedHosts;
    });
  }
  //Message came from option.js, request shield was turned on
  else if (message.message === "turn request shield on")
  {
    //Hook up the event handler
    browser.webRequest.onBeforeSendHeaders.addListener(
      beforeSendHeadersListener,
      {urls: ["<all_urls>"]},
      ["blocking", "requestHeaders"]
    );
  }
  //Message came from option.js, request shield was turned off
  else if (message.message === "turn request shield off")
  {
    //Remove event handler from onBeforeSendHeaders event
    browser.webRequest.onBeforeSendHeaders.removeListener(beforeSendHeadersListener);
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
      return Promise.resolve("current site is whitelisted");
    }
    else
    {
      return Promise.resolve("current site is not whitelisted");
    }
  }
}
