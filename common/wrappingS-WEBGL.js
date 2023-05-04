/** \file
 * \brief Wrappers for WebGL Specification standards (both 1.0 and 2.0)
 *
 * \see https://www.khronos.org/registry/webgl/specs/latest/1.0/
 * \see https://www.khronos.org/registry/webgl/specs/latest/2.0/
 *
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
 * This file contains wrappers for WebGL related calls
 *  * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 *  * https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
 * \ingroup wrappers
 *
 * The goal is to prevent fingerprinting by modifying the values from certain WebGLRenderingContext API functions.
 * This includes return values of various functions which can be hardware/software specific and image data reading.
 *
 * Content is either modified according to domain and session keys to be different than the original albeit very similar
 * or replaced by bottom value which is consistent every time.
 * Both approaches are inspired by the algorithms created by [Brave Software](https://brave.com) available [here](https://github.com/brave/brave-core/$blob/master/chromium_src/third_party/blink/renderer/modules/webgl/webgl_rendering_context_base.cc)
 * and [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/webgl/webgl2_rendering_context_base.cc).
 *
 * This wrapper operates with two levels of protection:
 *	* (0) - return modified results, such as slightly changed image, slightly changed number or random string
 *	* (1) - return bottom values - such as zero, empty string, empty image, null, etc.
 *
 * Level 0 is trying to force WebGL fingeprint to be unique on every domain and every session. This can be effective
 * when used with other wrappers with same options. This level causes breakage of websites using WebGL only rarely.
 * Level 1 is trying to return as little information as possible while being consistent across domains and sessions.
 * This level can cause breakage on majority of websites using WebGL.
 *
 * \note Both approaches are detectable by a fingerprinter that checks if a predetermined image
 * is the same as the read one or if specific function returns expected value.
 * Nevertheless, the aim of the wrappers is to limit the finerprintability.
 *
 */
/*
 * Create private namespace
 */
