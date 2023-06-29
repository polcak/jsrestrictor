/** \file
 * \brief Fingerprint Detector (FPD) main logic, fingerprinting evaluation and other essentials
 *
 *  \author Copyright (C) 2021-2022  Marek Salon
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
 * \defgroup FPD Fingerprint Detector
 *
 * \brief Fingerprint Detector (FPD) is a module that detects browser fingerprint extraction and prevents
 * its sharing. To learn more about Browser Fingerprinting topic, see study "Browser Fingerprinting: A survey" available
 * here: https://arxiv.org/pdf/1905.01051.pdf
 *
 * The FPD module uses wrapping technique to inject code that allows log API calls and accesses for every visited web page
 * and its frames. Logged JS APIs can be specified in wrappers-lvl_X.json file, where X represents FPD config identifier.
 * 
 * Fingerprint Detector is based on heuristic system that can be defined in form of API groups. A group represents
 * a set of APIs that may have something in common. Access to the group is triggered when a certain amount APIs is accessed. 
 * Hierarchy of groups creates a tree-like structure, where access to the root group means fingerprinting activity. Groups can 
 * be configured in groups-lvl_X.json file, where X represents FPD config identifier.
 *
 * The FPD evaluate API groups with every request made in scope of certain browser tab. When FPD detects fingerprinting activity, 
 * blocking of subsequent requests is issued (if allowed in settings). Local browsing data of fingerprinting origin are also cleared 
 * to prevent caching extracted fingerprint in browser storage.
 * 
 */

 /** \file
 *
 * \brief This file is part of Fingerprint Detector (FPD) and contains API groups evaluation logic. File also contains
 * event listeners used for API logging, requests blocking and tabs management. 
 *
 * \ingroup FPD
 */

/**
 * FPD enable flag. Evaluate only when active.
 */
var fpDetectionOn;

/**
 * Associtive array of hosts, that are currently among trusted ones.
 */
var fpdWhitelist = {};

/**
 * Associtive array of settings supported by this module.
 */
var fpdSettings = {};

/**
 * API logs database of following structure:
 * 		"tabId" : {
 * 			"resource" : {
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

/**
 *  Contains information about tabs current state.
 */
var availableTabs = {};

/**
* Definition of settings supported by this module.
*/
const FPD_DEF_SETTINGS = {
	behavior: {
		description: "Specify preffered behavior of the module.",
		description2: [],
		label: "Behavior",
		params: [
			{
				// 0
				short: "Passive",
				description: "Use extension icon badge color to signalize likelihood of ongoing fingerprinting without any interaction."
			},
			{
				// 1
				short: "Limited Blocking",
				description: "Allow the extension to react whenever there is a high likelihood of fingerprinting.",
				description2: [
					"• Interrupt network traffic for the page to prevent possible fingerprint leakage.", 
					"• Clear some browser storage of the page to remove possibly cached fingerprint. (<strong>No additional permissions required.</strong>)",
					"• Clearing: <strong>localStorage, sessionStorage, JS cookies, IndexedDB, caches, window.name</strong>",
					"NOTE: Blocking behavior may break some functionality on fingerprinting websites."
				]
			},
			{
				// 2
				short: "Full Blocking",
				description: "Allow the extension to react whenever there is a high likelihood of fingerprinting.",
				description2: [
					"• Interrupt network traffic for the page to prevent possible fingerprint leakage.",
					"• Clear <strong>all</strong> available storage mechanisms of the page where fingerprint may be cached. (Requires <strong>BrowsingData</strong> permission.)",
					"• Clearing: <strong>localStorage, sessionStorage, cookies, IndexedDB, caches, window.name, fileSystems, WebSQL, serviceWorkers</strong>",
					"NOTE: Blocking behavior may break some functionality on fingerprinting websites."
				],
				permissions: ["browsingData"]
			}
		]
	},
	notifications: {
		description: "Turn on/off notifications about fingerprinting detection and HTTP requests blocking.",
		description2: ["NOTE: We recommend having notifications turned on for blocking behavior."],
		label: "Notifications",
		params: [
			{
				// 0
				short: "Off",
				description: "Detection/blocking notifications turned off."
			},
			{
				// 1
				short: "On",
				description: "Detection/blocking notifications turned on."
			}
		]
	},
	detection: {
		description: "Adjust heuristic thresholds which determine likelihood of fingerprinting.",
		description2: [],
		label: "Detection",
		params: [
			{
				// 0
				short: "Default",
				description: "Recommended setting for most users.",
				description2: [
					"• Very low number of false positive detections (focus on excessive fingerprinting, very low number of unreasonably blocked sites)",
					"• Acceptable amount of false negative detections (some fingerprinting websites may get around detection)",
				]
			},
			{
				// 1
				short: "Strict",
				description: "Optional setting for more cautious users.",
				description2: [
					"• Lower number of false negative detections (detects also websites with less excessive fingerprinting)",
					"• Higher probability of false positive detections (in edge cases benign websites may be falsely blocked)",
				]
			}
		]
	}
};

