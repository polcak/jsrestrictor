/** \file
 * \brief Functions that help to automate process of building wrapping code for FPD module
 *
 *  \author Copyright (C) 2021  Marek Salon
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

/**
 * \defgroup FPD Fingerprinting Detector
 *
 * \brief Fingerprinting Detector (FPD) is a module that detects browser fingerprint extraction and prevents
 * its sharing. To learn more about Browser Fingerprinting topic, see study "Browser Fingerprinting: A survey" available
 * here: https://arxiv.org/pdf/1905.01051.pdf
 *
 * The FPD module uses wrapping technique to inject logic that allows log API calls and accesses for every visited web page
 * and its frames. Logged JS APIs can be specified in wrappers-lvl_X.json file, where X represents corresponding JShelter level.
 * 
 * Detector of fingeprinting activity is based on chosen heuristics that can be defined in form of API groups. Groups represents
 * a set of APIs that have similar but specific purpose. Access to group is triggered when a certain amount APIs is accessed. 
 * Hierarchy of groups creates a tree structure, where access to root group means fingerprinting activity. Groups can be configured in
 * groups-lvl_X.json file, where X represents corresponding JShelter level.
 *
 * The FPD evaluate API groups with every request made in scope of certain browser tab. When FPD detects fingerprinting activity, 
 * blocking of subsequent requests is issued. Local browsing data of fingerprinting origin are cleared to prevent caching extracted 
 * fingerprint in local browser storage.
 * 
 */

 /** \file
 *
 * \brief This file is part of Fingerprinting Detector (FPD) and contains API groups evaluation logic. File also contains
 * event listeners used for API logging, requests blocking and tabs management. 
 *
 * \ingroup FPD
 */

/**
 * FPD enable flag. Evaluate only when active.
 */
 var fpDetectionEnabled;

 /**
 * Associtive array of hosts, that are currently among trusted ones.
 */
var fpdWhitelist = {};

/**
 * API logs database of following structure:
 * 		"resource" : {
 * 			"tabId" : {
 * 				"type" : {
 * 					arguments {
 * 						arg : "access count"
 *					},
 *					total : "total access count"
 *				}
 *			}
 *		}
 *
 *	*values in quotations are substituted by concrete names				
 *
 */
var fpDb = new Observable();

/**
 *  Stores latest evaluation statistics for every examined tab. This statistics contains data about accessed groups and resources
 *  and their weights after evaluation. It can be used for debugging or as an informative statement in GUI.
 * 	It also contains flag for every tab to limit number of notifications.
 */
var latestEvals = {};

/**
 *  Parsed groups object containing necessary group information needed for evaluation.
 * 	Groups are indexed by level and name for easier and faster access.
 */
var fpGroups = {};

/**
 *  Object containing information about unsupported wrappers for given browser.
 */
var unsupportedWrappers = {};

/**
 *  Array containing names of unsupported wrappers that should be treated like supported ones during groups evaluation.
 */
var exceptionWrappers = ["CSSStyleDeclaration.prototype.fontFamily"];

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
// fill up fpGroups object with necessary data for evaluation
for (let groupsLevel in fp_levels.groups) {
	fpGroups[groupsLevel] = fpGroups[groupsLevel] || {};
	processGroupsRecursive(fp_levels.groups[groupsLevel], groupsLevel);
}
// load enabled flag from storage
browser.storage.sync.get(["fpDetectionOn"]).then(function(result) {
	if (result.fpDetectionOn != undefined)
		fpDetectionEnabled = result.fpDetectionOn;
});

// load fpd whitelist from storage
browser.storage.sync.get(["fpdWhitelist"]).then(function(result) {
	if (result.fpdWhitelist != undefined)
		fpdWhitelist = result.fpdWhitelist;
});

// take care of unsupported resources for cross-browser behaviour uniformity
balanceUnsupportedWrappers();
/// \endcond

/**
 * The function transforming recursive groups definition into indexed fpGroups object.
 *
 * \param input Group object from loaded JSON format.
 * \param groupsLevel Level ID of groups to process.
 */
