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

		document.getElementById("map").innerHTML = "<iframe width=\"450\" height=\"450\" allowfullscreen=\"\" class=\"maps\" frameborder=\"0\" id=\"mapnavi\" name=\"mapnavi\" src=\"https://www.google.com/maps/embed/v1/place?zoom=15&q="+ gpsDataObject.coords.latitude +"%2C"+ gpsDataObject.coords.longitude +"&key=AIzaSyC-5CY9mOCeg5Y3IhPqi_Yd0-DZtWrJl-E\" />";
	}
	else {
		document.getElementById("placeToWriteGPSDetails").innerHTML = "Waiting for GPS data.";
	}
}

function showGPSData() {

	clearInterval(gettingGPSDataInterval);
	var gpsDataObject;
	var gpsGetDataAttemptsRemaining = 100;
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


