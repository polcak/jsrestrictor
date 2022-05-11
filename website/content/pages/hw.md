Title: Hardware Information
Date: 2022-01-05



<script>
// SPDX-FileCopyrightText: 2019 Martin Timko
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later



   

// gets hardware data and writes them in div

function getHW() {
	var txt = "";
	txt += "<p>Device memory: " + window.navigator.deviceMemory + "</p>";
	document.getElementById("hw1").innerHTML = txt;
	txt = "<p>Number of logical processors available: " + window.navigator.hardwareConcurrency 	+ "</p>";
	document.getElementById("hw2").innerHTML = txt;

}



// updates performance every 200 ms

function updatePerformanceLabel() {
var curPerValue = window.performance.now();
document.getElementById("current-performance").innerHTML = curPerValue;
}



// recursive function to call function that updates performance with interval

function updatePerformanceLabelEvery(intervalDuration) {
var myInterval = setInterval(function(){ updatePerformanceLabel(); }, intervalDuration);
}

</script>

<body onload="getHW(); updatePerformanceLabelEvery(200);">

<div style="width: 850px">
Information about the hardware of your device can be used to fingerprint you.
<br>

<br>

The amount of memory (RAM), number of logical CPUs and the performance of your device can make an unique combination and distinguish you from others.

 <br>

<br>

<br>

    <div style="display: inline-block">


​    

​    <img src="images/memory.png"  alt="memory" width="70" style="margin-right: 10px">

<div id="hw1" style="display: inherit;">
 	</div>

<br>

<br>

<img src="images/cpu.png"  alt="cpu" width="70" style="margin-left: 5px; margin-right: 10px">

<div id="hw2" style="display: inherit;">
 	</div>





<br>

<img src="images/speed2.png"  alt="performance" width="110" style="margin-left: -15px; margin-right: -8px">

<div id="content-wrapper" style="display: inherit;">
<span>Current performance is: <span id="current-performance">-</span></span>
</div>

</div>





<br/><br/>

<hr>

<br>

Now turn JShelter on and try using safety levels as shown below. You need to refresh this page each time you change a setting.

<br>

<br>

<b>Recommended</b>

<br>

changes the number of memory and processors<br>

reports inaccurate performance

<br>

<br>

<b>Strict</b>

<br>

changes numbers to even more inaccurate ones

<br>

<br>

<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</body>

</div>

</body>