function processGroupsRecursive(input, groupsLevel) {
	fpGroups[groupsLevel][input.name] = {};
	fpGroups[groupsLevel][input.name]["description"] = input["description"] || "";
	
	// criteria missing => set implicit criteria
	fpGroups[groupsLevel][input.name]["criteria"] = input["criteria"] || [{value:1, weight:1}];
	fpGroups[groupsLevel][input.name]["items"] = {};

	// retrieve associated resources (wrappers) for input group 
	for (let resourceObj of fp_levels.wrappers[groupsLevel]) {
		if (resourceObj.groups.filter((x) => (x.group == input.name)).length > 0) {
			fpGroups[groupsLevel][input.name]["items"][resourceObj.resource] = resourceObj.type;
		}
	}

	// retrieve associated sub-groups for given input group and process them recursively
	if (input["groups"]) {
		for (let groupObj of input["groups"]) {
			fpGroups[groupsLevel][input.name]["items"][groupObj.name] = "group";
			processGroupsRecursive(groupObj, groupsLevel);
		}
	}
}

/* 
 * --------------------------------------------------
 * 				CRITERIA CORRECTION
 * --------------------------------------------------
 */

/**
 * This function provides ability to balance/optimalize evaluation heuristics for cross-browser behaviour uniformity.
 * It checks which resources are unsupported for given browser and adjust criteria of loaded FPD configuration accordingly.
 */
function balanceUnsupportedWrappers() {
	// object containing groups effected by criteria adjustment and corresponding deleted subgroups
	var effectedGroups = {};

	// check supported wrappers for each level of FPD configuration
	for (let level in fp_levels.wrappers) {
		unsupportedWrappers[level] = [];
		effectedGroups = {};

		// find out which wrappers are unsupported and store them in "unsupportedWrappers" object
		for (let wrapper of fp_levels.wrappers[level]) {
			// split path of object from its name
			var resourceSplitted = split_resource(wrapper.resource);
			
			// access nested object in browser's "window" object using path string
			var resolvedPath = resourceSplitted["path"].split('.').reduce((o, p) => o ? o[p] : undefined, window);

			// if resource or resource path is undefined -> resource unsupported && no exception for the resource
			if (!(resolvedPath && resourceSplitted["name"] in resolvedPath) && !exceptionWrappers.includes(wrapper.resource)) {
				// store wrapper object to "unsupportedWrappers" object
				unsupportedWrappers[level].push(wrapper);

				// mark all groups as effected if containing unsupported resource
				for (let groupObj of wrapper.groups) {
					effectedGroups[groupObj.group] = effectedGroups[groupObj.group] || [];
				}

				// remove wrapper from FPD configuration (in "fp_levels")
				fp_levels.wrappers[level] = fp_levels.wrappers[level].filter((x) => (x != wrapper));
			}
		}

		// adjust/correct effected groups criteria
		correctGroupCriteria(fp_levels.groups[level], effectedGroups, level);
	}

	// refresh "fpGroups" object after criteria adjustment for upcoming evaluations
	for (let groupsLevel in fp_levels.groups) {
		fpGroups[groupsLevel] = {};
		processGroupsRecursive(fp_levels.groups[groupsLevel], groupsLevel);
	}
}

/**
 * The function that corrects groups criteria according to unsupported wrappers.
 * Groups should be deleted when more than half of weights (resources) cannot be obtained in the same group (whole group is invalidated).
 * Groups criteria of "value" type are also recomputed to take into account unsupported resources and deleted groups/subgroups.
 * 
 * \param rootGroup Group object of certain level from FPD configuration (in "fp_levels.wrappers" format).
 * \param effectedGroups Object containing groups effected by criteria adjustment and corresponding deleted subgroups.
 * \param level FPD configuration level identifier.
 *
 * \returns true if group should be deleted because of unsupported wrappers
 * \returns false if group don't need to be deleted
 */
