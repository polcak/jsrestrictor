/** \file
 * \brief This file contains wrappers for Canvas-related calls
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 * \see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 * \see https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2023  Martin Zmitko
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 *  \license SPDX-License-Identifier: MPL-2.0
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
//  Alternatively, the contents of this file may be used under the terms
//  of the Mozilla Public License, v. 2.0, as described below:
//
//  This Source Code Form is subject to the terms of the Mozilla Public
//  License, v. 2.0. If a copy of the MPL was not distributed with this file,
//  You can obtain one at http://mozilla.org/MPL/2.0/.
//
//  \copyright Copyright (c) 2020 The Brave Authors.

/** \file
 * \ingroup wrappers
 * This file contains wrappers for calls related to the Canvas API, about which you can read more at MDN:
 *  * [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
 *  * [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 *  * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
 *
 * The goal is to prevent fingerprinting by modifying the values that can be read from the canvas.
 * So the visual content of wrapped canvases as displayed on the screen is the same as intended.
 *
 * The modified content can be either an empty image or a fake image that is modified according to
 * session and domain keys to be different than the original albeit very similar (i.e. the approach
 * inspired by the algorithms created by [Brave Software](https://brave.com) available [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc).
 *
 * Note that both approaches are detectable by a fingerprinter that checks if a predetermined image
 * inserted to the canvas is the same as the read one, see [here](https://arkenfox.github.io/TZP/tests/canvasnoise.html) for an example,
 * Nevertheless, the aim of the wrappers is to limit the finerprintability.
 *
 * Also note that a determined fingerprinter can reveal the modifications and consequently uncover
 * the original image. This can be avoided with the approach that completely clears the data stored
 * in the canvas. Use the modifications based on session and domain keys if you want to provide an
 * image that is similar to the original or if you want to produce a fake image that is not
 * obviously spoofed to a naked eye. Otherwise, use the clearing approach.
 */

/*
 * Create private namespace
 */
