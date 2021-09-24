// SPDX-FileCopyrightText: 2019 Martin Timko
//
// SPDX-License-Identifier: GPL-3.0-or-later

function pad(whatToPad, howManyDigits) {

  var inputString = whatToPad.toString();
  var zerosToAdd = howManyDigits - inputString.length;
  if (zerosToAdd > 0) {
      var zeros = "0".repeat(zerosToAdd);
      inputString = zeros + inputString;
  }

  return inputString;
}
var ok = 0;
function updateClock() {
  // document.getElementById("now").innerHTML = Date.now();
  // var now2 = new Date().getTime();
  // var now2 = Date.UTC(96, 1, 2, 3, 4, 5,6);
  // if (ok > 400) {
  //   console.log(now2);
  //   ok = 0;
  // }
  // ok = ok+1;

  var nowa = new Date(Date.now());
  
  // var milliseconds = now.getTime();
  var milliseconds = nowa.getMilliseconds();
  var seconds = nowa.getSeconds();
  var minutes = nowa.getMinutes();
  var hours = nowa.getHours();
  
  document.getElementById("hours").innerHTML = pad(hours, 2);
  document.getElementById("minutes").innerHTML = pad(minutes, 2); 
  document.getElementById("seconds").innerHTML = pad(seconds, 2);
  document.getElementById("milliseconds").innerHTML = pad(milliseconds, 3);
  
}

function initClock() {
  updateClock();
  window.setInterval("updateClock()", 1);
}

window.addEventListener("DOMContentLoaded", function () {
	let origEventEl = document.getElementById("orig-event");
	let currentEventEl = document.getElementById("current-event");
	let origEvent = new Event("test");
  setInterval(function() {
		let currentEvent = new Event("test");
		origEventEl.innerHTML = origEvent.timeStamp;
		currentEventEl.innerHTML = currentEvent.timeStamp;
  }, 100);
});