function correctGroupCriteria(rootGroup, effectedGroups, level) {
	// if rootGroup has subgroups, then process all subgroups recursively
	if (rootGroup.groups) {
		for (let groupIdx in rootGroup.groups) {			
			// if correctGroupCriteria return true, subgroup is deleted
			if (correctGroupCriteria(rootGroup.groups[groupIdx], effectedGroups, level)) {
				// rootGroup is now also effected and added to "effectedGroups" with deleted subgroup
				effectedGroups[rootGroup.name] = effectedGroups[rootGroup.name] || [];
				effectedGroups[rootGroup.name].push(rootGroup.groups[groupIdx].name);
			}

			// rootGroup is effected because at least one of its child was effected too
			if (Object.keys(effectedGroups).includes(rootGroup.groups[groupIdx].name)) {
				effectedGroups[rootGroup.name] = effectedGroups[rootGroup.name] || [];		
			}
		}

		// remove deleted subgroups from original group object
		if (effectedGroups[rootGroup.name]) {
			rootGroup.groups = rootGroup.groups.filter((x) => (!effectedGroups[rootGroup.name].includes(x.name)))
		}
	}

	// if group is effected, try to correct its criteria
	if (Object.keys(effectedGroups).includes(rootGroup.name)) {
		// original sum of max weights of direct children
		var maxOriginalWeight = 0;
		
		// sum of max weights after deletion of unsupported wrappers
		var maxNewWeight = 0;
		
		// get values of "maxOriginalWeight" and "maxNewWeight"
		for (let resource in fpGroups[level][rootGroup.name].items) {
			// if resource is subgroup
			if (fpGroups[level][rootGroup.name].items[resource] == "group") {
				let maxWeight = fpGroups[level][resource].criteria.reduce((x, {weight}) => (x > weight ? x : weight), 0);
				
				maxOriginalWeight += maxWeight;
				maxNewWeight += !effectedGroups[rootGroup.name].includes(resource) ? maxWeight : 0;
			}
			// if resource is property or function
			else {
				// specific resource object from FPD configuration of wrappers
				var resourceObj;

				// array of groups where resource can be found
				var groupsArray;

				// flag - resource is supported (resource found in "fp_levels.wrappers" instead of "unsupportedWrappers")
				var supported = false;

				// get resource from wrappers and extract all group objects in context of parent group (rootGroup)
				if (resourceObj = fp_levels.wrappers[level].filter((x) => (x.resource == resource))[0]) {
					groupsArray = resourceObj.groups.filter((x) => (x.group == rootGroup.name));
					supported = true;
				}
				else {
					resourceObj = unsupportedWrappers[level].filter((x) => (x.resource == resource))[0];
					groupsArray = resourceObj.groups.filter((x) => (x.group == rootGroup.name));
				}

				// get maximal obtainable weight for resource from every group object
				for (let groupObj of groupsArray) {
					if (groupObj.criteria && groupObj.criteria.length > 0) {
						let maxWeight = groupObj.criteria.reduce((x, {weight}) => (x > weight ? x : weight), 0);
						
						maxOriginalWeight += maxWeight;
						maxNewWeight += supported ? maxWeight : 0;
					}
					else {
						maxOriginalWeight += 1;
						maxNewWeight += supported ? 1 : 0;
					}
				}
			}
		}

		// adjust "value" criteria to follow their original percentage state
		for (let criterion of fpGroups[level][rootGroup.name].criteria) {
			if ("value" in criterion) {
				// original percentage of given criterion
				var percValue = (criterion.value*100) / maxOriginalWeight;

				// get new criterion value adjusted for new max weights
				criterion.value = Math.round((percValue*maxNewWeight) / 100);
			}
		}
		
		// if sum of max weights of unsupported resources is higher than 50% of total original weights
		// in this case, group should be deleted or manually corrected in FPD configuration to contain only supported resources
		if (2*maxNewWeight < maxOriginalWeight) {
			return true;
		}
		return false;
	}
}

