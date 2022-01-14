// SPDX-FileCopyrightText: 2021 Libor Polčák
//
// SPDX-License-Identifier: GPL-3.0-or-later

function appendLi(ul, text)
{
	let li = document.createElement("li");
	li.innerText = text;
	ul.appendChild(li)
}

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
	appendLi(document.getElementById("enumerateDevices"), "Your browser does not support enumerateDevices() so it does not leak IDs of cameras and microphones.");
}
else {
	let ul = document.getElementById("enumerateDevices");
	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
		appendLi(ul, devices.length.toString() + " cameras and microphones detected");
		devices.forEach(function(device) {
			appendLi(ul, device.kind + ": " + device.label + " id = " + device.deviceId);
		});
	})
	.catch(function(err) {
		appendLi(ul, err.name + ": " + err.message);
	});
}

if (navigator.getGamepads().length === 0) {
	appendLi(document.getElementById("gamepads"), "Your browser does not report any attached gamepad.");
}
else {
	let ul = document.getElementById("gamepads");
	Array.prototype.forEach.call(navigator.getGamepads(), function(gp) {
		if (gp === null || gp.id === undefined) {
			appendLi(ul, String(gp));
		}
		else {
			appendLi(ul, gp.id);
		}
	});
}

if (!navigator.getVRDisplays) {
	appendLi(document.getElementById("vr"), "Your browser does not report any attached VR set.");
}


if (!navigator.xr) {
	document.getElementById("webxr").innerText = "Your browser does not support mixed reality and does not leak any identifying information from WebXR APIs.";
}
else {
	document.getElementById("webxr").innerText = "Your browser is at risk to provide fingerprintable information from WebXR APIs.";
}
