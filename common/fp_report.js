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

browser.runtime.onMessage.addListener(function (message, sender) {
    if (message.tabId && message.groups && message.latestEvals) {
        var {tabId, tabObj, groups, latestEvals, exceptionWrappers} = message;
        createReport(tabId, tabObj, groups, latestEvals, exceptionWrappers);
    }
})

function createReport(tabId, tabObj, groups, latestEvals, exceptionWrappers) {
	var report = document.getElementById("fpd-report");
    if (!latestEvals[tabId] || !latestEvals[tabId].evalStats) {
        report.innerHTML = "Error creating FPD report!"
        return;
    }
    
    var rootGroup = groups.recursive.name;
    var fpGroups = groups.sequential;

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

    if (tabObj) {
        let urlObj = new URL(tabObj.url);
        let url = urlObj.hostname + urlObj.pathname;
        document.getElementById("report-url").innerHTML = url;
        let img = document.getElementById("pageFavicon");
        img.src = tabObj.favIconUrl;
        img.onload = function () {
            this.style = "";
        };
    }

    var html = "";

    let generateGroup = (group) => {
        if (processedEvals[group]) {
            if (fpGroups[group].description) {
                html += "<div id=\"" + group + "\" class=\"fpd-group\">";
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

    let generateResource = (resource) => {
        if (processedEvals[resource]) {
            let accessCount = processedEvals[resource].accesses >= 1000 ? "1000+" : processedEvals[resource].accesses;
            html += `<h4 style="display:none"><span class="dot">-</span> ${resource} (${exceptionWrappers.includes(resource) ? "n/a" : accessCount})</h4>`;
        }
    }

    generateGroup(rootGroup);
    report.innerHTML += html;

    let toggleResources = (event) => {
        let parent =  event.target.parentElement;
        for (let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i];
            if (child.tagName == "H4") {
                if (child.style.display === "none") {
                    child.style.display = "";
                } else {
                    child.style.display = "none";
                }
            }
        }
    }

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

    let showAll = (event) => {
        console.log(event);
        for (let element of document.querySelectorAll(".fpd-group > h4")) {      
            if (event.target.innerText == "Show All") {
                element.style.display = "";
            }
            else {
                element.style.display = "none";
            }
        }
        event.target.innerText = event.target.innerText == "Show All" ? "Hide All" : "Show All";
    }
    
    document.getElementById("showAll").addEventListener("click", showAll);
}