(function() {
  /**
	 * \brief subtract one from given number with ~50% probability relative to given enum and return it
	 *
	 * \param number original Number value to edit
   * \param pname enum of argument given to getParameter
	 *
	 */
	function farbleGLint(number, pname) {
		var ret = 0;
		if(number > 0){
			let mash = new Mash();
			mash.addNumber(STATIC_RANDOM_VALUE);
			mash.addNumber(number);
			mash.addNumber(pname);
			ret = Math.floor(mash.finalize() * number);
		}
		return ret;
	}
	/**
	 * \brief Modifies WebGLRenderingContext.getParameter return value for some specific parameters, original value for the rest
	 *
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - depending on type - either changed original number or random string
	 *	* (1) - bottom value depending on parameter [null, 0, empty string, random string]
	 */
	function farbleGetParameter(ctx, pname) {
		if(args[0]===1) {
			var ret;
			switch (pname) {
				case 0x1F02: // VERSION: WebGL 1.0/ WebGL 2.0
				case 0x1F01: // RENDERER
				case 0x9246: // UNMASKED_RENDERER_WEBGL
				case 0x1F00: // VENDOR
				case 0x9245: // UNMASKED_VENDOR_WEBGL
				case 0x8B8C: // SHADING_LANGUAGE_VERSION
					ret = "";
					break;
				case 0x8F36: // COPY_READ_BUFFER
				case 0x8F37: // COPY_WRITE_BUFFER
				case 0x8CA6: // DRAW_FRAMEBUFFER_BINDING
					ret = null;
					break;
				case 0x8B4A: // MAX_VERTEX_UNIFORM_COMPONENTS
				case 0x8A2B: // MAX_VERTEX_UNIFORM_BLOCKS
				case 0x9122: // MAX_VERTEX_OUTPUT_COMPONENTS
				case 0x8B4B: // MAX_VARYING_COMPONENTS
				case 0x8C8A: // MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS
				case 0x8B49: // MAX_FRAGMENT_UNIFORM_COMPONENTS
				case 0x8A2D: // MAX_FRAGMENT_UNIFORM_BLOCKS
				case 0x9125: // MAX_FRAGMENT_INPUT_COMPONENTS
				case 0x8A2F: // MAX_UNIFORM_BUFFER_BINDINGS
				case 0x8A2E: // MAX_COMBINED_UNIFORM_BLOCKS
				case 0x8A31: // MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS
				case 0x8A33: // MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS
				case 0x8A30: // MAX_UNIFORM_BLOCK_SIZE
				case 0x8869: // MAX_VERTEX_ATTRIBS
				case 0x8DFB: // MAX_VERTEX_UNIFORM_VECTORS
				case 0x8B4C: // MAX_VERTEX_TEXTURE_IMAGE_UNITS
				case 0x0D33: // MAX_TEXTURE_SIZE
				case 0x851C: // MAX_CUBE_MAP_TEXTURE_SIZE
				case 0x8073: // MAX_3D_TEXTURE_SIZE
				case 0x88FF: // MAX_ARRAY_TEXTURE_LAYERS
					ret = 0;
					break;
				default:
					ret = origGetParameter.call(ctx, pname);
			}
			return ret;
		}
		else if(args[0]===0) {
			var ret;
			switch (pname) {
				case 0x8B4A: // MAX_VERTEX_UNIFORM_COMPONENTS
				case 0x8A2B: // MAX_VERTEX_UNIFORM_BLOCKS
				case 0x9122: // MAX_VERTEX_OUTPUT_COMPONENTS
				case 0x8B4B: // MAX_VARYING_COMPONENTS
				case 0x8C8A: // MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS
				case 0x8B49: // MAX_FRAGMENT_UNIFORM_COMPONENTS
				case 0x8A2D: // MAX_FRAGMENT_UNIFORM_BLOCKS
				case 0x9125: // MAX_FRAGMENT_INPUT_COMPONENTS
				case 0x8A2F: // MAX_UNIFORM_BUFFER_BINDINGS
				case 0x8A2E: // MAX_COMBINED_UNIFORM_BLOCKS
				case 0x8A31: // MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS
				case 0x8A33: // MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS
				case 0x8869: // MAX_VERTEX_ATTRIBS
				case 0x8DFB: // MAX_VERTEX_UNIFORM_VECTORS
				case 0x8B4C: // MAX_VERTEX_TEXTURE_IMAGE_UNITS
				case 0x0D33: // MAX_TEXTURE_SIZE
				case 0x851C: // MAX_CUBE_MAP_TEXTURE_SIZE
				case 0x8073: // MAX_3D_TEXTURE_SIZE
				case 0x88FF: // MAX_ARRAY_TEXTURE_LAYERS
					var result = origGetParameter.call(ctx, pname);
					ret = farbleGLint(result, pname);
					break;
				case 0x9245: // UNMASKED_VENDOR_WEBGL
					ret = unmasked_vendor;
					break;
				case 0x9246: // UNMASKED_RENDERER_WEBGL
					ret = unmasked_renderer;
					break;
				case 0x1F01: // RENDERER
					ret = renderer;
					break;
				case 0x1F00: // VENDOR
					ret = vendor;
					break;
				default:
					ret = origGetParameter.call(ctx, pname);
			}
			return ret;
		}
	};
	let farbleGetParameterString = `
				var webgl_prng = alea(domainHash, "WebGL wrappers");
				var unmasked_vendor = randomString(8, 0, webgl_prng);
				var vendor = randomString(8, 0, webgl_prng);
				var unmasked_renderer = randomString(8, 0, webgl_prng);
				var renderer = randomString(8, 0, webgl_prng);
				const STATIC_RANDOM_VALUE = webgl_prng.uint32();
				`+
				farbleGetParameter;
	/**
	 * \brief Returns null or output of given function
	 *
	 * \param name of original function
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - null
	 */
	function farbleNull(name, ctx, ...fcarg) {
		if(args[0]===1) {
			return null;
		}
		else if(args[0]===0) {
			return name.call(ctx, ...fcarg);
		}
	};
	/**
	 * \brief Returns 0 or output of given function
	 *
	 * \param name of original function
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - zero
	 */
	function farbleZero(name, ctx, ...fcarg) {
		if(args[0]===1) {
			return 0;
		}
		else if(args[0]===0) {
			return name.call(ctx, ...fcarg);
		}
	};
	/**
	 * \brief Returns -1 or output of given function
	 *
	 * \param name of original function
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - minus one
	 */
	function farbleMinusOne(name, ctx, ...fcarg) {
		if(args[0]===1) {
			return -1;
		}
		else if(args[0]===0) {
			return  name.call(ctx, ...fcarg);
		}
	};
	/**
	 * \brief Returns [] or output of given function
	 *
	 * \param name of original function
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - empty array
	 */
	function farbleNullArray(name, ctx, ...fcarg) {
		if(args[0]===1) {
			return new window.Array;
		}
		else if(args[0]===0) {
			return  name.call(ctx, ...fcarg);
		}
	};
  /**
	 * \brief Returns empty WebGLShaderPrecisionFormat object or real value
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - WebGLShaderPrecisionFormat object with empty attributes
	 */
	function farbleGetPrecisionFormat(ctx, ...fcarg) {
		if(args[0]===1) {
			var ret = Object.create(WebGLShaderPrecisionFormat.prototype);
			Object.defineProperties(ret, {
				rangeMin:{
					value:0
				},
				rangeMax:{
					value:0
				},
				precision:{
					value:0
				}
			});
			return ret;
		}
		else if(args[0]===0) {
			return origGetShaderPrecisionFormat.call(ctx, ...fcarg);
		}
	};
	/**
	 * \brief  Returns empty WebGLActiveInfo object or real value
	 *
	 * \param name of original function
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param ...fcarg delegated arguments depending on function
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - WebGLActiveInfo object with empty attributes
	 */
	function farbleGetActives(name, ctx, ...fcarg) {
		if(args[0]===1) {
			var ret = Object.create(WebGLActiveInfo.prototype);
			Object.defineProperties(ret, {
				name:{
					value:""
				},
				type:{
					value:5124
				},
				size:{
					value:0
				}
			});
			return ret;
		}
		else if(args[0]===0) {
			return name.call(ctx, ...fcarg);
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getFramebufferAttachmentParameter output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param target GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
 	 * \param attachment GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (0, 34069, 9729, 5124)
	 */
	function farbleGetFramebufferAttachmentParameter(ctx, target, attachment, pname) {
		if(args[0]===0) {
			return origFrameBufferAttachmentParameter.call(ctx, target, attachment, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8CD2:
				case 0x8212:
				case 0x8213:
				case 0x8214:
				case 0x8215:
				case 0x8216:
				case 0x8217:
				case 0x8CD4:
				case 0x8CD0:
					ret = 0;
					break;
				case 0x8CD3:
					ret = 34069;
					break;
				case 0x8210:
					ret = 9729;
					break;
				case 0x8211:
					ret = 5124;
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getVertexAttrib output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param index GLuint specifying index
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (false, 0, 5120, empty Float32Array)
	 */
	function farbleGetVertexAttrib(ctx, index, pname) {
		if(args[0]===0) {
			return origGetVertexAttrib.call(ctx, index, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8622:
				case 0x886A:
				case 0x88FD:
					ret = false;
					break;
				case 0x8623:
				case 0x8624:
				case 0x88FE:
					ret = 0;
					break;
				case 0x8625:
					ret = 5120;
					break;
				case 0x8626:
					ret = new Float32Array([0,0,0,0]);
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getBufferParameter output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param target GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (0, 35044)
	 */
	function farbleGetBufferParameter(ctx, target, pname) {
		if(args[0]===0) {
			return origGetBufferParameter.call(ctx, target, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8764:
					ret = 0;
					break;
				case 0x8765:
					ret = 35044;
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getShaderParameter output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param program WebGLShader object (https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader)
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (false, 35633)
	 */
	function farbleGetShaderParameter(ctx, shader, pname) {
		if(args[0]===0) {
			return origGetShaderParameter.call(ctx, shader, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8B80:
				case 0x8B81:
					ret = false;
					break;
				case 0x8B4F:
					ret = 35633;
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getRenderbufferParameter output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param target GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (0, 32854)
	 */
	function farbleGetRenderbufferParameter(ctx, target, pname) {
		if(args[0]===0) {
			return origGetRenderbufferParameter.call(ctx, target, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8D42:
				case 0x8D43:
				case 0x8D50:
				case 0x8D51:
				case 0x8D52:
				case 0x8D53:
				case 0x8D54:
				case 0x8D55:
				case 0x8CAB:
					ret = 0;
					break;
				case 0x8D44:
					ret = 32854;
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Returns modified WebGLRenderingContext.getProgramParameter output for some specific parameters, original value for the rest
	 *
	 * \param ctx WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param program WebGLProgram object (https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram)
	 * \param pname GLenum (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants)
	 *
	 * Depending on level chosen this function returns:
	 *	* (0) - original value
	 *	* (1) - bottom value (false, 0, 35981)
	 */
	function farbleGetProgramParameter(ctx, program, pname) {
		if(args[0]===0) {
			return origGetProgramParameter.call(ctx, program, pname);
		}
		else if(args[0]===1) {
			var ret = null;
			switch (pname) {
				case 0x8B80:
				case 0x8B82:
				case 0x8B83:
					ret = false;
					break;
				case 0x8B85:
				case 0x8B89:
				case 0x8B86:
				case 0x8C83:
				case 0x8A36:
					ret = 0;
					break;
				case 0x8C7F:
					ret = 35981;
					break;
			}
			return ret;
		}
	};
	/**
	 * \brief Modifies pixels array
	 *
	 * \param gl WebGLRenderingContext (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
	 * \param x starting x position
	 * \param y starting y position
	 * \param width width to be read (in pixels)
	 * \param height height to be read (in pixels)
	 * \param format format of read pixel data
	 * \param type specifies data type of pixels
	 * \param pixels typed array to return result
	 * \param offset optional offset
	 *
	 * Depending on level chosen this function returns to pixels array:
	 *	* (0) - slightly changed image data according to domain and session keys
	 *	* (1) - empty array
	 */
	function farblePixels(gl, x, y, width, height, format, type, outpixels, offset) {
		if (format === gl.ALPHA) {
			// We do not modify alpha
			origReadPixels.call(gl, x, y, width, height, gl.ALPHA, type, outpixels, offset);
			return;
		}
		else if (typeof outpixels === "number") {
			/// \bug We do not support calls without explicit buffers, NOOP
			return;
		}
		else if (format !== gl.RGBA || type !== gl.UNSIGNED_BYTE) {
			/*
			 * \bug https://www.khronos.org/registry/OpenGL/specs/es/2.0/es_full_spec_2.0.pdf, section
			 * 4.3.1: "Only two combinations of format and type are accepted. The first is format RGBA
			 * and type UNSIGNED_BYTE. The second is an implementation-chosen format from among those
			 * defined in table 3.4, excluding formats LUMINANCE and LUMINANCE_ALPHA." Brave (tested in
			 * Debian), Firefox (Debian, Windows), Edge (Windows) and Chromuim (Debian) return
			 * gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT).toString(16) == 0x1908 (RGBA) and
			 * gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE).toString(16) == 0x1401 (UNSIGNED_BYTE).
			 * Hence in other cases we raise the excpetion generated by the call.
			 */
			try {
				let pixels = new outpixels.__proto__.constructor(outpixels.length);
				origReadPixels.call(gl, x, y, width, height, format, type, pixels, offset);
			}
			finally {} // There needs to be a catch/finally block
			console.debug("JShelter has reached a block that should be ineccessible");
			// Note that we do not modify the given outpixels
			return;
		}
		if(args[0]===1) {
			return;
		}
		else if(args[0]===0) {
			// Read and modify pixels of the whole canvas to produce the same results no matter the view
			const GL_WIDTH = gl.drawingBufferWidth;
			const GL_HEIGHT = gl.drawingBufferHeight;
			const BYTES_PER_ROW = GL_WIDTH * 4;
			const BYTES_CANVAS = BYTES_PER_ROW * GL_HEIGHT;
			const DESIRED_WIDTH = width * 4;
			const BYTES_OUT = DESIRED_WIDTH * height;
			const pixels = new Uint8Array(BYTES_CANVAS);
			origReadPixels.call(gl, 0, 0, GL_WIDTH, GL_HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			if (wasm.ready && wasm.grow(BYTES_CANVAS + BYTES_OUT + DESIRED_WIDTH)) {
				try {
					farblePixelsWASM();
				} catch (e) {
					console.error("WebAssembly optimized farbling failed, falling back to JavaScript implementation", e);
					farblePixelsJS();
				}
			} else {
				farblePixelsJS();
			}

			function farblePixelsWASM() {
				// We need to flip the canvas
				for (let i = 0; i < BYTES_CANVAS; i += BYTES_PER_ROW) {
					wasm.set(pixels.subarray(i, i + BYTES_PER_ROW), BYTES_CANVAS - i - BYTES_PER_ROW);
				}
				const crc = wasm.crc16(BYTES_CANVAS);
				const mash = new Mash();
				mash.addData(' ');
				mash.addData(domainHash);
				mash.addData("CanvasFarbling");
				mash.addData(crc);
				wasm.farbleBytes(BYTES_CANVAS, mash.n | 0, true);
				// Modify data according to original selection and flip the canvas back
				wasm.adjustWebGL(x, y, width, height, GL_WIDTH, GL_HEIGHT);
				// Save farbled pixels, limit size by size of outpixels
				outpixels.set(wasm.get(Math.min(outpixels.length, BYTES_OUT), BYTES_CANVAS));
			}

			function farblePixelsJS() {
				farbleCanvasDataBrave(function* () {
					// We need to flip the canvas
					let offset = BYTES_CANVAS - BYTES_PER_ROW;
					while (offset >= 0) {
						yield pixels.subarray(offset, offset + BYTES_PER_ROW);
						offset -= BYTES_PER_ROW;
					}
				}, GL_WIDTH);
				// And modify data according to the original parameters
				const XXMAX = x + width;
				function insertEmpty(pos) {
					outpixels[pos  ] = 0;
					outpixels[pos+1] = 0;
					outpixels[pos+2] = 0;
					outpixels[pos+3] = 255;
				}
				for (let i = 0; i < height; i++) {
					// Go through the number of desired rows
					let xx = x;
					let yy = y + i;
					if (yy < 0 || yy >= GL_HEIGHT) {
						for (let j = 0; j < DESIRED_WIDTH; j += 4) {
							insertEmpty(i*DESIRED_WIDTH+j);
						}
					}
					else {
						let j = i*DESIRED_WIDTH;
						while (xx < 0 && xx < XXMAX) {
							insertEmpty(j);
							j += 4;
							xx++;
						}
						while (xx < XXMAX && xx < GL_WIDTH) {
							let offset_orig = (yy * GL_WIDTH + xx) * 4;
							outpixels[j  ] = pixels[offset_orig];
							outpixels[j+1] = pixels[offset_orig+1];
							outpixels[j+2] = pixels[offset_orig+2];
							outpixels[j+3] = pixels[offset_orig+3];
							j += 4;
							xx++;
						}
						while (xx < XXMAX) {
							insertEmpty(j);
							j += 4;
							xx++;
						}
					}
				}
			}
		}
	};
 	var wrappers = [
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getParameter",
					wrapped_name: "origGetParameter",
				}
			],
			helping_code: farbleGLint + randomString +
				farbleGetParameterString,
			original_function: "parent.WebGLRenderingContext.prototype.getParameter",
			wrapping_function_args: "constant",
			/** \fn fake WebGLRenderingContext.prototype.getParameter
			 * \brief Modifies return value for some specific parameters, original value for the rest
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - depending on type - either changed original number or random string
			 *	* (1) - bottom value depending on parameter [null, 0, empty string, random string]
			 */
			wrapping_function_body: `
				return farbleGetParameter(this,constant);
			`,
		},
		{
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getParameter",
					wrapped_name: "origGetParameter",
				}
			],
			helping_code: farbleGLint + randomString +
				farbleGetParameterString,
			original_function: "parent.WebGL2RenderingContext.prototype.getParameter",
			wrapping_function_args: "constant",
			/** \fn fake WebGL2RenderingContext.prototype.getParameter
			 * \brief Modifies return value for some specific parameters, original value for the rest
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - depending on type - either changed original number or random string
			 *	* (1) - bottom value depending on parameter [null, 0, empty string, random string]
			 */
			wrapping_function_body: `
				return farbleGetParameter(this, constant);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getSupportedExtensions",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getSupportedExtensions",
					wrapped_name: "origGetSupportedExtensions",
				}
			],
			helping_code: farbleNullArray,
			original_function: "parent.WebGLRenderingContext.prototype.getSupportedExtensions",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getSupportedExtensions
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - empty array
			 */
			wrapping_function_body: `
				return farbleNullArray(origGetSupportedExtensions, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getSupportedExtensions",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getSupportedExtensions",
					wrapped_name: "origGetSupportedExtensions",
				}
			],
			helping_code: farbleNullArray,
			original_function: "parent.WebGL2RenderingContext.prototype.getSupportedExtensions",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getSupportedExtensions
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - empty array
			 */
			wrapping_function_body: `
				return farbleNullArray(origGetSupportedExtensions, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getActiveAttrib",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getActiveAttrib",
					wrapped_name: "origGetActiveAttrib",
				}
			],
			helping_code: farbleGetActives,
			original_function: "parent.WebGLRenderingContext.prototype.getActiveAttrib",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getActiveAttrib
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGLActiveInfo object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetActives(origGetActiveAttrib, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getActiveAttrib",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getActiveAttrib",
					wrapped_name: "origGetActiveAttrib",
				}
			],
			helping_code: farbleGetActives,
			original_function: "parent.WebGL2RenderingContext.prototype.getActiveAttrib",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getActiveAttrib
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGLActiveInfo object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetActives(origGetActiveAttrib, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getExtension",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getExtension",
					wrapped_name: "origGetExtension",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGLRenderingContext.prototype.getExtension",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getExtension
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null
			 */
			wrapping_function_body: `
				return farbleNull(origGetExtension, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getExtension",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getExtension",
					wrapped_name: "origGetExtension",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGL2RenderingContext.prototype.getExtension",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getExtension
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null
			 */
			wrapping_function_body: `
				return farbleNull(origGetExtension, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getActiveUniform",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getActiveUniform",
					wrapped_name: "origGetActiveUniform",
				}
			],
			helping_code: farbleGetActives,
			original_function: "parent.WebGLRenderingContext.prototype.getActiveUniform",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getActiveUniform
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGLActiveInfo object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetActives(origGetActiveUniform, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getActiveUniform",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getActiveUniform",
					wrapped_name: "origGetActiveUniform",
				}
			],
			helping_code: farbleGetActives,
			original_function: "parent.WebGL2RenderingContext.prototype.getActiveUniform",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getActiveUniform
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGLActiveInfo object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetActives(origGetActiveUniform, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getUniformLocation",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getUniformLocation",
					wrapped_name: "oriGetUniformLocation",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGLRenderingContext.prototype.getUniformLocation",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getUniformLocation
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null
			 */
			wrapping_function_body: `
				return farbleNull(oriGetUniformLocation, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getUniformLocation",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getUniformLocation",
					wrapped_name: "oriGetUniformLocation",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGL2RenderingContext.prototype.getUniformLocation",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getUniformLocation
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null
			 */
			wrapping_function_body: `
				return farbleNull(oriGetUniformLocation, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getAttribLocation",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getAttribLocation",
					wrapped_name: "origGetAttribLocation",
				}
			],
			helping_code: farbleMinusOne,
			original_function: "parent.WebGLRenderingContext.prototype.getAttribLocation",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getAttribLocation
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - minus one
			 */
			wrapping_function_body: `
				return farbleMinusOne(origGetAttribLocation, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getAttribLocation",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getAttribLocation",
					wrapped_name: "origGetAttribLocation",
				}
			],
			helping_code: farbleMinusOne,
			original_function: "parent.WebGL2RenderingContext.prototype.getAttribLocation",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getAttribLocation
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - minus one
			 */
			wrapping_function_body: `
				return farbleMinusOne(origGetAttribLocation, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getVertexAttribOffset",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getVertexAttribOffset",
					wrapped_name: "origGetVertexAttribOffset",
				}
			],
			helping_code: farbleZero,
			original_function: "parent.WebGLRenderingContext.prototype.getVertexAttribOffset",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getVertexAttribOffset
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - zero
			 */
			wrapping_function_body: `
				return farbleZero("origGetVertexAttribOffset", this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getVertexAttribOffset",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getVertexAttribOffset",
					wrapped_name: "origGetVertexAttribOffset",
				}
			],
			helping_code: farbleZero,
			original_function: "parent.WebGL2RenderingContext.prototype.getVertexAttribOffset",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getVertexAttribOffset
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - zero
			 */
			wrapping_function_body: `
				return farbleZero("origGetVertexAttribOffset", this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "readPixels",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.readPixels",
					wrapped_name: "origReadPixels",
				}
			],
			helping_code: farbleCanvasDataBrave.toString() + farblePixels,
			original_function: "parent.WebGLRenderingContext.prototype.readPixels",
			wrapping_function_args: "x, y, width, height, format, type, pixels, offset",
			/** \fn fake WebGLRenderingContext.prototype.readPixels
			 * \brief Modifies array which contains result of readPixels
			 *
			 * Depending on level chosen modifies result array:
			 *	* (0) - change values according to domain and session hashes
			 *	* (1) - leave array empty
			 */
			wrapping_function_body: `
				farblePixels(this, x, y, width, height, format, type, pixels, offset);
			`,
		},
		{
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "readPixels",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.readPixels",
					wrapped_name: "origReadPixels",
				}
			],
			helping_code: farbleCanvasDataBrave.toString() + farblePixels,
			original_function: "parent.WebGL2RenderingContext.prototype.readPixels",
			wrapping_function_args: "x, y, width, height, format, type, pixels, offset",
			/** \fn fake WebGL2RenderingContext.prototype.readPixels
			 * \brief Modifies array which contains result of readPixels
			 *
			 * Depending on level chosen modifies result array:
			 *	* (0) - change values according to domain and session hashes
			 *	* (1) - leave array empty
			 */
			wrapping_function_body: `
				farblePixels(this, x, y, width, height, format, type, pixels, offset);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getFramebufferAttachmentParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getFramebufferAttachmentParameter",
					wrapped_name: "origGetFramebufferAttachmentParameter",
				}
			],
			helping_code: farbleGetFramebufferAttachmentParameter,
			original_function: "parent.WebGLRenderingContext.prototype.getFramebufferAttachmentParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getFramebufferAttachmentParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [34069, 9729, 5124, 0]
			 */
			wrapping_function_body: `
				return farbleGetFramebufferAttachmentParameter(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getFramebufferAttachmentParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getFramebufferAttachmentParameter",
					wrapped_name: "origGetFramebufferAttachmentParameter",
				}
			],
			helping_code: farbleGetFramebufferAttachmentParameter,
			original_function: "parent.WebGL2RenderingContext.prototype.getFramebufferAttachmentParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getFramebufferAttachmentParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [34069, 9729, 5124, 0]
			 */
			wrapping_function_body: `
				return farbleGetFramebufferAttachmentParameter(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getBufferParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getBufferParameter",
					wrapped_name: "origGetBufferParameter",
				}
			],
			helping_code: farbleGetBufferParameter,
			original_function: "parent.WebGLRenderingContext.prototype.getBufferParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getBufferParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [35044, 0]
			 */
			wrapping_function_body: `
				return farbleGetBufferParameter(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getBufferParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getBufferParameter",
					wrapped_name: "origGetBufferParameter",
				}
			],
			helping_code: farbleGetBufferParameter,
			original_function: "parent.WebGL2RenderingContext.prototype.getBufferParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getBufferParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [35044, 0]
			 */
			wrapping_function_body: `
				return farbleGetBufferParameter(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getProgramParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getProgramParameter",
					wrapped_name: "origGetProgramParameter",
				}
			],
			helping_code: farbleGetProgramParameter,
			original_function: "parent.WebGLRenderingContext.prototype.getProgramParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getProgramParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [false, 35981, 0]
			 */
			wrapping_function_body: `
				return farbleGetProgramParameter(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getProgramParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getProgramParameter",
					wrapped_name: "origGetProgramParameter",
				}
			],
			helping_code: farbleGetProgramParameter,
			original_function: "parent.WebGL2RenderingContext.prototype.getProgramParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getProgramParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [false, 35981, 0]
			 */
			wrapping_function_body: `
				return farbleGetProgramParameter(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getRenderbufferParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getRenderbufferParameter",
					wrapped_name: "origGetRenderbufferParameter",
				}
			],
			helping_code: farbleGetRenderbufferParameter,
			original_function: "parent.WebGLRenderingContext.prototype.getRenderbufferParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getRenderbufferParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [32854, 0]
			 */
			wrapping_function_body: `
				return farbleGetRenderbufferParameter(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getRenderbufferParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getRenderbufferParameter",
					wrapped_name: "origGetRenderbufferParameter",
				}
			],
			helping_code: farbleGetRenderbufferParameter,
			original_function: "parent.WebGL2RenderingContext.prototype.getRenderbufferParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getRenderbufferParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [32854, 0]
			 */
			wrapping_function_body: `
				return farbleGetRenderbufferParameter(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getShaderParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getShaderParameter",
					wrapped_name: "origGetShaderParameter",
				}
			],
			helping_code: farbleGetShaderParameter,
			original_function: "parent.WebGLRenderingContext.prototype.getShaderParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getShaderParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [35633, false]
			 */
			wrapping_function_body: `
				return farbleGetShaderParameter(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getShaderParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getShaderParameter",
					wrapped_name: "origGetShaderParameter",
				}
			],
			helping_code: farbleGetShaderParameter,
			original_function: "parent.WebGL2RenderingContext.prototype.getShaderParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getShaderParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [35633, false]
			 */
			wrapping_function_body: `
				return farbleGetShaderParameter(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getVertexAttrib",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getVertexAttrib",
					wrapped_name: "origGetVertexAttrib",
				}
			],
			helping_code: farbleGetVertexAttrib,
			original_function: "parent.WebGLRenderingContext.prototype.getVertexAttrib",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getVertexAttrib
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [null, 0, false, 5120, empty array]
			 */
			wrapping_function_body: `
				return farbleGetVertexAttrib(this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getVertexAttrib",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getVertexAttrib",
					wrapped_name: "origGetVertexAttrib",
				}
			],
			helping_code: farbleGetVertexAttrib,
			original_function: "parent.WebGL2RenderingContext.prototype.getVertexAttrib",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getVertexAttrib
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - bottom value depending on parameter [null, 0, false, 5120, empty array]
			 */
			wrapping_function_body: `
				return farbleGetVertexAttrib(this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getUniform",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getUniform",
					wrapped_name: "origGetUniform",
				}
			],
			helping_code: farbleZero,
			original_function: "parent.WebGLRenderingContext.prototype.getUniform",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getUniform
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - zero
			 */
			wrapping_function_body: `
				return farbleZero("origGetUniform", this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getUniform",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getUniform",
					wrapped_name: "origGetUniform",
				}
			],
			helping_code: farbleZero,
			original_function: "parent.WebGL2RenderingContext.prototype.getUniform",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getUniform
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - zero
			 */
			wrapping_function_body: `
				return farbleZero("origGetUniform", this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getTexParameter",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getTexParameter",
					wrapped_name: "origGetTexParameter",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGLRenderingContext.prototype.getTexParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getTexParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null - as if error has occured
			 */
			wrapping_function_body: `
				return farbleNull(origGetTexParameter, this, ...args);
			`,
		},
    {
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getTexParameter",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getTexParameter",
					wrapped_name: "origGetTexParameter",
				}
			],
			helping_code: farbleNull,
			original_function: "parent.WebGL2RenderingContext.prototype.getTexParameter",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getTexParameter
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - null - as if error has occured
			 */
			wrapping_function_body: `
				return farbleNull(origGetTexParameter, this, ...args);
			`,
		},
		{
			parent_object: "WebGLRenderingContext.prototype",
			parent_object_property: "getShaderPrecisionFormat",
			wrapped_objects: [
				{
					original_name: "WebGLRenderingContext.prototype.getShaderPrecisionFormat",
					wrapped_name: "origGetShaderPrecisionFormat",
				}
			],
			helping_code: farbleGetPrecisionFormat,
			original_function: "parent.WebGLRenderingContext.prototype.getShaderPrecisionFormat",
			wrapping_function_args: "...args",
			/** \fn fake WebGLRenderingContext.prototype.getShaderPrecisionFormat
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGLShaderPrecisionFormat object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetPrecisionFormat(this, ...args);
			`,
		},
		{
			parent_object: "WebGL2RenderingContext.prototype",
			parent_object_property: "getShaderPrecisionFormat",
			wrapped_objects: [
				{
					original_name: "WebGL2RenderingContext.prototype.getShaderPrecisionFormat",
					wrapped_name: "origGetShaderPrecisionFormat",
				}
			],
			helping_code: farbleGetPrecisionFormat,
			original_function: "parent.WebGL2RenderingContext.prototype.getShaderPrecisionFormat",
			wrapping_function_args: "...args",
			/** \fn fake WebGL2RenderingContext.prototype.getShaderPrecisionFormat
			 * \brief Modifies return value
			 *
			 * Depending on level chosen this function returns:
			 *	* (0) - original return value
			 *	* (1) - WebGL2ShaderPrecisionFormat object with empty attributes
			 */
			wrapping_function_body: `
				return farbleGetPrecisionFormat(this, ...args);
			`,
		}
	];
	add_wrappers(wrappers);
})();