/* 
 * --------------------------------------------------
 * 				GROUPS EVALUATION
 * --------------------------------------------------
 */

/**
 * The function initializing evaluation of logged API calls (fpDb) according to groups criteria (fpGroups).
 *
 * \param tabId Integer number representing ID of browser tab that is going to be evaluated.
 *
 * \returns 0 if no fingerprinting activity detected, otherwise weight value of root group
 */
function evaluateGroups(tabId) {
	// get url of evaluated tab
	var url = availableTabs[tabId] ? availableTabs[tabId].url : "";

	// inaccesible or invalid url - do not evaluate
	if (!url) {
		return 0;
	}
	
	// clear old evalStats
	latestEvals[tabId] = latestEvals[tabId] || {};
	latestEvals[tabId].evalStats = [];

	// get level for tab url to determine valid group criteria
	var level = getCurrentLevelJSON(url)[0].level_id;

	// check if the level exists within FPD configuration, if not use default FPD configuration
	level = fp_levels.groups[level] ? level : "default";

	// getting root group name as a start point for recursive evaluation
	var rootGroup = fp_levels.groups[level] ? fp_levels.groups[level].name : undefined;
	
	// start recursive evaluation if all needed objects are defined
	if (rootGroup && fpGroups[level] && fp_levels.wrappers[level]) {
		return evaluateGroupsCriteria(rootGroup, level, tabId)[0].actualWeight;
	}

	return 0;
}

/**
 * The function that evaluates group criteria according to evaluation of its child items (groups/resources).
 *
 * \param rootGroup Group name that needs to be evaluated.
 * \param level Level ID of groups and wrappers used for evaluation.
 * \param tabId Integer number representing ID of evaluated browser tab.
 *
 * \returns Array that contains "Result" objects
 * 
 * Result object contains following properties:
 * 		actualWeight (Obtained weight value of group after evaluation)
 * 		maxWeight (Maximum obtainable weight value of group)
 * 		type (Type of group item - group/call/get/set)
 * 		accesses (Number of accesses to specified resource - groups always 0)
 */
function evaluateGroupsCriteria(rootGroup, level, tabId) {
	// result object that is delegated to parent group
	var res = {};

	// all result objects from child items of rootGroup
	var scores = [];

	// array of relevant criteria based on groupTypes
	var relevantCriteria = [];

	// types of criteria that are relevant for evaluating rootGroup
	var groupTypes = [];
	
	// evaluate every item of rootGroup and add result objects to scores array
	for (let item in fpGroups[level][rootGroup].items) {
		if (fpGroups[level][rootGroup].items[item] == "group") {
			scores = scores.concat(evaluateGroupsCriteria(item, level, tabId));
		}
		else {
			scores = scores.concat(evaluateResourcesCriteria(item, rootGroup ,level, tabId));
		}	
	}

	/*
	 Group type is determined by first criteria object:
		- access - evaluation of child items is based on sum of accesses
		- value/percentage - evaluation of child items is based on sum of weights or percentage of sum of maxWeights
	*/
	groupTypes = Object.keys(fpGroups[level][rootGroup].criteria[0]).includes("access") ? ["access"] : ["value", "percentage"];
	relevantCriteria = fpGroups[level][rootGroup].criteria.filter((x) => (groupTypes.some((y) => (Object.keys(x).includes(y)))));

	// now evaluating group
	res.type = "group";
	
	// get maximal obtainable weight for rootGroup
	res.maxWeight = fpGroups[level][rootGroup].criteria.reduce((x, {weight}) => (x > weight ? x : weight), 0);

	// compute actualWeight of rootGroup with value of acsesses
	res.accesses = 0;
	res.actualWeight = 0;
	if (groupTypes.length == 2) {
		// groupTypes contains "value" and "percetange" - take weight of child items into account
		var actualWeightsSum = scores.reduce((x, {actualWeight}) => (x + actualWeight), 0);
		var maxWeightsSum = scores.reduce((x, {maxWeight}) => (x + maxWeight), 0);
		
		// recalculate percentage values of relevant criteria to exact values
		var relativeCriteria = [];
		for (let criteriaObj of relevantCriteria) {
			if (criteriaObj.value) {
				relativeCriteria.push(criteriaObj);
			}
			else {
				relativeCriteria.push({
					value: Math.round(maxWeightsSum * (criteriaObj.percentage/100)),
					weight: criteriaObj.weight
				});
			}
		}

		// sort relevant and relative criteria by value
		relativeCriteria.sort((x, y) => (x.value - y.value));
		
		// filter criteria and take weight of highest achieved criteria
		var filteredCriteria = relativeCriteria.filter((x) => (x.value <= actualWeightsSum)).reverse()[0];
		res.actualWeight = filteredCriteria ? filteredCriteria.weight : 0;
	}
	else {
		// groupTypes contains "access" - take access of child items into account
		var accessesSum = scores.reduce((x, {accesses}) => (x + accesses), 0);

		// sort relevant criteria
		relevantCriteria.sort((x, y) => (x.access - y.access));

		// filter criteria and take weight of highest achieved criteria
		var filteredCriteria = relevantCriteria.filter((x) => (x.access <= accessesSum)).reverse()[0];
		res.actualWeight = filteredCriteria ? filteredCriteria.weight : 0;
	}

	// if group access was triggered (have some weight), save it to evalStats
	if (res.actualWeight) {
		latestEvals[tabId].evalStats.push({ 
			title: rootGroup,
			type: "group",
			weight: res.actualWeight
		});
	}

	return [res];
}

