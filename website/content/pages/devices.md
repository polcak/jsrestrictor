Title: Connected Devices
Date: 2022-01-11





<div style="width: 850px">
Your browser sees what devices you have connected and their ID. This can easily make an unique combination and easier to fingerprint you.
<br>

<h4>Cameras and microphones</h4>
<ul id="enumerateDevices"></ul>
<h4>Gamepads</h4>
<ul id="gamepads"></ul>
<h4>Virtual reality sets</h4>
<ul id="vr"></ul>

<h4>Mixed reality support</h4>
<div id="webxr"></div>

<br><hr>

<br>

Now turn JShelter on and try using safety levels as shown below. You need to refresh this page each time you change a setting.

<br>

<br>

<b>Recommended</b>

<br>

array of devices is shuffled

<br>

<br>

<b>Strict</b>

<br>

reports <u>no</u> devices (empty array)

<br>

<br>

<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</div>

</div>

<script>
// SPDX-FileCopyrightText: 2021 Libor Polčák
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later
// appends anything not specified below

function appendLi(ul, text)
{
	let li = document.createElement("li");
	li.className = "gmpd";
	li.innerHTML = text;
	ul.appendChild(li)
}



// appends microphones

function appendLimicro(ul, text)
{
	let li = document.createElement("li");
	li.className = "gmpd";
	li.innerHTML = "<img src=\"images/micro.png\"  alt=\"return\" width=\"50\"/>&nbsp;&nbsp;" + text;
	ul.appendChild(li)
}



// appends cameras

function appendLicam(ul, text)
{
	let li = document.createElement("li");
	li.className = "gmpd";
	li.innerHTML = "<img src=\"images/camera.png\"  alt=\"return\" width=\"50\"/>&nbsp;&nbsp;" + text;
	ul.appendChild(li)
}



// appends gamepad

function appendLigame(ul, text)
{
	let li = document.createElement("li");
	li.className = "gmpd";
	li.innerHTML = "<img src=\"images/gamepad.png\"  alt=\"return\" width=\"60\"/>&nbsp;&nbsp;" + text;
	ul.appendChild(li)
}



// appends VR 

function appendLivr(ul, text)
{
	let li = document.createElement("li");
	li.className = "gmpd";
	li.innerHTML = "<img src=\"images/vr.png\"  alt=\"return\" width=\"60\"/>&nbsp;&nbsp;" + text;
	ul.appendChild(li)
}



// check if browser reports devices

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
	appendLi(document.getElementById("enumerateDevices"), "Your browser does not support enumerateDevices() so it does not leak IDs of cameras and microphones.");
}
else {
	let ul = document.getElementById("enumerateDevices");
	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
		appendLi(ul, devices.length.toString() + " cameras and microphones detected");
		devices.forEach(function(device) {

// is it a microphone?

if(device.kind == "audioinput"){

// if yes, append microphone

appendLimicro(ul, device.label + " id = " + device.deviceId);

}

else{

// if not, append camera

appendLicam(ul, device.label + " id = " + device.deviceId);}
		});
	})
	.catch(function(err) {
		appendLi(ul, err.name + ": " + err.message);
	});
}



// checks gamepads and appends them

if (navigator.getGamepads().length === 0) {
	appendLigame(document.getElementById("gamepads"), "Your browser does not report any attached gamepad.");
}
else {
	let ul = document.getElementById("gamepads");
	Array.prototype.forEach.call(navigator.getGamepads(), function(gp) {
		if (gp === null || gp.id === undefined) {
			appendLigame(ul, String(gp));
		}
		else {
			appendLigame(ul, gp.id);
		}
	});
}



// checks VR displays

if (!navigator.getVRDisplays) {
	appendLivr(document.getElementById("vr"), "Your browser does not report any attached VR set.");
}



// checks mixed reality

if (!navigator.xr) {
	document.getElementById("webxr").innerHTML = "<img src=\"images/mr.png\"  alt=\"mr\" width=\"70\" style=\"margin-left: 12px;margin-right: 11px;\"/>" + "Your browser does not support mixed reality.";
}
else {
	document.getElementById("webxr").innerHTML = "<img src=\"images/mr.png\"  alt=\"mr\" width=\"70\" style=\"margin-left: 12px;margin-right: 11px;\"/>" +  "Your browser is at risk to provide fingerprintable information from WebXR APIs.";
}
</script>

<style>
 .gmpd{
  margin-bottom: 0px;
}


    #main-content ul li{
      list-style-type: none;
    }
    </style>
