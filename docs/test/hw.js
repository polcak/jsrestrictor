// SPDX-FileCopyrightText: 2019 Martin Timko
//
// SPDX-License-Identifier: GPL-3.0-or-later

function getHW() {
	// why sometimes values are not spoofed? need to refresh values again? cached values?
		var txt = "";
		txt += "<p>Device memory (navigator.deviceMemory): " + window.navigator.deviceMemory + "</p>";
		txt += "<p>Number of logical processors available (navigator.hardwareConcurrency): " + window.navigator.hardwareConcurrency + "</p>";
		document.getElementById("hw").innerHTML = txt;
	// if not setTimeout, navigator sometimes return real info because wrapping script is not fast enough or what ???
	// setTimeout(function(){ 
	// 	var txt = "";
	// 	txt += "<p>Device memory (navigator.deviceMemory): " + window.navigator.deviceMemory + "</p>";
	// 	txt += "<p>Number of logical processors available (navigator.hardwareConcurrency): " + window.navigator.hardwareConcurrency + "</p>";
	// 	document.getElementById("hw").innerHTML = txt;
	// }, 100);
}