/**
 * The function that evaluates resource (wrapper) criteria according to API calls logs.
 *
 * \param resource Full name of resource/wrapper.
 * \param groupName Name of direct parent group.
 * \param level Level ID of groups and wrappers used for evaluation.
 * \param tabId Integer number representing ID of evaluated browser tab.
 *
 * \returns Array that contains "Result" objects
 * 
 * Result object contains following properties (all of them in context of parent group):
 * 		actualWeight (Obtained weight value of resource after evaluation)
 * 		maxWeight (Maximum obtainable weight value of resource)
 * 		type (Type of resource - call/get/set)
 * 		accesses (Number of accesses to specified resource)
 */
function evaluateResourcesCriteria(resource, groupName, level, tabId) {	
	// all result objects for given resource (set/get/call)
	var scores = [];

	// get resource from wrappers and extract all group objects in context of parent group (groupName)
	var resourceObj = fp_levels.wrappers[level].filter((x) => (x.resource == resource))[0];
	var groupsArray = resourceObj.groups.filter((x) => (x.group == groupName));

	// evaluate every retrieved group object 
	for (let groupObj of groupsArray) {
		// initialize new result object
		var res = {}
		
		// get resource type from group object (get/set/call)
		if (resourceObj.type == "property") {
			if (groupObj.property) {
				res.type = groupObj.property
			}
			else {
				// property not defined => implicit get
				res.type = "get";
			}
		}
		else {
			res.type = "call"
		}

		// get maximal obtainable weight for resource from group object
		if (groupObj.criteria && groupObj.criteria.length > 0) {
			res.maxWeight = groupObj.criteria.reduce((x, {weight}) => (x > weight ? x : weight), 0);
		}
		else {
			// criteria not defined => set implicit criteria
			res.maxWeight = 1;
			groupObj.criteria = [{value: 1, weight: 1}];
		}
		
		// compute actualWeight of resource in context of parent group from logs located in fpDb object
		res.actualWeight = 0;
		if (fpDb[resource] && fpDb[resource][tabId] && fpDb[resource][tabId][res.type]) {
			// logs for given resource and type exist
			if (groupObj.arguments) {
				// if arguments logging is defined, evaluate resource accordingly
				
				if (groupObj.arguments == "diff") {
					// "diff" - accesses depend on number of different arguments
					res.accesses = Object.keys(fpDb[resource][tabId][res.type].args).length;		
				}
				else if (groupObj.arguments == "same") {
					// "same" - accesses depend on maximum number of same arguments calls
					res.accesses = Object.values(fpDb[resource][tabId][res.type].args).reduce((x, y) => x > y ? x : y);
				}
				else {
					// try to interpret arguments as regular expression and take accesses that match this expression
					try {
						let re = new RegExp(...groupObj.arguments);
						res.accesses = Object.keys(fpDb[resource][tabId][res.type].args).reduce(
							(x, y) => (re.test(y) ? x + fpDb[resource][tabId][res.type].args[y] : x), 0);
					} catch {
						res.accesses = 0;
					}
				}			
			}
			else {
				// arguments logging not defined, simply take total accesses to resource
				res.accesses = fpDb[resource][tabId][res.type].total
			}

			// sort criteria by value
			groupObj.criteria.sort((x, y) => (x.value - y.value));

			// filter criteria and take weight of highest achieved criteria
			var filteredCriteria = groupObj.criteria.filter((x) => (x.value <= res.accesses)).reverse()[0];
			res.actualWeight = filteredCriteria ? filteredCriteria.weight : 0;
		}
		else {
			// no logs of given criteria
			res.accesses = 0;
		}
		scores.push(res)
	}

	// if resource was accessed and gained weight, save it to evalStats
	scores.forEach(function (res) {
		if (res.actualWeight) {
			latestEvals[tabId].evalStats.push({
				title: resource,
				type: "resource",
				resource: res.type,
				group: groupName,
				weight: res.actualWeight,
				accesses: res.accesses
			});
		}
	});

	return scores;
}

