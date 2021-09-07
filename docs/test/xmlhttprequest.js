// SPDX-FileCopyrightText: 2021 Martin Timko
//
// SPDX-License-Identifier: GPL-3.0-or-later

function runRequest() {
	var myRequest = new XMLHttpRequest();
	myRequest.open("GET", "./others/xmlhttprequest_test_file.html");
	myRequest.send();
	myRequest.onload = () => showOutput(myRequest.responseText);
}

function showOutput(newText) {
	var text = newText.toString();
	alert("Response from XMLHttpRequest: \n\n" + text);
}