(function() {

	const DEF_CANVAS_COPY = `
		let canvasCopy = ctx => {
			let {width, height} = ctx.canvas;
			let fake = document.createElement("canvas");
			fake.setAttribute("width", width);
			fake.setAttribute("height", height);
			let stx = fake.getContext("2d");
			let imageData = window.CanvasRenderingContext2D.prototype.getImageData.call(ctx, 0, 0, width, height);
			stx.putImageData(imageData, 0, 0);
			return fake;
		};
	`;

	/** @var String helping_code.
	 * Selects if the canvas should be cleared (1) or a fake image should be created based on session
	 * and domain keys (0).
	 */
	var helping_code = `var approach = args[0];`;
	var wrappers = [{
			parent_object: "HTMLCanvasElement.prototype",
			parent_object_property: "toDataURL",
			wrapped_objects: [{
				original_name: "HTMLCanvasElement.prototype.toDataURL",
				wrapped_name: "origToDataURL",
			}],
			helping_code: helping_code,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.HTMLCanvasElement.prototype.toDataURL",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake HTMLCanvasElement.prototype.toDataURL
			 * \brief Returns fake canvas content, see CanvasRenderingContext2D.prototype for more details.
			 *
			 * Internally creates a fake canvas of the same height and width as the original and calls
			 * CanvasRenderingContext2D.getImageData() that determines the result. If canvas uses WebGLRenderingContext
			 * the content is copied to new canvas using CanvasRenderingContext2D and function toDataURL is called on it.
			 */
			wrapping_function_body: `
				var ctx = this.getContext("2d");
				if(ctx){
					${DEF_CANVAS_COPY}
					return origToDataURL.call(canvasCopy(ctx), ...args);
				}
				else {
					var ctx = this.getContext("webgl2", {preserveDrawingBuffer: true}) ||
					  this.getContext("experimental-webgl2", {preserveDrawingBuffer: true}) ||
					  this.getContext("webgl", {preserveDrawingBuffer: true}) ||
					  this.getContext("experimental-webgl", {preserveDrawingBuffer: true}) ||
					  this.getContext("moz-webgl", {preserveDrawingBuffer: true});
					if(ctx){
					  var fake = document.createElement("canvas");
					  fake.setAttribute("width", this.width);
					  fake.setAttribute("height", this.height);
					  var stx = fake.getContext("2d");
					  stx.drawImage(ctx.canvas, 0, 0);
					  return HTMLCanvasElement.prototype.toDataURL.call(fake);
          }
				}
				`,
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "getImageData",
			wrapped_objects: [{
				original_name: "CanvasRenderingContext2D.prototype.getImageData",
				wrapped_name: "origGetImageData",
			}],
			helping_code: helping_code + farbleCanvasDataBrave.toString() + `
				var farble = function(context, fake) {
					if(approach === 1){
						fake.fillStyle = "white";
						fake.fillRect(0, 0, context.canvas.width, context.canvas.height);
						return;
					}
					else if(approach === 0){
						const width = context.canvas.width;
						const height = context.canvas.height;
						const imageData = origGetImageData.call(context, 0, 0, width, height);
						const len = imageData.data.length;
						if (wasm.ready && wasm.grow(len)) {
							farblePixelsWASM();
						} else {
							farblePixelsJS();
						}
						// Do not modify the original canvas, always modify the fake canvas.
						// Always farble the whole image so that the farbled data do not depend
						// on the page-specified extraction data rectangle.
						fake.putImageData(imageData, 0, 0);
						
						function farblePixelsWASM() {
							wasm.set(imageData.data);
							const crc = wasm.crc16(len);
							const mash = new Mash();
							mash.addData(' ');
							mash.addData(domainHash);
							mash.addData("CanvasFarbling");
							mash.addData(crc);
							wasm.farbleBytes(len, mash.n | 0, true);
							imageData.data.set(wasm.get(len));
						}
						
						function farblePixelsJS() {
							const BYTES_PER_ROW = width * 4;
							farbleCanvasDataBrave(function*() {
								let data = imageData.data;
								let offset = 0;
								while (offset < len) {
									yield data.subarray(offset, offset + BYTES_PER_ROW);
									offset += BYTES_PER_ROW;
								}
							}, width);
						}
					}
				};`,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.CanvasRenderingContext2D.prototype.getImageData",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake CanvasRenderingContext2D.prototype.getImageData
			 * \brief Returns a fake image data of the same height and width as stored in the original canvas.
			 *
			 * Internally calls the farbling that select the output which can be either an empty image or
			 * a fake image that is modified according to session and domain keys to be different than the
			 * original albeit very similar.
			 */
			wrapping_function_body: `
				var fake = document.createElement("canvas");
				fake.setAttribute("width", this.canvas.width);
				fake.setAttribute("height", this.canvas.height);
				var stx = fake.getContext("2d");
				farble(this,stx);
				return origGetImageData.call(stx, ...args);
			`,
		},
		{
			parent_object: "HTMLCanvasElement.prototype",
			parent_object_property: "toBlob",
			wrapped_objects: [{
				original_name: "HTMLCanvasElement.prototype.toBlob",
				wrapped_name: "origToBlob",
			}],
			helping_code: ``,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.HTMLCanvasElement.prototype.toBlob",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake HTMLCanvasElement.prototype.toBlob
			 * \brief Returns fake canvas content, see CanvasRenderingContext2D.prototype for more details.
			 *
			 * Internally creates a fake canvas of the same height and width as the original and calls
			 * CanvasRenderingContext2D.getImageData() that detemines the result.
			 */
			wrapping_function_body: `
				${DEF_CANVAS_COPY}
				return origToBlob.call(canvasCopy(this.getContext("2d")), ...args);
			`,
		},
		{
			parent_object: "OffscreenCanvas.prototype",
			parent_object_property: "convertToBlob",
			wrapped_objects: [{
				original_name: "OffscreenCanvas.prototype.convertToBlob",
				wrapped_name: "origConvertToBlob",
			}],
			helping_code: ``,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.OffscreenCanvas.prototype.convertToBlob",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake OffscreenCanvas.prototype.convertToBlob
			 * \brief Returns fake canvas content, see CanvasRenderingContext2D.prototype for more details.
			 *
			 * Internally creates a fake canvas of the same height and width as the original and calls
			 * CanvasRenderingContext2D.getImageData() that detemines the result.
			 */
			wrapping_function_body: `
			${DEF_CANVAS_COPY}
			return origConvertToBlob.call(canvasCopy(this.getContext("2d")), ...args);
			`,
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "isPointInPath",
			wrapped_objects: [{
				original_name: "CanvasRenderingContext2D.prototype.isPointInPath",
				wrapped_name: "origIsPointInPath",
			}],
			helping_code: helping_code + `
				function farbleIsPointInPath(ctx, ...args){
					if(approach === 0){
						var ret = origIsPointInPath.call(ctx, ...args);
						return (ret && ((prng()*20) > 1));
					}
					else if(approach === 1){
						return false;
					}
				};
			`,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.CanvasRenderingContext2D.prototype.isPointInPath",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake CanvasRenderingContext2D.prototype.isPointInPath
			 * \brief Returns modified result
			 *
			 * Either returns false or original function return value which is changed to false with 1/20 probability
			 *
			 * \bug Changing value with probability has some issues:
			 * * multiple calls with the same pixel can return different values
			 * * inconsistencies among adjacent pixels
			 */
			wrapping_function_body: `
				return farbleIsPointInPath(this, ...args);
			`,
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "isPointInStroke",
			wrapped_objects: [{
				original_name: "CanvasRenderingContext2D.prototype.isPointInStroke",
				wrapped_name: "origIsPointInStroke",
			}],
			helping_code: helping_code + `
				function farbleIsPointInStroke(ctx, ...args){
					if(approach === 0){
						var ret = origIsPointInStroke.call(ctx, ...args);
						return (ret && ((prng()*20) > 1));
					}
					else if(approach === 1){
						return false;
					}
				};
			`,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.CanvasRenderingContext2D.prototype.isPointInStroke",
			replace_original_function: true,
			wrapping_function_args: "...args",
			/** \fn fake CanvasRenderingContext2D.prototype.isPointInStroke
			 * \brief Returns modified result
			 *
			 * Either returns false or original function return value which is changed to false with 1/20 probability
			 *
			 * \bug Changing value with probability has some issues:
			 * * multiple calls with the same pixel can return different values
			 * * inconsistencies among adjacent pixels
			 */
			wrapping_function_body: `
				return farbleIsPointInStroke(this, ...args);
			`,
		},
	]
	add_wrappers(wrappers);
})();