/* 
 * --------------------------------------------------
 * 				EVENT LISTENERS
 * --------------------------------------------------
 */

/**
 * Event listener that listen for content script messages.
 * Messages contain wrappers logging data that are stored into fpDb object.
 * Also listen for popup messages to update FPD state and whitelist.
 *
 * \param callback Function that stores recieved data into fpDb.
 */
browser.runtime.onMessage.addListener(function (record, sender) {
	if (record) {
		switch (record.purpose) {
			case "fp-detection":
				// check objects existance => if do not exist, create new one
				fpDb[record.resource] = fpDb[record.resource] || {};
				fpDb[record.resource][sender.tab.id] = fpDb[record.resource][sender.tab.id] || {};
				fpDb[record.resource][sender.tab.id][record.type] = fpDb[record.resource][sender.tab.id][record.type] || {};
				
				// object that contains access counters
				const fpCounterObj = fpDb[record.resource][sender.tab.id][record.type];
				const argsStr = record.args.join();
				fpCounterObj["args"] = fpCounterObj["args"] || {};
				
				// increase counter for accessed arguments
				fpCounterObj["args"][argsStr] = fpCounterObj["args"][argsStr] || 0;
				fpCounterObj["args"][argsStr] += 1;
				
				// increase counter for total accesses
				fpCounterObj["total"] = fpCounterObj["total"] || 0;
				fpCounterObj["total"] += 1;
				fpDb.update(record.resource, sender.tab.id, record.type, fpCounterObj["total"]);
				break;
			case "fpd-state-change":
				browser.storage.sync.get(["fpDetectionOn"]).then(function(result) {
					fpDetectionEnabled = result.fpDetectionOn;
				});
				break;
			case "add-fpd-whitelist":
				// obtain current hostname and whitelist it
				var currentHost = record.url;
				fpdWhitelist[currentHost] = true;
				browser.storage.sync.set({"fpdWhitelist": fpdWhitelist});
				break;
			case "remove-fpd-whitelist":
				// obtain current hostname and remove it form whitelist
				var currentHost = record.url;
				delete fpdWhitelist[currentHost];
				browser.storage.sync.set({"fpdWhitelist": fpdWhitelist});
				break;
			case "update-fpd-whitelist":
				// update current fpdWhitelist from storage
				browser.storage.sync.get(["fpdWhitelist"]).then(function(result) {
					fpdWhitelist = result.fpdWhitelist;
				});
				break;
			case "fpd-fetch-hits": {
				let {tabId} = record;
				// filter by tabId;
				let hits = Object.create(null);
				for ([resource, tabRecords] of Object.entries(fpDb)) {
					let total = 0;
					if (tabRecords[tabId]) {
						for (let stat of Object.values(tabRecords[tabId])) { // by type
							total += stat.total;
						}
					}
					let group_name = wrapping_groups.wrapper_map[resource];
					if (group_name) {
						get_or_create(hits, group_name, 0);
						hits[group_name] += total;
					}
				}
				return Promise.resolve(hits);
			}
		}
	}
});

