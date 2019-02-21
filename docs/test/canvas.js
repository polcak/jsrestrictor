function writeLineToCanvas(canvasId) {
	var myCanvas = document.getElementById(canvasId);

	// random data
	var x1 = Math.floor(Math.random()*800);
	var y1 = Math.floor(Math.random()*200);
	var x2 = Math.floor(Math.random()*800);
	var y2 = Math.floor(Math.random()*200);

	// add line to canvas
	var context = myCanvas.getContext("2d");
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
