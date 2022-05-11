Title: Battery
Date: 2022-01-11

<script>
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later
    window.onload = function () {
      function updateBattery(battery) {


          // level "1" means no battery
        if (battery.level == "1"){
            document.getElementById('level').textContent = "no battery";
        }
        else{
        	document.getElementById('level').textContent = battery.level;  
        }
        
          // check if charging 
        document.getElementById('charging').textContent = battery.charging ? 'charging' : 'not charging';



        // infinity means no battery or connected to power
        if (battery.dischargingTime / 60 == "Infinity"){
        	document.getElementById('discharge').textContent = "infinity";
        }
        else{
        	document.getElementById('discharge').textContent = battery.dischargingTime / 60 + " minutes";
        }
        
      }      	
          // check if getBattery is a function
          if (typeof navigator.getBattery === "function") { 
            navigator.getBattery().then(function(battery) {


        // write first info in divs
        updateBattery(battery);
    
        // if anything changes rewrite the divs
        battery.onlevelchange = function () {
          updateBattery(battery);
        };
        
        battery.onchargingchange = function () {
          updateBattery(battery);
        };
    
        battery.ondischargingtimechange = function () {
          updateBattery(battery);
        };
      });
    };
    }      
    </script>

<div style="width: 850px">

The combination of your devices charging state, battery level and discharging time, a fingerprinter can distinguish you from the crowd and further improve your fingerprint.

<br>

<br>

Most modern web browsers don't allow using this API by default, although for example Chrome does. If you see 3 unknown figures down below, it means your browser already covers this API and you are safe.

<br>



<h4>Battery level</h4>
<div>
<img src="images/bat_down.png"  alt="bat" width="80" height="40px" style="display: inline-block">

<div id="level" style="display: inline-block"> unknown</div>

</div>  

<h4>Charging state</h4>

<div>    
<img src="images/char.png"  alt="charge" width="80" style="display: inline-block">
<div id="charging" style="display: inline-block"> unknown</div>
</div>

<h4>Discharge time</h4>

<div>
<img src="images/dis.png"  alt="dis" width="80" style="display: inline-block">
<div id="discharge" style="display: inline-block">unknown</div>
</div>




<br/><br/>

<hr>

<br>

Now turn JShelter on and try using safety levels as shown below. You need to refresh this page each time you change a setting.

<br>

<br>

<b>Recommended and Strict</b>

<br>

battery API is disabled

<br>

<br>



<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</div>