/**
 *
 * The listener sends message response which contains information if the current site is whitelisted or not.
 * 
 * \param record Receives full message.
 * \param sender Sender of the message.
 */
browser.runtime.onMessage.addListener(function (record, sender) {
	// message came from popup,js, asking whether is this site whitelisted
	if (record.purpose == "fpd-whitelist-check") {
		return Promise.resolve(isFpdWhitelisted(record.url));
	}
});

/**
 * Check if the hostname or any of it's domains is whitelisted.
 *
 * \param hostname Any hostname (subdomains allowed).
 *
 * \returns TRUE when domain (or subdomain) is whitelisted, FALSE otherwise.
 */
function isFpdWhitelisted(hostname) {
	var domains = extractSubDomains(hostname);
	for (var domain of domains) {
		if (fpdWhitelist[domain] != undefined) {
			return true;
		}
	}
	return false;
}

/**
 * The function that creates notification and informs user about fingerprinting activity.
 *
 * \param tabId Integer number representing ID of suspicious browser tab.
 */
 function notifyFingerprintBlocking(tabId) {
	browser.notifications.create("fpd-" + tabId, {
		"type": "basic",
		"iconUrl": browser.runtime.getURL("img/icon-48.png"),
		"title": "Fingerprinting activity detected!",
		"message": `Blocking all subsequent requests.\n\n` +
			`Page: ${availableTabs[tabId].title.slice(0, 30)}\n` +
			`Host: ${wwwRemove(new URL(availableTabs[tabId].url).hostname)}`
	});
	setTimeout(() => {
		browser.notifications.clear("fpd-" + tabId);
	}, 6000);
}

/**
 * Event listener that listen for click on notification when FPD detects fingerprinting.
 *
 * \param callback Function that open new window with FPD evaluation report.
 */
browser.notifications.onClicked.addListener((notificationId) => {
	if (notificationId.startsWith("fpd")) {
		var tabId = notificationId.split("-")[1];

		// open popup window containing FPD report
		browser.windows.create({
			url: "/fp_report.html",
			type: "popup",
			height: 600,
			width: 800
		});

		// get current FPD level for evaluated tab
		var level = getCurrentLevelJSON(availableTabs[tabId].url)[0].level_id;
		level = fp_levels.groups[level] ? level : "default";

		// send data needed for FPD report creation
		var reportId = browser.runtime.getURL("fp_report.html");
		browser.tabs.query({url: reportId}).then(function(tabs) {
			if (tabs) {
				// message delay to make a space for report page initialization
				setTimeout(() => {
					browser.tabs.sendMessage(tabs[0].id, {
						tabId: tabId,
						groups: {recursive: fp_levels.groups[level], sequential: fpGroups[level]},
						latestEvals: latestEvals,
						exceptionWrappers: exceptionWrappers
					});
				}, 500)
			}
		});
	}
});

/**
 *  Contains information about tabs current state.
 */
var availableTabs = {};

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
// get state of all existing tabs
browser.tabs.query({}).then(function(results) {
    results.forEach(function(tab) {
        availableTabs[tab.id] = tab;
    });
});
/// \endcond

/**
 * Clear all stored logs for a tab.
 *
 * \param tabId Integer number representing ID of browser tab.
 */
