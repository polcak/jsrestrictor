/** \file
 * \brief Functions that summarize fingerprints and generate FPD report
 * \ingroup FPD
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

let hiddenTraces = {};

/**
 * Event listener that listens for a load of FPD report page. If the page is loaded, fetch FPD data from background.
 *
 * \param callback Function that initializes FPD report creation from fetched data.
 */
window.addEventListener('load', () => {
	browser.runtime.sendMessage({
		purpose: "fpd-get-report-data",
		tabId: new URLSearchParams(window.location.search).get("id")
	}).then((result) => {
		createReport(result);
	});
});

/**
 * The function that populates FPD report page with data from the latest evaluation and hooks up listeners.
 *
 * \param data Information about latest fingerprinting evaluation consisting of all essential FPD objects.
 */
function createReport(data) {
	var {tabObj, groups, latestEvals, fpDb, exceptionWrappers} = data;
	var reportContainer = document.getElementById("fpd-report-container");
	if (!tabObj || !groups || !groups.root || !groups.all || !fpDb || !latestEvals) {
		report.innerHTML =`<div class="alert">${browser.i18n.getMessage("FPDReportMissingData")}</div>`;
		return;
	}

	// parse latestEvals to create more useful representation for FPD report generation
	var processedEvals = {};
	for (let item of latestEvals.evalStats) {
		processedEvals[item.title] = processedEvals[item.title] || {};
		processedEvals[item.title].type = item.type;
		let total = 0;
		if (fpDb[item.title]) {
			for (let stat of Object.values(fpDb[item.title])) {
				total += stat.total;
			}
		}
		processedEvals[item.title].total = total;
	}

	// add page URL and FavIcon to header section of the report
	if (tabObj) {
		let urlObj = new URL(tabObj.url);
		var url = urlObj.hostname + (urlObj.pathname.length > 1 ? urlObj.pathname : "");
		document.getElementById("report-url").innerHTML = url;
		let img = document.getElementById("pageFavicon");
		img.src = tabObj.favIconUrl;
	}

	var html = "";

	// generate html code for evaluated group
	let generateGroup = (group) => {
		if (processedEvals[group]) {
			if (groups.all[group].description) {
				html += "<div id=\"" + group + "\" class=\"fpd-group access\">";
				html += "<h2>" + group + "</h2>";
				html += `<button class="help" id="expand${group}" >⤵</button>`;
				html += "<section>";
				html += "<p>" + groups.all[group].description + "</p>";
			}
			for (let [item, type] of Object.entries(groups.all[group].items)) {
				if (type == "group") {
					generateGroup(item);
				}
				else {
					generateResource(item)
				}
			}
			if (groups.all[group].description) {
				html += "</section></div>";
			}
		}
	}

	// generate html code for evaluated resource (get,set,call)
	let generateResource = (resource) => {
		if (processedEvals[resource]) {
			let callers = "";
			if (fpDb[resource]) {
				for (let t of Object.values(fpDb[resource])) {
					let traces = Object.keys(t.callers);
					for (trace of traces) {
						if (trace !== "" && !(trace in hiddenTraces)) {
							callers += "<p>" + trace.replace(/\n/g, '<br>') + "</p>";
						}
					}
				}
			}
			let accessRaw = processedEvals[resource].total;
			let accessCount = accessRaw >= 1000 ? "1000+" : accessRaw;
			html += `<div class="details ${accessRaw > 0 ? "access" : "no-access"}"><h4><span class="dot">-</span> ` +
			`${resource} (${exceptionWrappers.includes(resource) ? "n/a" : accessCount})</h4>\n${callers}</div>`;
		}
	}

	// start generating FPD report from the first group (root group)
	generateGroup(groups.root);
	var report = document.getElementById("fpd-report");
	report.innerHTML = html;

	// process generated document
	let groupElements = document.querySelectorAll(".fpd-group.access");
	for (let i = groupElements.length; i > 0; i--) {
		// remove duplicit entries from groups
		let duplicitArray = [];
		let elements = groupElements[i-1].querySelectorAll(":scope > section > div.details > h4");
		elements.forEach((d) => {
			if (duplicitArray.indexOf(d.innerHTML) > -1) {
				d.remove();
			}
			else {
				duplicitArray.push(d.innerHTML);
			}
		});

		// hide groups with no relevant entries
		if (!document.querySelectorAll(`#${groupElements[i-1].id} > section > .access`).length) {
			groupElements[i-1].classList.replace("access", "no-access");
		}
	}

	// function that enables to show accessed resources of the group
	function toggleResources(event) {
		let parent =  event.target.parentElement;
		for (let i = 0; i < parent.children.length; i++) {
			let child = parent.children[i];
			if (child.tagName == "SECTION") {
				child.classList.toggle("hidden");
			}
		}
	}

	// make group name clickable only if it makes sense - groups with resources
	function makeGroupExpansionsClickable() {
		for (let element of document.querySelectorAll(".fpd-group")) {
			let button;

			for (let i = 0; i < element.children.length; i++) {
				let child = element.children[i];
				if (child.tagName == "BUTTON") {
					button = child;
				}
			}

			if (button) {
				button.classList.add("clickable");
				button.addEventListener("click", toggleResources);
			}
		}
	}
	makeGroupExpansionsClickable();

	// show resources for every group in FPD report
	let showAll = (event) => {
		for (let element of document.querySelectorAll(".fpd-group div.details")) {
			element.classList.remove("hidden");
		}
		showBtn.classList.add("hidden");
		hideBtn.classList.remove("hidden");
	}

	// hide resources for every group in FPD report
	let hideDetails = (event) => {
		for (let element of document.querySelectorAll(".fpd-group div.details")) {
			element.classList.add("hidden");
		}
		showBtn.classList.remove("hidden");
		hideBtn.classList.add("hidden");
	}
	hideDetails();

	// refresh data in the report
	function refreshReport() {
		browser.runtime.sendMessage({
			purpose: "fpd-get-report-data",
			tabId: tabId
		}).then((result) => {
			createReport(result);
			showAll();
		});
		browser.runtime.sendMessage({purpose: "fpd-track-callers-stop"});
		document.getElementById("updateReportBtn").classList.remove("hidden");
		document.getElementById("forgetCurrentBtn").classList.remove("hidden");
		let trackCallersBtn = document.getElementById("trackCallersBtn");
		trackCallersBtn.innerText = browser.i18n.getMessage("FPDReportTrackCallersRestart");
		trackCallersBtn.classList.remove("hidden");
	}

	// Reload the report with data on the identity of the calling scripts
	function trackCallers() {
		tabId = new URLSearchParams(window.location.search).get("id");
		function onReloaded() {
			setTimeout(refreshReport, 5000);
			report.innerHTML = browser.i18n.getMessage("FPDReportTrackCallersWaiting");
			document.getElementById("trackCallersBtn").classList.add("hidden");
			document.getElementById("updateReportBtn").classList.add("hidden");
			document.getElementById("forgetCurrentBtn").classList.add("hidden");
		}
		function onError(error) {
			document.getElementById("fpdError").innerHTML = browser.i18n.getMessage("FPDReportTrackCallersFailed", error);
			browser.runtime.sendMessage({purpose: "fpd-track-callers-stop"});
		}
		browser.runtime.sendMessage({
			purpose: "fpd-track-callers",
			tabId: tabId
		}).then(onReloaded, onError);
	}

	function updateReport() {
	}

	// show all groups/resources even if not accessed
	let showNotAccessed = () => {
		for (let element of document.querySelectorAll(".no-access")) {
			element.classList.remove("no-access");
		}
		makeGroupExpansionsClickable();
	}

	function forgetTraces() {
		for (resource of Object.values(fpDb)) {
			for (type of Object.values(resource)) {
				for (trace of Object.keys(type.callers)) {
					hiddenTraces[trace] = true;
				}
			}
		}
		createReport(data);
	}

	// create on-site JSON representation of FPD evaluation data and download it
	function exportReport(filename) {
		let element = document.createElement("a");
		let obj = {
			fpd_evaluation_statistics: latestEvals.evalStats,
			fpd_access_logs: fpDb
		}
		element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj)));
		element.setAttribute("download", filename);
		element.style.display = "none";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	document.getElementById("showBtn").onclick = showAll;
	document.getElementById("hideBtn").onclick = hideDetails;
	document.getElementById("exportBtn").onclick = exportReport.bind(null, `fpd_report_${url}.json`);
	document.getElementById("trackCallersBtn").onclick = trackCallers;
	document.getElementById("forgetCurrentBtn").onclick = forgetTraces;
	document.getElementById("updateReportBtn").onclick = refreshReport;
	document.getElementById("unhideAll").onclick = showNotAccessed;
}

// show description/help for the report
let showDescription = () => {
	for (let element of document.querySelectorAll(".description")) {
		element.classList.toggle("hidden");
	}
}

window.addEventListener("DOMContentLoaded", function() {
	document.getElementById("titletext").innerHTML += '<button id="help" class="help">?</button>';
	document.getElementById("help").addEventListener("click", showDescription);
});
