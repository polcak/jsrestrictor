// SPDX-FileCopyrightText: 2021 Matúš Švancár
//
// SPDX-License-Identifier: GPL-3.0-or-later

var gl;
var shaderTypes = ["FRAGMENT_SHADER", "VERTEX_SHADER"];
var precisionTypes = ["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"];

function getShaderPrecision(gl, shaderType, precisionType) {
	var shaderPrecision = gl.getShaderPrecisionFormat(gl[shaderType], gl[precisionType]);
	return "rangeMin: " + shaderPrecision.rangeMin + " rangeMax: " + shaderPrecision.rangeMax + " precision: " + shaderPrecision.precision;
}

function getWebGLData(gl) {
	gl.getExtension('WEBGL_debug_renderer_info');
	var uvendor = gl.getParameter(0x9245);
	var urenderer = gl.getParameter(0x9246);
	var vendor = gl.getParameter(0x1F00);
	var renderer = gl.getParameter(0x1F01);
	var glversion = gl.getParameter(gl.VERSION);
	var shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
	document.getElementById('glversion').innerHTML += glversion;
	document.getElementById('shadingLanguageVersion').innerHTML += shadingLanguageVersion;
	document.getElementById('vendor').innerHTML += vendor;
	document.getElementById('renderer').innerHTML += renderer;
	document.getElementById('unmaskedVendor').innerHTML += uvendor;
	document.getElementById('unmaskedRenderer').innerHTML += urenderer;
	var ul = document.getElementById('extensionList');
	var extensions = gl.getSupportedExtensions();
	if (extensions) {
		for (var i = 0; i < extensions.length; i++) {
			var extension = extensions[i];
			var li = document.createElement('li');
			li.appendChild(document.createTextNode(extension));
			ul.appendChild(li);
		}
	}
	var ul = document.getElementById('precisionList');
	for (var i = 0; i < shaderTypes.length; i++) {
		var shaderType = shaderTypes[i];
		for (var j = 0; j < precisionTypes.length; j++) {
			var precisionType = precisionTypes[j];
			var shaderPrecision = getShaderPrecision(gl, shaderType, precisionType);
			var li = document.createElement('li');
			var span = document.createElement('span');
			li.appendChild(span);
			span.innerHTML = shaderType + " " + precisionType + " : ";
			li.appendChild(document.createTextNode(shaderPrecision));
			ul.appendChild(li);
		}
	}
}

function flip(imageData, flipped) {
	var ctx = flipped.getContext('2d');
	flipped.width = imageData.width;
	flipped.height = imageData.height;
	ctx.putImageData(imageData, 0, 0);
	ctx.globalCompositeOperation = 'copy';
	ctx.scale(1, -1);
	ctx.translate(0, -imageData.height);
	ctx.drawImage(flipped, 0, 0);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalCompositeOperation = 'source-over';
}
// webgl canvas used for fingerprinting on browserleaks
function test_webgl_canvas(gl) {
	try {
		var buff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buff);
		var n = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .7321, 0]);
		gl.bufferData(gl.ARRAY_BUFFER, n, gl.STATIC_DRAW), buff.itemSize = 3, buff.numItems = 3;
		var prog = gl.createProgram();
		var o = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(o, "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}");
		gl.compileShader(o);
		var n = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(n, "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}"),
		gl.compileShader(n);
		gl.attachShader(prog, o);
		gl.attachShader(prog, n);
		gl.linkProgram(prog);
		gl.useProgram(prog);
		prog.vertexPosAttrib = gl.getAttribLocation(prog, "attrVertex");
		prog.offsetUniform = gl.getUniformLocation(prog, "uniformOffset");
		gl.enableVertexAttribArray(prog.vertexPosArray);
		gl.vertexAttribPointer(prog.vertexPosAttrib, buff.itemSize, gl.FLOAT, !1, 0, 0);
		gl.uniform2f(prog.offsetUniform, 1, 1);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, buff.numItems);
	} catch (e) {
		console.log(e);
	}
	try {
		var res = document.getElementById('webglResultCanvas1');
		var ctx = res.getContext("2d");
		var imgdata = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
		gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, imgdata.data);
		// imageData need to be flipped, because readPixels reads backwards
		flip(imgdata, ctx.canvas);
	} catch (e) {
		console.log(e);
	}
	try {
		var res = document.getElementById('webglResultCanvas2');
		var ctx = res.getContext("2d");
		var img = new Image;
		img.onload = function() {
			ctx.drawImage(img, 0, 0);
		};
		img.src = gl.canvas.toDataURL();
	} catch (e) {
		console.log(e);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('webglCanvas');
	var gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("experimental-webgl2", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("webgl", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true}) ||
		 canvas.getContext("moz-webgl", { preserveDrawingBuffer: true});
	setTimeout(function() {
		test_webgl_canvas(gl)
	}, 100);
	setTimeout(function() {
		getWebGLData(gl)
	}, 100);
});