// unify default color of popup badge background between different browsers
browser.browserAction.setBadgeBackgroundColor({color: "#6E7378"});

// unify default color of popup badge text between different browsers
if (typeof browser.browserAction.setBadgeTextColor === "function") {
	browser.browserAction.setBadgeTextColor({color: "#FFFFFF"});
}

/**
 * This function initializes FPD module, loads configuration from storage, and registers listeners needed for fingerprinting detection.
 */
function initFpd() {
	// fill up fpGroups object with necessary data for evaluation
	for (let groupsLevel in fp_levels.groups) {
		fpGroups[groupsLevel] = fpGroups[groupsLevel] || {};
		processGroupsRecursive(fp_levels.groups[groupsLevel], groupsLevel);
	}

	// load configuration and settings from storage 
	fpdLoadConfiguration();

	// take care of unsupported resources for cross-browser behaviour uniformity
	balanceUnsupportedWrappers();

	// listen for messages intended for FPD module
	browser.runtime.onMessage.addListener(fpdCommonMessageListener);
	
	// listen for click on notification when FPD detects fingerprinting to create a report
	browser.notifications.onClicked.addListener((notificationId) => {
		if (notificationId.startsWith("fpd")) {
			var tabId = notificationId.split("-")[1];
			generateFpdReport(tabId);
		}
	});
	
	// listen for update of browser tabs and start periodic FP evaluation
	browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		availableTabs[tabId] = tab;
		if (changeInfo.status == "loading") {
			refreshDb(tabId);
			fpDb[tab.id] = {};
			periodicEvaluation(tab.id, 500);
		}
	});

	// listen for removal of browser tabs to clean fpDb object
	browser.tabs.onRemoved.addListener(function (tabId) {
		refreshDb(tabId);
		delete availableTabs[tabId];
	});

	// listen for removal of optional permissions to adjust settings accordingly
	browser.permissions.onRemoved.addListener((permissions) => {
		correctSettingsForRemovedPermissions(permissions.permissions, fpdSettings, FPD_DEF_SETTINGS);
		browser.storage.sync.set({"fpdSettings": fpdSettings});
	});

	// listen for requests through webRequest API and decide whether to block them
	browser.webRequest.onBeforeRequest.addListener(
		fpdRequestCancel,
		{urls: ["<all_urls>"]},
		["blocking"]
	);

	// listen for navigation events to initiate storage clearing of fingerprinting web pages
	browser.webNavigation.onBeforeNavigate.addListener((details) => {
		if (latestEvals[details.tabId] && latestEvals[details.tabId].stopNotifyFlag && fpdSettings.behavior > 0) {
			// clear storages (using content script) for every frame in this tab
			if (details.tabId >= 0) {
				browser.tabs.sendMessage(details.tabId, {
					cleanStorage: true,
					ignoreWorkaround: fpdSettings.behavior > 1
				});
			}
		}
	});

	// get state of all existing tabs and start periodic FP evaluation
	browser.tabs.query({}).then(function(results) {
		results.forEach(function(tab) {
			availableTabs[tab.id] = tab;
			fpDb[tab.id] = {};
			periodicEvaluation(tab.id, 500);
		});
	});
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
 * \returns object where "weight" property represents evaluated weight of root group and "severity" property contain severity array
 */
