// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later

let ul = document.getElementById("enumerateDevices");

function appendLi(text)
{
	let li = document.createElement("li");
	li.innerText = text;
	ul.appendChild(li)
}

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
	appendLi("Your browser does not support enumerateDevices() so it does not leak IDs of cameras and microphones.");
}
else {
	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
		appendLi(devices.length.toString() + " cameras and microphones detected");
		devices.forEach(function(device) {
			appendLi(device.kind + ": " + device.label + " id = " + device.deviceId);
		});
	})
	.catch(function(err) {
		appendLi(err.name + ": " + err.message);
	});
}
