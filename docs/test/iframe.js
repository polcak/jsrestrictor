"use strict";

function createResults(canvas_el, result_id) {
	var html = "<h3>toDataURL</h3>";
	html += "<pre>" + canvas_el.toDataURL + "</pre>";
	html += "<h3>getImageData</h3>";
	html += "<pre>" + canvas_el.getContext('2d').getImageData + "</pre>";
	html += "<h3>toBlob</h3>";
	html += "<pre>" + canvas_el.toBlob + "</pre>";

	var iframe = document.createElement("iframe");
	document.body.appendChild(iframe);
	// Native toString function from iframe context which can be used later on.
	var iframeToString = iframe.contentWindow.window.Function.prototype.toString;
	iframe.parentNode.removeChild(iframe);
	html += "<h3>performance.now</h3>";
	html += "<pre>" + iframeToString.call(performance.now) + "</pre>";

	document.getElementById(result_id).innerHTML = html;
}
createResults(document.createElement("canvas"), "iframe_result");