function evaluateGroups(tabId) {
	// get url of evaluated tab
	var url = availableTabs[tabId] ? availableTabs[tabId].url : "";
	var ret = {
		weight: 0,
		severity: []
	}

	// inaccesible or invalid url - do not evaluate
	if (!url) {
		return ret;
	}
	
	// clear old evalStats
	latestEvals[tabId] = latestEvals[tabId] || {};
	latestEvals[tabId].evalStats = [];

	// check if the level exists within FPD configuration, if not use default FPD configuration
	level = fpdSettings.detection ? fpdSettings.detection : 0;

	// getting root group name as a start point for recursive evaluation
	var rootGroup = fp_levels.groups[level] ? fp_levels.groups[level].name : undefined;
	
	// start recursive evaluation if all needed objects are defined
	if (rootGroup && fpGroups[level] && fp_levels.wrappers[level]) {
		let evalRes = evaluateGroupsCriteria(rootGroup, level, tabId)[0];
		ret.weight = evalRes.actualWeight;
		if (fp_levels.groups[level].severity) {
			let sortedSeverity = fp_levels.groups[level].severity.sort((x, y) => x[0] - y[0]);
			ret.severity = sortedSeverity.filter((x) => (x[0] <= evalRes.actualWeightsSum)).reverse()[0];
		}
	}

	return ret;
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

	// compute actualWeight of rootGroup with value of accesses
	res.accesses = 0;
	res.actualWeight = 0;
	res.actualWeightsSum = 0;
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
		res.actualWeightsSum = actualWeightsSum;
	}
	else {
		// groupTypes contains "access" - take access of child items into account
		var accessesSum = scores.reduce((x, {accesses}) => (x + accesses), 0);

		// sort relevant criteria
		relevantCriteria.sort((x, y) => (x.access - y.access));

		// filter criteria and take weight of highest achieved criteria
		var filteredCriteria = relevantCriteria.filter((x) => (x.access <= accessesSum)).reverse()[0];
		res.actualWeight = filteredCriteria ? filteredCriteria.weight : 0;
		res.actualWeightsSum = accessesSum;
	}

	// update group statistics in latestEvals
	latestEvals[tabId].evalStats.push({ 
		title: rootGroup,
		type: "group",
		weight: res.actualWeight,
		sum: res.actualWeightsSum
	});

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
		if (fpDb[tabId] && fpDb[tabId][resource] && fpDb[tabId][resource][res.type]) {
			let record = fpDb[tabId][resource][res.type];
			// logs for given resource and type exist
			if (groupObj.arguments) {
				// if arguments logging is defined, evaluate resource accordingly
				
				if (groupObj.arguments == "diff") {
					// "diff" - accesses depend on number of different arguments
					res.accesses = Object.keys(record.args).length;		
				}
				else if (groupObj.arguments == "same") {
					// "same" - accesses depend on maximum number of same arguments calls
					res.accesses = Object.values(record.args).reduce((x, y) => x > y ? x : y);
				}
				else {
					// try to interpret arguments as regular expression and take accesses that match this expression
					try {
						let re = new RegExp(...groupObj.arguments);
						res.accesses = Object.keys(record.args).reduce(
							(x, y) => (re.test(y) ? x + record.args[y] : x), 0);
					} catch {
						res.accesses = 0;
					}
				}			
			}
			else {
				// arguments logging not defined, simply take total accesses to resource
				res.accesses = record.total
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

	// update resource statistics in latestEvals
	scores.forEach(function (res) {
		latestEvals[tabId].evalStats.push({
			title: resource,
			type: "resource",
			resource: res.type,
			group: groupName,
			weight: res.actualWeight,
			accesses: res.accesses
		});
	});

	return scores;
}

/* 
 * --------------------------------------------------
 * 				EVENT HANDLERS
 * --------------------------------------------------
 */

/**
 * Callback function that parses and handles messages recieved by FPD module.
 * Messages may contain wrappers logging data that are stored into fpDb object.
 * Also listen for popup messages to update FPD state and whitelist.
 *
 * \param message Receives full message.
 * \param sender Sender of the message.
 */
function fpdCommonMessageListener(record, sender) {
	if (record) {
		switch (record.purpose) {
			case "fp-detection":
				// check objects existance => if do not exist, create new one
				fpDb[sender.tab.id] = fpDb[sender.tab.id] || {};
				fpDb[sender.tab.id][record.resource] = fpDb[sender.tab.id][record.resource] || {};
				fpDb[sender.tab.id][record.resource][record.type] = fpDb[sender.tab.id][record.resource][record.type] || {};
				
				// object that contains access counters
				const fpCounterObj = fpDb[sender.tab.id][record.resource][record.type];
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
					fpDetectionOn = result.fpDetectionOn;
				});
				break;
			case "fpd-whitelist-check": {
				// answer to popup, when asking whether is the site whitelisted
				return Promise.resolve(isFpdWhitelisted(record.url));
			}
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
			case "fpd-get-report-data": {
				// get current FPD level for evaluated tab
				if (record.tabId) {
					level = fpdSettings.detection ? fpdSettings.detection : 0;
					return Promise.resolve({
						tabObj: availableTabs[record.tabId],
						groups: {root: fp_levels.groups[level].name, all: fpGroups[level]},
						fpDb: fpDb[record.tabId],
						latestEvals: latestEvals[record.tabId],
						exceptionWrappers: exceptionWrappers
					});
				}
			}
			case "fpd-create-report":
				// create FPD report for the tab
				if (record.tabId) {
					generateFpdReport(record.tabId);
				}
				break;
			case "fpd-fetch-severity": {
				// send severity value of the latest evaluation
				let severity = [];
				if (record.tabId && isFpdOn(record.tabId) && latestEvals[record.tabId]) {
					severity = latestEvals[record.tabId].severity;
				}
				return Promise.resolve(severity);
			}
			case "fpd-get-settings": {
				// send settings definition and current values
				return Promise.resolve({
					def: FPD_DEF_SETTINGS,
					val: fpdSettings
				});
			}
			case "fpd-set-settings":
				// update current settings
				fpdSettings[record.id] = record.value;
				browser.storage.sync.set({"fpdSettings": fpdSettings});
				break;
			case "fpd-load-config":
				// load current configuration
				fpdLoadConfiguration();
				break;
			case "fpd-clear-storage":
				// clear browser storage for the origin
				clearStorageFacilities(record.url);
				break;
			case "fpd-fetch-hits": {
				let {tabId} = record;
				// filter by tabId;
				let hits = Object.create(null);
				if (fpDb[tabId]) {
					for ([resource, recordObj] of Object.entries(fpDb[tabId])) {
						let total = 0;
						for (let stat of Object.values(recordObj)) { // by type
							total += stat.total;
						}
						let group_name = wrapping_groups.wrapper_map[resource];
						if (group_name) {
							get_or_create(hits, group_name, 0);
							hits[group_name] += total;
						}
					}
				}
				return Promise.resolve(hits);
			}
		}
	}
}

