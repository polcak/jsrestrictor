/** \file
 * \brief This file contains performance test page for Canvas and Audio wrappers.
 *
 *  \author Copyright (C) 2023  Libor Polcak
 *  \author Copyright (C) 2023  Martin Zmitko
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

var results = [], result = [];
var t, data;
var runs = 10;
var context, analyser;

function rngArray(length) {
    const arr = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = Math.random() * 2 - 1;
    }
    return arr;
}

function resizeCanvas(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
}

function audioBenchmark() {
    results = [], result = [];
    runs = 10;
    context = new(window.AudioContext || window.webkitAudioContext);
    
    document.getElementById("audioh").textContent = `Audio ${runs}`;
    setTimeout(testA2, 40, 10000);
}

function testA(i) {
    const buffer = context.createBuffer(1, i, 44100);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let t = performance.now();
    analyser.getByteFrequencyData(data);
    result.push(performance.now() - t);
    if (data.length === results[i]) console.log(data); // This is to prevent the engine from optimizing the code
    console.log(i);
    if (i < 32768) setTimeout(testA, 40, i * 2); // 2^24
    else {
        if (runs > 1) {
            runs--;
            document.getElementById("audioh").textContent = `Audio ${runs}`;
            results.push(result);
            result = [];
            setTimeout(testA, 40, 32);
        } else {
            document.getElementById("audioh").textContent = `Audio DONE`;
            processResults();
        }
    }
}

function testA2(i) {
    var buffer = context.createBuffer(1, i, 44100);
    let t = performance.now();
    data = buffer.getChannelData(0);
    result.push(performance.now() - t);
    if (data.length === results[i]) console.log(data); // This is to prevent the engine from optimizing the code
    if (i < 1000000) setTimeout(testA2, 40, i + 10000);
    else {
        if (runs > 1) {
            runs--;
            document.getElementById("audioh").textContent = `Audio ${runs}`;
            results.push(result);
            result = [];
            setTimeout(testA2, 40, 10000);
        } else {
            document.getElementById("audioh").textContent = `Audio DONE`;
            processResults();
        }
    }
}

function benchmark(canvasId) {
    results = [], result = [];
    runs = 10;
	var myCanvas = document.getElementById(canvasId);
	var context = myCanvas.getContext("2d")
    document.getElementById("canvash").textContent = `Canvas ${runs}`;
    setTimeout(() => {
        // Warm up the engine
        for (var i = 1; i < 100; i += 10) {
            resizeCanvas(canvasId, i, i);
            data = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            if (data.data.length === results[i]) console.log(data); // This is to prevent the engine from optimizing the code
        }
        // Run the tests
        setTimeout(test, 40, 10, context, myCanvas);
    }, 1000);
}

function test(i, context, canvas) {
    resizeCanvas(canvas, i, i);
    const width = context.canvas.width;
    const height = context.canvas.height;
    t = performance.now();
    data = context.getImageData(0, 0, width, height);
    result.push(performance.now() - t);
    if (data.data.length === results[i]) console.log(data); // This is to prevent the engine from optimizing the code
    if (i < 1000) setTimeout(test, 40, i + 10, context, canvas);
    else {
        if (runs > 1) {
            runs--;
            document.getElementById("canvash").textContent = `Canvas ${runs}`;
            results.push(result);
            result = [];
            setTimeout(test, 40, 10, context, canvas);
        } else {
            processResults();
            document.getElementById("canvash").textContent = `Canvas DONE`;
        }
    }
}

function benchmark3d(canvasId) {
    results = [], result = [];
    runs = 10;
	var canvas = document.getElementById(canvasId);
	var ctx = document.getElementById("canvas1").getContext("2d");
	var gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("experimental-webgl2", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("webgl", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("moz-webgl", { preserveDrawingBuffer: true});
    document.getElementById("canvasUp2").textContent = `Canvas ${runs}`;
    setTimeout(() => {
        // Warm up the engine
        for (var i = 1; i < 100; i += 10) {
            resizeCanvas(canvasId, i, i);
						var imgdata = ctx.createImageData(gl.canvas.width, gl.canvas.height);
						gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, imgdata.data);
            if (imgdata.data.length === results[i]) console.log(imgdata); // This is to prevent the engine from optimizing the code
        }
        // Run the tests
        setTimeout(test3d, 40, 10, gl, canvas, ctx);
    }, 1000);
}

function test3d(i, gl, canvas, ctx) {
    resizeCanvas(canvas, i, i);
    const width = gl.canvas.width;
    const height = gl.canvas.height;
		var imgdata = ctx.createImageData(gl.canvas.width, gl.canvas.height);
    t = performance.now();
		gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, imgdata.data);
    result.push(performance.now() - t);
    if (imgdata.data.length === results[i]) console.log(imgdata); // This is to prevent the engine from optimizing the code
    if (i < 1000) setTimeout(test3d, 40, i + 10, gl, canvas, ctx);
    else {
        if (runs > 1) {
            runs--;
            document.getElementById("canvasUp2").textContent = `Canvas ${runs}`;
            results.push(result);
            result = [];
            setTimeout(test3d, 40, 10, gl, canvas, ctx);
        } else {
            processResults();
            document.getElementById("canvasUp2").textContent = `Canvas DONE`;
        }
    }
}

function processResults() {
    const medianArr = [];
    const avgArr = [];

    for (let i = 0; i < results[0].length; i++) {
        const column = results.map(inner => inner[i]);
        medianArr.push(math.median(column));
        avgArr.push(math.mean(column));
    }

    console.log(results);
    console.log(medianArr);
    console.log(avgArr);
}