function refreshDb(tabId) {
	for (let resource in fpDb) {
		if (fpDb[resource].hasOwnProperty(tabId)) {
			delete fpDb[resource][tabId];
		}
		if (Object.keys(fpDb[resource]).length == 0) {
			delete fpDb[resource];
		}
	}
	if (latestEvals[tabId]) {
		delete latestEvals[tabId];
	}
}

/**
 * Event listener that listen for update of browser tabs.
 *
 * \param callback Function that updates availableTabs and refreshes fpDb.
 */
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	availableTabs[tabId] = tab;
	if (changeInfo.status == "loading") {
		refreshDb(tabId);
	}
});

/**
 * Event listener that listen for removal of browser tabs.
 *
 * \param callback Function that updates availableTabs and refreshes fpDb.
 */
browser.tabs.onRemoved.addListener(function (tabId) {
	delete availableTabs[tabId];
	refreshDb(tabId);
});

/**
 * Event listener that listen for requests through webRequest API.
 *
 * \param cancelCallback Function that makes decision of blocking requests according to groups evaluation.
 */
browser.webRequest.onBeforeRequest.addListener(
	cancelCallback,
	{urls: ["<all_urls>"]},
	["blocking"]
);

/**
 * The function that makes decisions about requests blocking. If blocking enabled, also clear browsing data.
 *
 * \param requestDetails Details about request.
 * 
 * \returns Object containing key "cancel" with value true if request is blocked, otherwise with value false
 */
function cancelCallback(requestDetails) {

	// chrome fires onBeforeRequest event before tabs.onUpdated => refreshDb won't happen in time
	// need to refreshDb when main_frame request occur, otherwise also user's requests will be blocked
	if (requestDetails.type == "main_frame") {
		refreshDb(requestDetails.tabId);
	}

	// if FPD enabled for the site and actualWeight of root group is higher than 0 => suspicious activity
	if (isFpdOn(requestDetails.tabId) && evaluateGroups(requestDetails.tabId)) {
		// get url of tab asociated with this request
		var tabUrl = availableTabs[requestDetails.tabId] ? availableTabs[requestDetails.tabId].url : undefined;

		// create notification for user (only once for every tab load)
		if (!latestEvals[requestDetails.tabId].stopNotifyFlag) {
			latestEvals[requestDetails.tabId].stopNotifyFlag = true;
			notifyFingerprintBlocking(requestDetails.tabId);
		}
		
		// clear local and session storage (using content script) for every frame in this tab (required?)
		if (requestDetails.tabId >= 0) {
			browser.tabs.sendMessage(requestDetails.tabId, {
				cleanStorage: true
			});
		}
	
		// clear all browsing data for origin of tab url to prevent fingerprint caching
		if (tabUrl) {
			try {
				// "origins" key only supported by Chromium browsers
				browser.browsingData.remove({
					"origins": [new URL(tabUrl).origin]
				}, {
					"cacheStorage": true,
					"cookies": true,
					"fileSystems": true,
					"indexedDB": true,
					"localStorage": true,
					"serviceWorkers": true,
					"webSQL": true
				});
			} 
			catch (e) {
				// need to use "hostnames" key for Firefox
				if (e.message.includes("origins")) {
					browser.browsingData.remove({
						"hostnames": extractSubDomains(new URL(tabUrl).hostname).filter((x) => (x.includes(".")))
					}, {
						"cookies": true,
						"indexedDB": true,
						"localStorage": true,
						"serviceWorkers": true
					});
				}
				else {
					throw e;
				}
			}
		}

		return {
			cancel: true
		};
	}

	return {
		cancel: false
	};
}

/**
 * The function that returns FPD setting for given url.
 *
 * \param tabId Tab identifier for which FPD setting is needed.
 * 
 * \returns Boolean value TRUE if FPD is on, otherwise FALSE.
 */

function isFpdOn(tabId) {
	if (!availableTabs[tabId]) {
		return false;
	}
	let url = wwwRemove(new URL(availableTabs[tabId].url).hostname);
	if (fpDetectionEnabled && !isFpdWhitelisted(url)) {
		return true;
	}
	return false;
}