/**
 * The function that makes decisions about requests blocking. If blocking enabled, also clear browsing data.
 *
 * \param requestDetails Details about the request.
 * 
 * \returns Object containing key "cancel" with value true if request is blocked, otherwise with value false
 */
function fpdRequestCancel(requestDetails) {

	// chrome fires onBeforeRequest event before tabs.onUpdated => refreshDb won't happen in time
	// need to refreshDb when main_frame request occur, otherwise also user's requests will be blocked
	if (requestDetails.type == "main_frame") {
		refreshDb(requestDetails.tabId);
	}

	return evaluateFingerprinting(requestDetails.tabId)
}

/* 
 * --------------------------------------------------
 * 				MISCELLANEOUS
 * --------------------------------------------------
 */

/**
 * The function that loads module configuration from sync storage.
 */
function fpdLoadConfiguration() {
	browser.storage.sync.get(["fpDetectionOn", "fpdWhitelist", "fpdSettings"]).then(function(result) {
		fpDetectionOn = result.fpDetectionOn ? true : false;
		fpdWhitelist = result.fpdWhitelist ? result.fpdWhitelist : {};
		fpdSettings = result.fpdSettings ? result.fpdSettings : {};
	});
}

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
	let url = getEffectiveDomain(availableTabs[tabId].url);
	if (fpDetectionOn && !isFpdWhitelisted(url)) {
		return true;
	}
	return false;
}

/**
 * The function that creates notification and informs user about fingerprinting activity.
 *
 * \param tabId Integer number representing ID of suspicious browser tab.
 */
function notifyFingerprintBlocking(tabId) {
	let msg;
	if (fpdSettings.behavior > 0) {
		msg = "Blocking all subsequent requests.";
	}
	if (fpdSettings.behavior == 0) {
		msg = "Click the notification for more details.";
	}

	browser.notifications.create("fpd-" + tabId, {
		type: "basic",
		iconUrl: browser.runtime.getURL("img/icon-48.png"),
		title: "Fingerprinting activity detected!",
		message: `${msg}\n\n` +
			`Page: ${availableTabs[tabId].title.slice(0, 30)}\n` +
			`Host: ${getEffectiveDomain(availableTabs[tabId].url)}`
	});
	setTimeout(() => {
		browser.notifications.clear("fpd-" + tabId);
	}, 6000);
}

