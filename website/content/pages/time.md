Title: Time
Date: 2002-01-12



<script>
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


</script>



<body onload="initClock();">










            
            <script src="http://www.stud.fit.vutbr.cz/~xjires02/pcf.js"></script>
            <script src="http://www.stud.fit.vutbr.cz/~xjires02/fce.js"></script>
            <script src="https://cdn.plot.ly/plotly-1.54.1.min.js"></script>
            <div id="content-wrapper">
    		<strong>Date object</strong>
    		<span id="hours">00</span>:
    		<span id="minutes">00</span>:
    		<span id="seconds">00</span>.
    		<span id="milliseconds">000</span>
    		</div>
            <div id="top">
                <p><b>Clock-Skew Calculator</b></p>
                <button id="stop" onclick="stopIt();">Stop</button>
            </div>
            <div id="infodiv">
                <div id="infotext">
                    <h2><img src="styles/i.png">Information</h2>
                    <p id="info"></p>
                    <button class="activeB" onclick="clearInfo();">Close</button>
                </div>
            </div>
            <div class="hlavni" id="texta">
                <img src="styles/i.png" alt="Information" class="information" onclick="showInfo('texta')">
                <div id="JSONTestd">
                    <label>JSONTest</label>
                    <textarea id="JSONTest" readonly="readonly" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">ServerTimeSinceStart -- ClientTimeSinceStart</textarea>
                    <div class="ttip">
                        <p id="JSONTestskew">Skew is </p>
                        <span id="JSONTesttip"></span>
                    </div>
                    <button onclick="if(JTdone){errorButton('JTB');}" class="disabledB" id="JTB">Try JSONTest again</button>
                </div>
                <div id="WorldClockd" style="display:none">
                    <label>WorldClock</label>
                    <textarea id="WorldClock" readonly="readonly" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">ServerTimeSinceStart -- ClientTimeSinceStart</textarea>
                    <div class="ttip">
                        <p id="WorldClockskew">Skew is </p>
                        <span id="WorldClocktip"></span>
                    </div>
                    <button onclick="if(WCdone){errorButton('WCB');}" class="disabledB" id="WCB">Try WorldClock again</button>
                </div>
                <div id="Evad">
                    <label>Eva</label>
                    <textarea id="Eva" readonly="readonly" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">ServerTimeSinceStart -- ClientTimeSinceStart</textarea>
                    <div class="ttip">
                        <p id="Evaskew">Skew is </p>
                        <span id="Evatip"></span>
                    </div>
                    <button onclick="if(EVdone){errorButton('EVB');}" class="disabledB" id="EVB">Try Evu again</button>
                </div>
            </div>
            <div id="grafobal" class="hlavni">
                <img src="styles/i.png" alt="Information" class="information" onclick="showInfo('graf')">
                <span id="graphUpdate">Graph update in : 00s</span>
                <div id="graf">
                </div>
            </div>
            <div id="predesle" class="hlavni">
                <h1>Previous measurements</h1>
                <div id="obalT">
                    <table id="TTab">
                        <tr><th>Date</th><th>Time [h:m:s]</th><th>Measurement time [s]</th><th>Skew [ppm]</th><th>Delete</th></tr>
                    </table>
                </div>
                <p id="onlyfive">Maximum of 5 measurements for each server are shown (4 with longest measurement time and 1 most recent).</p>
                <span id="bigStorage"></span>
                <p id="show" onclick="showWholeStorage();">Show all measurement records</p>
                <p id="testik" onclick="if(confirm('Are you sure you want to delete all records ?')){localStorage.clear();document.getElementById('predesle').style.visibility = 'hidden';document.getElementById('predesle').style.position = 'absolute'}">Delete all measurement records</p>
            </div>
       <div style="min-width:1000px">
       <a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>
       </div>
    
        <script>
    
        CallThemAll();
        var interval = setInterval(CallThemAll, (intervalTime));


        //Přidá onclick divu pro informace. Když jsou ukázané informace stačí kliknout na šedý prostor a informace se zavřou, pokud se klikne na bílí nic se nestane.
        document.getElementById("infodiv").onclick = function (e){
            var ev = e || window.event;
            if(e.target === this)
                clearInfo();
        };
    
        if(localStorage.length != 0){
            var item = {Alpha:"", Beta:""};
            var key;
            var id = 0;
            var WCstorage = [];
            var EVstorage = [];
            var JTstorage = [];
            //Čte prvky z localStorage a přiřazuje je serverům
            for (let index = 0; index < localStorage.length; index++) {
                key = localStorage.key(index);
                item = localStorage.getItem(key).split(",");
                keys = key.split("-");
                switch(keys[0]){
                    case "Eva" : {EVstorage.push({Time:keys[1], Alpha:Number(item[0]), Beta:Number(item[1]), MeasureTime:Number(item[2]), Key:key});break;}
                    case "JSONTest" : {JTstorage.push({Time:keys[1], Alpha:Number(item[0]), Beta:Number(item[1]), MeasureTime:Number(item[2]), Key:key});break;}
                    case "WorldClock" : {WCstorage.push({Time:keys[1], Alpha:Number(item[0]), Beta:Number(item[1]), MeasureTime:Number(item[2]), Key:key});break;}
                }
            }
    
            //Pokud má nějaký server více jak 5 měření, redukuje jejich počet na 5
            var storageMessage = "More measurement records aren't shown :";
            if(JTstorage.length > 5){
                var pastLen = JTstorage.length;
                JTstorage = reduceStorageArray(JTstorage);
                storageMessage += " JSONTest("+(pastLen-5)+")";
                document.getElementById("show").style.visibility = "visible";
                document.getElementById("show").style.position = "static";
            }
            printStorage(JTstorage, "JSONTest");
    
            if(WCstorage.length > 5){
                var pastLen = WCstorage.length;
                WCstorage = reduceStorageArray(WCstorage);
                storageMessage += " WorldClock("+(pastLen-5)+")";
                document.getElementById("show").style.visibility = "visible";
                document.getElementById("show").style.position = "static";
            }
            printStorage(WCstorage, "WorldClock");
            
            if(EVstorage.length > 5){
                var pastLen = EVstorage.length;
                EVstorage = reduceStorageArray(EVstorage);
                storageMessage += " Eva("+(pastLen-5)+")";
                document.getElementById("show").style.visibility = "visible";
                document.getElementById("show").style.position = "static";
            }
            printStorage(EVstorage, "Eva");
    
            if(storageMessage != "More measurement records aren't shown :")      
                document.getElementById("bigStorage").innerHTML = storageMessage;
    
            EVlastKnownSkew = getLastKnownSkew(EVstorage);
            JTlastKnownSkew = getLastKnownSkew(JTstorage);
            WClastKnownSkew = getLastKnownSkew(WCstorage);
    
        }else{
            document.getElementById("predesle").style.visibility = "hidden";
            document.getElementById("predesle").style.position = "absolute";
        }
        
        </script>
        
    <style>
    /*
    M --- #326EE6 -> #89A7E4 -> #A0BDF4
    S --- #EEEEEE
    B --- #FF6159 -> #27CB3F
    */
    
    * {
        margin: 0;
        padding: 0;
    }
    
    html {
        overflow-y: scroll; 
    }
    
    body{
        padding: 20px;
    }
    
    hr{
        border-color: #A0BDF4;
    }
    
    
    textarea {
        width: 100%;
        min-width: 100px;
        height: 300px;
        text-align: center;
        border: 1px solid #EEEEEE;
        resize: none;
        outline: none;
    }
    
    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 5px rgba(50,110,230,0.3);
        -moz-box-shadow: inset 0 0 5px rgba(50,110,230,0.5); 
        border-radius: 5px;
    }
     
    ::-webkit-scrollbar-thumb {
        -webkit-box-shadow: inset 0 0 5px rgba(50,110,230,0.5);
        -moz-box-shadow: inset 0 0 5px rgba(50,110,230,0.5);
        border-radius: 5px; 
    }
    
    #JSONTestd{
        margin: 0 30px 0 15px;
        width: 40%;
        display: inline-block;
        height: 354px;
    }
    
    #Evad{
        margin: 0 15px 0 25px;
        width: 40%;
        display: inline-block;
        height: 354px;
    }
    
    #WorldClockd{
        width: 30%;
        display: inline-block;
        height: 354px;
    }
    
    #texta{
        position: relative;
        width: auto;
    }
    
    #skol{
        margin-right : 0px;
    }
    
    #show{
        visibility: hidden;
        position: absolute;
    }
    
    #testik, #show{
        cursor: pointer;
    }
    
    .hlavni{
        
        margin: 20px 0px 20px 0px;
        padding: 20px;
        text-align: center;
        position: relative;
        color: #c53d1b;
        min-width: 1000px;
        -webkit-box-shadow: 0 0 10px rgba(0,0,0,0.2);
        -moz-box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    
    #double{
        display: inline;
        margin: 20px;
    }
    
    #predesle{
        width: 50%;
        float:left;
        margin-right: 20px;
    }
    #legenda{
        width: 40%;
        float:left;
        text-align: left;
        min-width: 560px;
    }
    
    .hlavni button, #stop, #infotext button{
        height: 35px;
        padding: 10px;
        border: none;
        border-radius: 4px;
    }
    
    .hlavni label{
        font-size: 20px;
    }
    
    .hlavni a{
        color: #89A7E4;
    }
    
    #stop{
        background-color: #FF6159;
        background-image: linear-gradient(to bottom right,#FF6159,#FF0000);
        cursor: pointer;
        color: #FFFFFF;
        position: absolute;
        right: 5px;
        top: 5px;
        height: 50px;
        font-size: 20px;
        border-radius: 5px;
        width: 100px;
    }
    
    #stop:hover{
        background-color: #FF0000;
        background-image: linear-gradient(to top left,#FF1010,#FF0000);
        -webkit-box-shadow: 0 0 15px rgba(255,0,0,1);
    }
    
    .butX{
        background-image: url("x.png");
    }
    
    .activeB:hover{
        background-color: #326EE6;
        color: #A0BDF4;
    }
    
    .activeB{
        background-color: #EEEEEE;
        color: #89A7E4;
    }
    
    .disabledB{
        visibility: hidden;
    }
    
    #WCB, #JTB, #EVB{
        position: absolute;
    }
    
    #grafobal{
        padding: 0px;
        visibility: hidden;
    }
    
    #graf{
        background-color: #FFFFFF;
        position: static;
        z-index: -1;
        padding: 0px;
        margin: 0px;
    }
    
    #top{
        position: relative;
        top: 0;
        height: 70px;
        font-size: 40px;
        margin: 40px 10px 0px 0px;
        z-index: 2;
        min-width: 1000px;
    }
    
    #grafobal span{
        font-size: 25px;
        left:50%;
        position:absolute;
        transform: translateX(-50%);
        top: 18px;
        z-index: 1;
        font-weight: bold;
    }
    
    .hlavni table{
        width: 100%;
        padding: 5px;
        border-collapse: collapse;
        margin-bottom: 20px;;
    }
    
    .hlavni table tr{
        border-bottom: 1px solid #EEEEEE;
    }
    
    
    .hlavni h1{
        margin-bottom: 15px;
    }
    
    .hlavni div p{
        visibility: hidden;
        position:absolute;
        font-size: 20px;
        width: 100%;
    }
    
    .hlavni h2 span{
        color: #326EE6;
    }
    
    .hlavni table td{
        padding:4px;
    }
    
    .hlavni table caption{
        position: absolute;
        left : 40px;
        font-size: 20px;
        color: #326EE6;
    }
    
    .hlavni table img{
        cursor: pointer;
    }
    
    #obalT{
        margin-left : 100px;
    }
    
    
    #predesle p{
        font-size: 12px;
        margin: 10px;
    }
    
    #predesle p:last-child{
        color: #FF6159;
        margin-bottom: 0px;
    }
    
    #predesle span{
        font-size: 18px;
    }
    
    /* W3Schools tooltip https://www.w3schools.com/css/css_tooltip.asp */
    .ttip{
        position: relative;
        height: 25px;
    }
    
    .ttip .ttiptext {
        visibility: hidden;
        width: 300px;
        background-color: #FFFFFF;
        padding: 5px;
        border-radius: 8px;
        border: 2px solid #326EE6;
        position: absolute;
        z-index: 3;
        top: 150%;
        left: 50%;
        margin-left: -150px;
    }
    
    .ttip .ttiptext::after {
        content: "";
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 8px;
        border-style: solid;
        border-color:  transparent transparent #326EE6 transparent;
    }
    
    .ttip:hover .ttiptext {
        visibility: visible;
        opacity: 1;
    }
    /*-----------------------------------------------------------------*/
    
    .information{
        position: absolute;
        top : 10px;
        left: 10px;
        height: 25px;
        cursor: pointer;
        z-index: 1;
    }
    
    #infodiv{
        position: fixed;
        visibility: hidden;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.6);
        z-index: 3;
    }
    
    #infotext{
        left:50%;
        position:absolute;
        transform: translateX(-50%);
        top:15%;
        width: 50%;
        min-height: 50%;
        min-width: 500px;
        padding-bottom: 45px;
        background-color: #EEEEEE;
        color: #89A7E4;
        text-align: center;
        font-size: 17px;
    }
    
    #infotext h2{
        font-size: 40px;
        color: #89A7E4;
        text-align: center;
        font-weight: bold;
        margin: 20px 5px 20px 5px;
    }
    
    #infotext h2 img{
        width: 30px;
        margin-right: 15px;
    }
    
    
    #infotext button{
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
    
    
    </style>
    



<br/><br/><br/><br/>



