// SPDX-FileCopyrightText: 2019 Martin Timko
// SPDX-FileCopyrightText: 2021 Matúš Švancár
//
// SPDX-License-Identifier: GPL-3.0-or-later

function writeLineToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x1 = Math.floor(Math.random()*800);
	var y1 = Math.floor(Math.random()*200);
	var x2 = Math.floor(Math.random()*800);
	var y2 = Math.floor(Math.random()*200);

	// add line to canvas
	var context = myCanvas.getContext("2d");
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

function writeCircleToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x = Math.floor(Math.random()*700)+50;
	var y = Math.floor(Math.random()*150)+25;
	var size = Math.floor(Math.random()*30)+20;

	// add circle to canvas
	var context = myCanvas.getContext("2d");
	context.beginPath();
	context.arc(x, y, size, 0, 2 * Math.PI);
	context.stroke();
}

function writeTextToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x = Math.floor(Math.random()*700)+50;
	var y = Math.floor(Math.random()*150)+25;

	// add text to canvas
	var myCanvas = document.getElementById(canvasId);
	var context = myCanvas.getContext("2d");
	context.font = "26px Arial";
	context.fillText("Text example", x, y);
}

function writeOutlineTextToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x = Math.floor(Math.random()*600)+50;
	var y = Math.floor(Math.random()*150)+25;

	// add outline text to canvas
	var myCanvas = document.getElementById(canvasId);
	var context = myCanvas.getContext("2d");
	context.font = "36px Arial";
	context.fillText("Text example", x, y);
}

function writeGradientToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x = Math.floor(Math.random()*600)+20;
	var y = Math.floor(Math.random()*150)+10;

	// gradient
	var myCanvas = document.getElementById(canvasId);
	var context = myCanvas.getContext("2d");
	var grd = context.createLinearGradient(x, y, x+150, y+100);
	grd.addColorStop(0, "blue");
	grd.addColorStop(1, "white");
	context.fillStyle = grd;
	context.fillRect(x, y, 150, 100);
}

function writeImageToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x = Math.floor(Math.random()*600);
	var y = Math.floor(Math.random()*100);

	var myCanvas = document.getElementById(canvasId);
	var context = myCanvas.getContext("2d");
	var img = document.getElementById("demo-image");
	context.drawImage(img, x, y);
}

function getData(canvasId) {
	var myCanvas = document.getElementById(canvasId);
	const image = new Image();
	var context = myCanvas.getContext("2d");

	image.onload = function() {
	    context.drawImage(image, 0, 0);
	}
	image.src = myCanvas.toDataURL();
	context.clearRect(0, 0, myCanvas.width, myCanvas.height);

	document.getElementById("canvasUp").innerHTML = "Canvas frame";
	setTimeout(function(){ document.getElementById("canvasUp").innerHTML = "Canvas frame updated"; }, 300);


}

function testCanvas(origCtx) {
	var res = document.getElementById('resultCanvas1');
	var ctx = res.getContext("2d");


	var imgdata = origCtx.getImageData(0, 0, origCtx.canvas.width, origCtx.canvas.height);
	ctx.putImageData(imgdata, 0, 0);

	var res1 = document.getElementById('resultCanvas2');
	var ctx1 = res1.getContext("2d");
	var img = new Image;
	img.onload = function() {
		ctx1.drawImage(img, 0, 0);
	};
	img.src = origCtx.canvas.toDataURL();

}

function isPoint() {

	//static calls after timeout
	const canvas2 = document.getElementById('canvas2');
	const ctx2 = canvas2.getContext('2d');
	const result = document.getElementById('result');

	ctx2.rect(10, 10, 100, 100);
	ctx2.stroke();
	setTimeout(function() {
		result.innerText = ctx2.isPointInStroke(50, 10);
	}, 15);

	const canvas4 = document.getElementById('canvas4');
	const ctx4 = canvas4.getContext('2d');
	const result1 = document.getElementById('result1');

	ctx4.rect(10, 10, 100, 100);
	ctx4.fill();
	setTimeout(function() {
		result1.innerText = ctx4.isPointInPath(30, 70);
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
	setTimeout(function() {
		var myCanvas = document.getElementById('canvasx');
		var context = myCanvas.getContext("2d");
		var img = document.getElementById("fp-image");
		context.drawImage(img, 0, 0);
		testCanvas(context);
	}, 100);
	isPoint();
}, false);
