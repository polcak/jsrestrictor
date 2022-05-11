Title: See How JShelter Works
Date: 2022-01-05

<script>
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later

function myFunction() {
  var x = document.getElementById("choose");
  var y = document.getElementById("intro");
  if (x.style.display === "none") {
    x.style.display = "inline";
    y.style.display = "none";
  } else {
    x.style.display = "none";
    y.style.display = "inline";
  }
} 
</script>



<div id="intro" style="text-align:center;">
Please make sure your JShelter extension is disabled and then click the button below.
<div style="text-align:center;">
</br>
</br>
<figure>
<picture>
<source media="(prefers-color-scheme: dark)" srcSet="images/jshelterOFFdark.png" type="image/png">
<img src="images/jshelterOFF.png" alt="jshelteroffdark" width="500">
</picture>
<figcaption style="text-align: center;width: 500px;margin-top: 10px;">JShelter turned off (Top right corner of your browser window)</figcaption>
</figure>






</br>
</br>
</br>


​    

<button style="height:40px;width:120px;" onclick="myFunction()">I made sure it's off.</button>

</br>
</br>
</br>

<hr>
</br>
JShelter not installed? Click below on your browser logo and download it now.
</br>

</br>

<figure>
<a href="https://addons.mozilla.org/cs/firefox/addon/javascript-restrictor/" target="_blank"><img src="images/firefox.png"  alt="firefox" width="120"></a>
<figcaption style="text-align: center;width: 120px;margin-top: 10px;">Mozilla Firefox</figcaption>
</figure>
<figure style="margin-left:60px;">
<a href="https://chrome.google.com/webstore/detail/jshelter/ammoloihpcbognfddfjcljgembpibcmb" target="_blank"><img src="images/chrome.png"  alt="chrome" width="120"></a>
<figcaption style="text-align: center;width: 120px;margin-top: 10px;">Google Chrome</figcaption>
</figure>

<figure style="margin-left:60px;">
<a href="https://addons.opera.com/cs/extensions/details/javascript-restrictor/" target="_blank"><img src="images/opera.png"  alt="opera" width="140"></a>
<figcaption style="text-align: center;width: 140px;margin-top: 10px;">Opera</figcaption>
</figure>
</div>

</div>





<div style="display :none" id="choose">


<div style="width: 850px">

<h3>Wrapped APIs</h3>
While your JShelter extension is turned off, you can try and see different ways an API can be misused to fingerprint your device. 
</br>
</br>
Just click on an icon below to see a try for yourself.
</br>
</br>

<figure>
<a href="gps"><img src="images/location.png"  alt="gps" width="105"></a>
<figcaption style="text-align: center;width: 105px;margin-top: 10px;">Geolocation</figcaption>
</figure>
<figure style="margin-left: 20px;">
<a href="devices"><img src="images/usb2.png"  alt="devices" width="125"></a>
<figcaption style="text-align: center;width: 125px;margin-top: 0px;">Devices</figcaption>
</figure>


<figure>
<a href="battery"><img src="images/bat.png"  alt="battery" width="125"></a>
<figcaption style="text-align: center;width: 125px;margin-top: 0px;">Battery Status</figcaption>
</figure>
<figure style="margin-left: 25px;">
<a href="hw"><img src="images/hw.png" alt="hardware" width="120" height="120" style="margin-bottom: 7px"></a>
<figcaption style="text-align: center;width: 120px;margin-top: 0px;">Hardware</figcaption>
</figure>

<figure style="margin-left: 50px;">
<a href="ispoint"><img src="images/cursor2.png" alt="isPoint" width= "70" height="70" style="margin-bottom: 15px;"></a>
<figcaption style="text-align: center;width: 70px;margin-top: 0px;">Cursor</figcaption>
</figure>

<figure style="margin-left: 40px;">
<a href="canvas"><img src="images/canvas.png" alt="canvas" width= "100" height="70" style="margin-bottom: 15px;"></a>
<figcaption style="text-align: center;width: 100px;margin-top: 0px;">Canvas</figcaption>
</figure>


<h3>Attack Defence</h3>
<p>You can also try having your device under an attack by a fingerprinter. Do not worry, it is not real. :)</p>
</br>

<figure>
<a href="pretime"><img src="images/clock.png"  alt="time" width="125"></a>
<figcaption style="text-align: center;width: 125px;margin-top: 10px;">Clock-Skew</figcaption>
</figure>

<figure style="margin-left: 50px;">
<a href="byproxy"><img src="images/proxy.png"  alt="proxy" width="125"></a>
<figcaption style="text-align: center;width: 125px;margin-top: 10px;">By Proxy</figcaption>
</figure>

</div>

</div>

<style>
figure {
    display: inline-block;
  }
</style>

