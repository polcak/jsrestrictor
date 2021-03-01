//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2021  Matus Svancar
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
//  Copyright (c) 2020 The Brave Authors.

/** \file
 * This file contains wrappers for Canvas-related calls
 *  * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 *  * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 *  * https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
 *
 * The goal is to prevent fingerprinting by modifying the values that can be read from the canvas.
 * So the visual content of wrapped canvases as displayed on the screen is the same as intended.
 *
 * The modified content can be either an empty image or a fake image that is modified according to
 * session and domain keys to be different than the original albeit very similar (i.e. the approach
 * inspired by the algorithms created by Brave Software <https://brave.com>
 * available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc.
 *
 * Note that both approaches are detectable by a fingerprinter that checks if a predetermined image
 * inserted to the canvas is the same as the read one, see for example,
 * https://arkenfox.github.io/TZP/tests/canvasnoise.html. Nevertheless, the aim of the wrappers is
 * to limit the finerprintability.
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
	/** \fn fake create_post_wrappers
	 * \brief This function is used to prevent access to unwrapped APIs through iframes.
	 *
	 * \param The object to wrap like HTMLIFrameElement.prototype
	 */
	function create_post_wrappers(parent_object) {
		return [{
				code_type: "object_properties",
				parent_object: parent_object,
				parent_object_property: "contentWindow",
				wrapped_objects: [{
					original_name: "Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')['get'];",
					wrapped_name: "cw",
				}],
				wrapped_properties: [{
					property_name: "get",
					property_value: `
								function() {
									var parent=cw.call(this);
									try {
										parent.HTMLCanvasElement;
									}
									catch(d) {
										return; // HTMLIFrameElement.contentWindow properties could not be accessed anyway
									}
									wrapping(parent);
									return parent;
								}`,
				}],
			},
			{
				code_type: "object_properties",
				parent_object: parent_object,
				parent_object_property: "contentDocument",
				wrapped_objects: [{
					original_name: "Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentDocument')['get'];",
					wrapped_name: "cd",
				}, ],
				wrapped_properties: [{
					property_name: "get",
					property_value: `
								function() {
									var parent=cw.call(this);
									try{
										parent.HTMLCanvasElement;
									}
									catch(d) {
										return; // HTMLIFrameElement.contentDocument properties could not be accessed anywaya
									}
									wrapping(parent);
									return cd.call(this);
								}`,
				}, ],
			},
		];
	}

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
			 * CanvasRenderingContext2D.getImageData() that detemines the result.
			 */
			wrapping_function_body: `
				var ctx = this.getContext("2d");
				if(ctx){
					var fake = document.createElement("canvas");
					fake.setAttribute("width", this.width);
					fake.setAttribute("height", this.height);
					var stx = fake.getContext("2d");
					var imageData = ctx.getImageData(0, 0, this.width, this.height);
					stx.putImageData(imageData, 0, 0);
					return origToDataURL.call(fake, ...args);
				}
				else {
					return origToDataURL.call(this, ...args);
				}
				`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "getImageData",
			wrapped_objects: [{
				original_name: "CanvasRenderingContext2D.prototype.getImageData",
				wrapped_name: "origGetImageData",
			}],
			helping_code: helping_code + `
				function lfsr_next(v) {
					return BigInt.asUintN(64, ((v >> 1n) | (((v << 62n) ^ (v << 61n)) & (~(~0n << 63n) << 62n))));
				}
				var farble = function(context, fake) {
					if(approach === 1){
					fake.fillStyle = "white";
					fake.fillRect(0, 0, context.canvas.width, context.canvas.height);
					return;
				}
				else if(approach === 0){
					const width = context.canvas.width;
					const height = context.canvas.height;
					var imageData = origGetImageData.call(context, 0, 0, width, height);
					fake.putImageData(imageData, 0, 0);
					var fakeData = origGetImageData.call(fake, 0, 0, width, height);
					var pixel_count = BigInt(width * height);
					var channel = domainHash[0].charCodeAt(0) % 3;
					var canvas_key = domainHash;
					var v = BigInt(sessionHash);

					for (let i = 0; i < 32; i++) {
						var bit = canvas_key[i];
						for (let j = 8; j >= 0; j--) {
							var pixel_index = (4 * Number(v % pixel_count) + channel);
							fakeData.data[pixel_index] = fakeData.data[pixel_index] ^ (bit & 0x1);
							bit = bit >> 1;
							v = lfsr_next(v);
						}
					}
					fake.putImageData(fakeData, 0, 0);
				}
			};`,
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.CanvasRenderingContext2D.prototype.getImageData",
			replace_original_function: true,
			wrapping_function_args: "sx, sy, sw, sh",
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
				return origGetImageData.call(stx, sx, sy, sw, sh);
			`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
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
				var ctx = this.getContext("2d");
				var fake = document.createElement("canvas");
				fake.setAttribute("width", this.width);
				fake.setAttribute("height", this.height);
				var stx = fake.getContext("2d");
				var imageData = ctx.getImageData(0,0,this.width,this.height);
				stx.putImageData(imageData, 0, 0);
				return origToBlob.call(fake, ...args);
			`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
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
				var ctx = this.getContext("2d");
				var fake = document.createElement("canvas");
				fake.setAttribute("width", this.width);
				fake.setAttribute("height", this.height);
				var stx = fake.getContext("2d");
				var imageData = ctx.getImageData(0,0,this.width,this.height);
				stx.putImageData(imageData, 0, 0);
				return origConvertToBlob.call(fake, ...args);
			`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
		}
	]
	add_wrappers(wrappers);
})();
