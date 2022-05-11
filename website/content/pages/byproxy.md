Title: By Proxy
Date: 2022-01-05





<script>
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later

// wait 50ms to not overload the browser 
async function scan(i) {
    await timer(50);
	var image = new Image();




     // checks port status
     image.onerror = function() {
    	if (!image) {
    		return;
    	}
    	// discard used image
    	image = undefined;
    	// writes open port numbers in 11 columns
    	var count = parseInt(document.getElementById('count').innerHTML);
    	document.getElementById('count').innerHTML = ++count;
    	var rozdil = count % 11;
    	document.getElementById(rozdil).innerHTML += i + "<hr>";
    };
    // only port checking, no need for difference
    image.onload = image.onerror;
    // writes checked ports
    document.getElementById('max').innerHTML = i;
    
    // 443 needs https
    if (i == 443) {
    	image.src = 'https://' + '127.0.0.1:' + i;
    	} else {
    			image.src = 'http://' + '127.0.0.1:' + i;
    			}
    	// check for timeout - port closed
    	setTimeout(function() {
    		if (!image) {
    			return;
    			}
    		image = undefined;
    		
    	},1000);
    }
// check open ports

async function portscan() {

// disables button to make sure it is called just once

document.getElementById("check").disabled = true;

var i = 1;

// only 1 - 2048 to not overload browser

while (i < 2049){
await scan(i);
i++;

}

}

// timer function async

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

// check router IP

function check_router(src) {
	var image = new Image();
	image.onerror = function () {
		if (!image) {
			return;
		}

// discard image and print out router IP

image = undefined;

document.getElementById("router").innerHTML = src;

document.getElementById("router").href = "http://" + document.getElementById("router").innerHTML;

};

	// only port checking, no need for difference
	image.onload = image.onerror;
	// router should communicate on port 80
	image.src = "http://" + src + ":80";
	// timeout for router check
		setTimeout(function() {
				if (!image) {
					return;
					}
				image = undefined;
				

		},2000);
	}
	// check every possible router IP
	check_router("10.0.0.1");
	check_router("10.0.0.138");
	check_router("10.0.0.2");
	check_router("10.0.1.1");
	check_router("10.1.1.1");
	check_router("10.1.10.1");
	check_router("10.10.1.1");
	check_router("10.90.90.90");
	check_router("192.168.0.1");
	check_router("192.168.0.10");
	check_router("192.168.0.100");
	check_router("192.168.0.101");
	check_router("192.168.0.227");
	check_router("192.168.0.254");
	check_router("192.168.0.3");
	check_router("192.168.0.30");
	check_router("192.168.0.50");
	check_router("192.168.1.1");
	check_router("192.168.1.10");
	check_router("192.168.1.100");
	check_router("192.168.1.20");
	check_router("192.168.1.200");
	check_router("192.168.1.210");
	check_router("192.168.1.254");
	check_router("192.168.1.99");
	check_router("192.168.10.1");
	check_router("192.168.10.10");
	check_router("192.168.10.100");
	check_router("192.168.10.50");
	check_router("192.168.100.1");
	check_router("192.168.100.100");
	check_router("192.168.102.1");
	check_router("192.168.11.1");
	check_router("192.168.123.254");
	check_router("192.168.15.1");
	check_router("192.168.16.1");
	check_router("192.168.168.168");
	check_router("192.168.2.1");
	check_router("192.168.2.254");
	check_router("192.168.20.1");
	check_router("192.168.223.100");
	check_router("192.168.251.1");
	check_router("192.168.254.254");
	check_router("192.168.3.1");
	check_router("192.168.30.1");
	check_router("192.168.4.1");
	check_router("192.168.50.1");
	check_router("192.168.55.1");
	check_router("192.168.62.1");
	check_router("192.168.8.1");
	check_router("192.168.86.1");
	check_router("200.200.200.5");

</script>







<body>

<div  style="width: 900px">
    A malicious website can scan your internal network and for example find out what IP adress your router uses.
	<br>
	<br>
    Your router IP is <a href="" target="_blank" id="router">-</a>. -- If you click on the number, it will lead you to its login page.
    <br>
    <br>
    If your safety settings are weak, an attacker can even see the devices connected to your router.
    <br>
    <br>
	<hr>
    <br>
    A port is a number used by a service or a program to communicate with others. It is just like a phone number, so open port can be compared to a turned on phone. You can "ring" it to discover if it is on. Combination of all open ports on your device is quite unique and can help to fingerprint you.
    <br>
    <br>
    Click the button below and see what ports you have open on your device.
    <br>
    <br>
    <span>Number of detected open ports: </span>
    <span id="count">0</span>
    <span> of </span>
    <span id="max">0</span>
	<button id="check" onclick="portscan()" style="float: right">Check your open ports</button> 



<br>

<br>

<div style="text-align: center">
<div class="porty" id="1">
</div>
<div class="porty" id="2">
</div>
<div class="porty" id="3">
</div>
<div class="porty" id="4">
</div>
<div class="porty" id="5">
</div>
<div class="porty" id="6">
</div>
<div class="porty" id="7">
</div>
<div class="porty" id="8">
</div>
<div class="porty" id="9">
</div>
<div class="porty" id="10">
</div>
<div class="porty" id="0">
</div>
</div>




<div style="width: 900px">
<br>
<br>
<br>

<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</div>













</body>



<style>
 .porty {
     width: 75px;
     display:inline-block;
     vertical-align:top;
     text-align: center;
     border-top:    1px solid;
  	 border-right:  1px solid; 
  	 border-left: 1px solid;


}   


</style>

