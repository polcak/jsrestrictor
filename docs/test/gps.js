// SPDX-FileCopyrightText: 2019 Martin Timko
// SPDX-FileCopyrightText: 2020 Peter Marko
// SPDX-FileCopyrightText: 2020 Libor Polčák
//
// SPDX-License-Identifier: GPL-3.0-or-later

var gettingGPSDataInterval;
var id;

function drawPosition(gpsDataObject) {
	if (gpsDataObject) {
		document.getElementById("placeToWriteGPSDetails").innerHTML =  "<b>Accuracy:</b> " + gpsDataObject.coords.accuracy + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Altitude:</b> " + gpsDataObject.coords.altitude + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>AltitudeAccurac:</b> " + gpsDataObject.coords.altitudeAccuracy + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Heading:</b> " + gpsDataObject.coords.heading + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Latitude:</b> " + gpsDataObject.coords.latitude + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Longitude:</b> " + gpsDataObject.coords.longitude + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Speed:</b> " + gpsDataObject.coords.speed + "<br>";
		document.getElementById("placeToWriteGPSDetails").innerHTML += "<b>Timestamp:</b> " + gpsDataObject.timestamp + "<br>";
		clearInterval(gettingGPSDataInterval);

		document.getElementById("map").innerHTML = '<iframe width="900" height="450" frameborder="0" id="mapnavi" name="mapnavi" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=' + (gpsDataObject.coords.longitude - 0.004).toString() + '%2C' + (gpsDataObject.coords.latitude - 0.001).toString() + '%2C' + (gpsDataObject.coords.longitude + 0.004).toString() + '%2C' + (gpsDataObject.coords.latitude + 0.001).toString() + '&amp;layer=mapnik&amp;marker=' + gpsDataObject.coords.latitude.toString() + '%2C' + gpsDataObject.coords.longitude.toString() + '" style="border: 1px solid black"></iframe>';
	}
	else {
		document.getElementById("placeToWriteGPSDetails").innerHTML = "Waiting for GPS data.";
	}
}

function showGPSData() {

	clearInterval(gettingGPSDataInterval);
	var gpsDataObject;
	var gpsGetDataAttemptsRemaining = 100;
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getGPSDataObject);
	} else {
		document.getElementById("placeToWriteGPSDetails").innerHTML = "Geolocation is not supported by this browser.";
		return;
	}

	gettingGPSDataInterval = setInterval(function(){
		if (gpsGetDataAttemptsRemaining) {
			drawPosition(gpsDataObject);
		}
		else {
			clearInterval(gettingGPSDataInterval);
		}
		gpsGetDataAttemptsRemaining--;
	}, 200);


	function getGPSDataObject(position) {
		gpsDataObject = position;
	}
}

function watchGPSPosition() {
	id = navigator.geolocation.watchPosition(drawPosition);
	document.getElementById("placeToWriteWatchPositionId").innerHTML = "<b>watchPosition handle ID:</b> " + id + "<br>";
	document.getElementById("clearWatchButton").enabled = true;
	document.getElementById("clearWatchButton").disabled = false;
}

function clearGPSWatch() {
	id = navigator.geolocation.clearWatch(id);
	document.getElementById("clearWatchButton").disabled = true;
	document.getElementById("clearWatchButton").enabled = false;
	document.getElementById("placeToWriteWatchPositionId").innerHTML = "";
}


