/** \file
 * \brief JS code for fpd report
 *
 *  \author Copyright (C) 2022  Marek Salon
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
 * Event listener that listen for messages from background script to obtain data about FP evaluation.
 *
 * \param callback Function that initialize FPD report creation.
 */
browser.runtime.onMessage.addListener(function (message, sender) {
    if (message.tabId && message.groups && message.latestEvals) {
        var {tabId, tabObj, groups, latestEvals, exceptionWrappers} = message;
        createReport(tabId, tabObj, groups, latestEvals, exceptionWrappers);
    }
})

/**
 * The function that populates FPD report page with data from the latest evaluation and hooks up listeners.
 *
 * \param tabId Integer number representing ID of evaluated browser tab.
 * \param tabObj Object consisting of additional information about the tab specified by tabId value.
 * \param groups Object containing both recursive (fp_levels.groups) and sequential (fpGroups) definition of heuristic groups.
 * \param latestEvals Object that stores latest evaluation statistics for every examined tab.
 * \param exceptionWrappers Object containing information about unsupported wrappers for used browser.
 */
function createReport(tabId, tabObj, groups, latestEvals, exceptionWrappers) {
	var report = document.getElementById("fpd-report");
    if (!latestEvals[tabId] || !latestEvals[tabId].evalStats) {
        report.innerHTML = "Error creating FPD report!"
        return;
    }
    
    var rootGroup = groups.recursive.name;
    var fpGroups = groups.sequential;

    // parse latestEvals to create more useful representation for FPD report generation
    var processedEvals = {};
    for (let item of latestEvals[tabId].evalStats) {
        processedEvals[item.title] = processedEvals[item.title] || {};
        processedEvals[item.title].type = item.type;
        if (processedEvals[item.title].accesses) {
            processedEvals[item.title].accesses += item.accesses ? item.accesses : 0;
        }
        else {
            processedEvals[item.title].accesses = item.accesses ? item.accesses : 0;
        }
    }

    // add page URL and FavIcon to header section of the report
    if (tabObj) {
        let urlObj = new URL(tabObj.url);
        let url = urlObj.hostname + urlObj.pathname;
        document.getElementById("report-url").innerHTML = url;
        let img = document.getElementById("pageFavicon");
        img.src = tabObj.favIconUrl;
        img.onload = function () {
            // overwrite default behavior from CSS to show icon only when available
            this.style = "";
        };
    }

    var html = "";

    // generate html code for evaluated group
    let generateGroup = (group) => {
        if (processedEvals[group]) {
            if (fpGroups[group].description) {
                html += "<div id=\"" + group + "\" class=\"fpd-group access\">";
                html += "<h2>" + group + "</h2>";
                html += "<p>" + fpGroups[group].description + "</p>";
            }
            for (let [item, type] of Object.entries(fpGroups[group].items)) {
                if (type == "group") {
                    generateGroup(item);
                }
                else {
                    generateResource(item)
                }
            }
            if (fpGroups[group].description) {
                html += "</div>";
            }
        }
    }

    // generate html code for evaluated resource (get,set,call)
    let generateResource = (resource) => {
        if (processedEvals[resource]) {
            let accessRaw = processedEvals[resource].accesses;
            let accessCount = accessRaw >= 1000 ? "1000+" : accessRaw;
            html += `<h4 class="hidden ${accessRaw > 0 ? "access" : "no-access"}"><span class="dot">-</span> ` +
            `${resource} (${exceptionWrappers.includes(resource) ? "n/a" : accessCount})</h4>`;
        }
    }

    // start generating FPD report from the first group (root group)
    generateGroup(rootGroup);
    report.innerHTML += html;

    // hide groups with no relevant entries
    let groupElements = document.querySelectorAll(".fpd-group.access");
    for (let i = groupElements.length; i > 0; i--) {
        if (!document.querySelectorAll(`#${groupElements[i-1].id} > .access`).length) {
            groupElements[i-1].classList.replace("access", "no-access");
        }
    }

    // function that enables to show accessed resources of the group
    let toggleResources = (event) => {
        let parent =  event.target.parentElement;
        for (let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i];
            if (child.tagName == "H4") {
                child.classList.toggle("hidden");
            }
        }
    }

    // make group name clickable only if it makes sense - groups with resources
    for (let element of document.querySelectorAll(".fpd-group")) {
        let button;
        let haveChild = false;
        
        for (let i = 0; i < element.children.length; i++) {
            let child = element.children[i];
            if (child.tagName == "H2") {
                button = child;
            }
            if (child.tagName == "H4") {
                haveChild = true;
            }
        }
        
        if (button && haveChild) {
            button.classList.add("active");
            button.addEventListener("click", toggleResources);
        }
    }

    // show resources for every group in FPD report
    let showAll = (event) => {
        for (let element of document.querySelectorAll(".fpd-group > h4")) {      
            element.classList.toggle("hidden");
        }
        event.target.innerText = event.target.innerText == "Show All" ? "Hide All" : "Show All";
    }

    // show description/help for the report
    let showDescription = (event) => {
        for (let element of document.querySelectorAll(".description")) {      
            element.classList.toggle("hidden");
        }
    }

    // show all groups/resources even if not accessed
    let showNotAccessed = (event) => {
        for (let element of document.querySelectorAll(".no-access")) {      
            console.log(element);
            element.classList.remove("no-access");
        }
    }
    
    document.getElementById("showAll").addEventListener("click", showAll);
    document.getElementById("help").addEventListener("click", showDescription);
    document.getElementById("unhideAll").addEventListener("click", showNotAccessed);
}
