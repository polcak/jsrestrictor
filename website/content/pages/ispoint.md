Title: Mouse Cursor
Date: 2022-01-05



<script>
// SPDX-FileCopyrightText: 2019 Martin Timko
// SPDX-FileCopyrightText: 2021 Matúš Švancár
// SPDX-FileCopyrightText: 2022 Jan Krčma
//
// SPDX-License-Identifier: GPL-3.0-or-later

function isPoint() {



	//static calls after timeout
	const canvas2 = document.getElementById('canvas2');
	const ctx2 = canvas2.getContext('2d');
	const result = document.getElementById('result');
	
	ctx2.rect(10, 10, 100, 100);
	ctx2.stroke();
	setTimeout(function() {
		if(ctx2.isPointInStroke(50, 10)){
		result.innerText = "ON"
		}
	}, 15);
	
	const canvas4 = document.getElementById('canvas4');
	const ctx4 = canvas4.getContext('2d');
	const result1 = document.getElementById('result1');
	
	ctx4.rect(10, 10, 100, 100);
	ctx4.fill();
	setTimeout(function() {
		if(ctx4.isPointInPath(30, 70)){
		result1.innerText = "ON"
		}
	}, 15);
	
	//onmousemove events
	const canvas3 = document.getElementById('canvas3');
	const ctx3 = canvas3.getContext('2d');
	
	// Create ellipse
	const ellipse = new Path2D();
	ellipse.ellipse(100, 75, 40, 60, Math.PI * .25, 0, 2 * Math.PI);
	ctx3.lineWidth = 25;
	ctx3.strokeStyle = 'red';
	ctx3.fill(ellipse);
	ctx3.stroke(ellipse);
	
	// Listen for mouse moves
	canvas3.addEventListener('mousemove', function(event) {
		// Check whether point is inside ellipse's stroke
		if (ctx3.isPointInStroke(ellipse, event.offsetX, event.offsetY)) {
			ctx3.strokeStyle = 'green';
		} else {
			ctx3.strokeStyle = 'red';
		}
	
		// Draw ellipse
		ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
		ctx3.fill(ellipse);
		ctx3.stroke(ellipse);
	});
	
	const canvas5 = document.getElementById('canvas5');
	const ctx5 = canvas5.getContext('2d');
	
	// Create circle
	const circle = new Path2D();
	circle.arc(100, 75, 50, 0, 2 * Math.PI);
	ctx5.fillStyle = 'red';
	ctx5.fill(circle);
	
	// Listen for mouse moves
	canvas5.addEventListener('mousemove', function(event) {
		// Check whether point is inside circle
		if (ctx5.isPointInPath(circle, event.offsetX, event.offsetY)) {
			ctx5.fillStyle = 'green';
		} else {
			ctx5.fillStyle = 'red';
		}
	
		// Draw circle
		ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
		ctx5.fill(circle);
	});
}
document.addEventListener('DOMContentLoaded', function() {
	isPoint();
}, false);

</script>

<body>

<div style="width: 850px">

Your browser is tracking your mouse cursor and transmits its location to visited websites. This way they can see where you point the most and use this information for targeted advertisement or other malicious activity.

<br>

<br>

Try hovering over the two red canvases below. You can notice they change colours when your mouse cursor is upon them, that means your movements are being tracked.

<br>

<br>

<div id="stroke" class="flex">
		<div style="display: inline-block;margin-right: 70px;margin-left: 85px;text-align: center;margin-top: 40px;margin-bottom: 25px;">
			<h3>.isPointInStroke: </h3>
			<canvas id="canvas2" width="200" height="150" style="display :none"></canvas>
			<canvas id="canvas3" width="200" height="150"></canvas>
            <p><b>Tracking <code id="result">OFF</code></b></p>
		</div>
		<div style="display: inline-block;text-align: center;margin-left: 85px;margin-top: 40px;margin-bottom: 25px;">
		<h3>.isPointInPath: </h3>
		<canvas id="canvas4" width="200" height="150" style="display :none"></canvas>
		<canvas id="canvas5" width="200" height="150"></canvas>
         <p><b>Tracking <code id="result1">OFF</code></b></p>
		</div>
</div>
<br>

<hr>
<br>

Now turn JShelter on and try using safety levels as shown below. You need to refresh this page each time you change a setting.

<br>

<br>

<b>Recommended</b>

<br>

nothing changes

<br>

<br>

<b>Strict</b>

<br>

mouse tracking is <u>disabled</u>, menus that open when hovered upon do not work

<br>

<br>

<a href="testing"><img style="float: right;" src="images/return.png"  alt="return" width="100"></a>

</div>

</body>