/**
 * The function that generates a report about fingerprinting evaluation in a separate window.
 *
 * \param tabId Integer number representing ID of evaluated browser tab.
 */
function generateFpdReport(tabId) {
	// open popup window containing FPD report
	browser.windows.create({
		url: "/fp_report.html?id=" + tabId,
		type: "popup",
		height: 600,
		width: 800
	});
}

/**
 * Clear all stored logs for a tab.
 *
 * \param tabId Integer number representing ID of browser tab.
 */
function refreshDb(tabId) {
	if (fpDb[tabId]) {
		delete fpDb[tabId];
	}
	if (latestEvals[tabId]) {
		delete latestEvals[tabId];
	}
	if (availableTabs[tabId] && availableTabs[tabId].timerId) {
		clearTimeout(availableTabs[tabId].timerId);
	}
}

/**
 * The function that periodically starts fingerprinting evaluation without the need for a request. 
 * Delay is increased exponentially and doubles in every call.
 *
 * \param tabId Integer number representing ID of browser tab.
 * \param delay Initial value of a delay in milliseconds.
 */
function periodicEvaluation(tabId, delay) {
	evaluateFingerprinting(tabId);
	if (availableTabs[tabId]) {
		// limit max delay to 90s per tab
		availableTabs[tabId].timerId = setTimeout(periodicEvaluation, delay, tabId, delay > 90000 ? delay : delay*2);
	}
}

/**
 * The function that starts evaluation process and if fingerprinting is detected, it reacts accordingly.
 *
 * \param tabId Integer number representing ID of evaluated browser tab.
 * 
 * \returns Object containing key "cancel" with value true if request is blocked, otherwise with value false
 */
function evaluateFingerprinting(tabId) {
	// if FPD enabled for the site continue with FP evaluation
	if (isFpdOn(tabId)) {
		
		// start FP evaluation process and store result array
		var evalResult = evaluateGroups(tabId);
		
		// store latest severity value after evaluation of given tab
		if (evalResult.severity) {
			latestEvals[tabId].severity = evalResult.severity;
		}

		// modify color of browserAction
		if (evalResult.severity[2]) {
			browser.browserAction.setBadgeBackgroundColor({color: evalResult.severity[2], tabId: tabId});
		}

		// if actualWeight of root group is higher than 0 => reactive phase and applying measures
		if (evalResult.weight) {

			// create notification for user if behavior is "notification" or higher (only once for every tab load)
			if (fpdSettings.notifications == 1 && !latestEvals[tabId].stopNotifyFlag) {
				latestEvals[tabId].stopNotifyFlag = true;
				notifyFingerprintBlocking(tabId);
			}

			// block request and clear cache data only if "blocking" behavior is set
			if (fpdSettings.behavior > 0) {
				
				// clear storages (using content script) for every frame in this tab
				if (tabId >= 0) {
					browser.tabs.sendMessage(tabId, {
						cleanStorage: true,
						ignoreWorkaround: fpdSettings.behavior > 1
					});
				}

				return {
					cancel: true
				};
			}
		}
	}

	return {
		cancel: false
	};
}

/**
 * The function that clears all supported browser storage mechanisms for a given origin. 
 *
 * \param url URL address of the origin.
 */
function clearStorageFacilities(url) {
	// clear all browsing data for origin of tab url to prevent fingerprint caching
	if (url && fpdSettings.behavior > 1) {
		try {
			// "origins" key only supported by Chromium browsers
			browser.browsingData.remove({
				"origins": [new URL(url).origin]
			}, {
				"appcache": true,
				"cache": true,
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
					"hostnames": extractSubDomains(new URL(url).hostname).filter((x) => (x.includes(".")))
				}, {
					"cache": true,
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
}

/**
 * The function splitting resource string into path and name.
 * For example: "window.navigator.userAgent" => path: "window.navigator", name: "userAgent"
 *
 * \param wrappers text String representing full name of resource.
 * 
 * \returns Object consisting of two properties (path, name) for given resource.
 */
function split_resource(text) {
	var index = text.lastIndexOf('.');
	return {
		path: text.slice(0, index),
		name: text.slice(index + 1)
	}
}
