Title: GPS
Date: 2022-01-06


<script>
// SPDX-FileCopyrightText: 2019 Martin Timko
// SPDX-FileCopyrightText: 2020 Peter Marko
// SPDX-FileCopyrightText: 2020 Libor Polčák
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later
var gettingGPSDataInterval;
var id;
function drawPosition(gpsDataObject) {
	if (gpsDataObject) {

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
var x = document.getElementById("description");
var y = document.getElementById("accuracy");

var z = document.getElementById("show");

var z2 = document.getElementById("watch");

// hides or shows divs depending on map visibility

x.style.display = "none";
y.style.display = "inline";

z.style.display = "none";

z2.style.display = "inline";

getGPSData();

gettingGPSDataInterval = setInterval(function(){
	if (gpsGetDataAttemptsRemaining) {
		drawPosition(gpsDataObject);
	}
	else {
		clearInterval(gettingGPSDataInterval);
	}
	gpsGetDataAttemptsRemaining--;
}, 200);

function getGPSData() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getGPSDataObject);
	} else {
		document.getElementById("placeToWriteGPSDetails").innerHTML = "Geolocation is not supported by this browser.";
	}
}

function getGPSDataObject(position) {
	gpsDataObject = position;
}

}

function watchGPSPosition() {
	id = navigator.geolocation.watchPosition(drawPosition);
}
</script>

<div style="width: 900px">
Your geolocation is something that should be kept a secret. Even though you have to give website a permission to locate you for the first time, it can track you afterwards without your knowledge.



<br>

<br>

<div id="map"></div>
<div id="description">
<br>
Let's start this process by clicking the button below, which will draw a map with your position on it. 
</div>
<div id="accuracy" style="display :none">
<br>
If you're using a device with no build-in GPS module, the map will show the center of an area determined by your IP adress and internet provider.
</div>

<br>
<button id="show" onclick="showGPSData();">Show GPS data</button><br><br>
	

<div id="watch" style="display: none">

Redraw map, when position changes
<button onclick="watchGPSPosition();">Watch position</button>

<br>

<br>



</div>



<br>



<div id="placeToWriteGPSDetails"></div>
<div id="placeToWriteWatchPositionId"></div>

<hr>

<br>

<br>

Now turn JShelter on and try using safety levels as shown below. You need to refresh this page each time you change a setting.

<br>

<br>

<b>Recommended</b>

<br>

reports fake position within a few kilometres of the original

<br>

<br>

<b>Strict</b>

<br>

reports <u>no</u> geolocation data

<br>

<br>

<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</div>