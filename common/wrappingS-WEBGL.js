//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
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

/**
*
* This algorithm is a modified version of the similar algorithm from
* Brave Software <https://brave.com>
* available at <https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/webgl/webgl2_rendering_context_base.cc>
* Copyright (c) 2020 The Brave Authors.
*/
/*
 * Create private namespace
 */
(function() {

	var webglParamFarble = `
	function farbleGLint(param){
		var ret = 0;
		if(param > 0){
			ret = param - (Number(prng().toString().slice(2,10)) % 2);
		}
		return ret;
	}
	function randomString(length) {
		var ret = "";
		var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for ( var i = 0; i < length; i++ ) {
				ret += charSet.charAt(Math.floor(prng() * charSet.length));
		}
		return ret;
	}

	if(args[0]===1){
		function farbleWebGLparam(ctx,param){
			var ret;
			switch (param) {
				case 0x1F02:
				case 0x1F01:
				case 0x8B8C:
				case 0x8F36:
				case 0x8F37:
				case 0x8CA6:
				case 0x8A2B:
				case 0x8B4A:
				case 0x9122:
				case 0x8B4B:
				case 0x8C8A:
				case 0x8B49:
				case 0x8A2D:
				case 0x9125:
				case 0x8A2F:
				case 0x8A2E:
				case 0x8A31:
				case 0x8A33:
					ret = null;
					break;
				case 0x9245:
				case 0x9246:
					ret = randomString(8);
					break;
				default:
					ret = origGetParameter.call(ctx, param);
			}
			return ret;
		}
	}
	else if(args[0]===0){
		function farbleWebGLparam(ctx,param){
			var ret;
			switch (param) {
				case 0x8B4A:
				case 0x8A2B:
				case 0x9122:
				case 0x8B4B:
				case 0x8C8A:
				case 0x8B49:
				case 0x8A2D:
				case 0x9125:
				case 0x8A2F:
				case 0x8A2E:

				case 0x8A31:
				case 0x8A33:
					var result = origGetParameter.call(ctx, param);
					ret = farbleGLint(result);
					break;
				case 0x9245:
				case 0x9246:
					ret = randomString(8);
					break;
				default:
					ret = origGetParameter.call(ctx, param);
			}
			return ret;
		}
	}`;

	var farbleNull = `
		function farbleNull(name, ctx, ...fcarg){
			if(args[0]===1){
				return null;
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;

	var farbleZero = `
		function farbleZero(name, ctx, ...fcarg){
			if(args[0]===1){
				return 0;
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;

	var farbleMinusOne = `
		function farbleMinusOne(name, ctx, ...fcarg){
			if(args[0]===1){
				return -1;
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;

	var farbleString = `
		function farbleString(name, ctx, ...fcarg){
			if(args[0]===1){
				return "";
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;
	var farbleReturn = `
		function farbleReturn(name, ctx, ...fcarg){
			if(args[0]===1){
				return;
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;
	var farbleState = `
		function farbleState(name, ctx, ...fcarg){
			if(args[0]===1){
				return null;
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;
	var farbleNullArray = `
		function farbleNullArray(name, ctx, ...fcarg){
			if(args[0]===1){
				return [];
			}
			else if(args[0]===0){
				return eval(name+".call(ctx, ...fcarg);");
			}
		}`;
	var farblePrecisionFormat = `
		function farblePrecisionFormat(ctx, ...fcarg){
			if(args[0]===1){
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
			else if(args[0]===0){
				return origGetShaderPrecisionFormat.call(ctx, ...fcarg);
			}
		}`;
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
			helping_code: webglParamFarble,
			original_function: "parent.WebGLRenderingContext.prototype.getParameter",
			wrapping_function_args: "constant",
			wrapping_function_body: `
				return farbleWebGLparam(this,constant);
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
			helping_code: webglParamFarble,
			original_function: "parent.WebGL2RenderingContext.prototype.getParameter",
			wrapping_function_args: "constant",
			wrapping_function_body: `
				return farbleWebGLparam(this,constant);
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
			wrapping_function_body: `
				return farbleNullArray("origGetSupportedExtensions", this, ...args);
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
			helping_code: farbleNull,
			original_function: "parent.WebGLRenderingContext.prototype.getActiveAttrib",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleNull("origGetActiveAttrib", this, ...args);
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
			wrapping_function_body: `
				return farbleNull("origGetExtension", this, ...args);
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
			helping_code: farbleNull,
			original_function: "parent.WebGLRenderingContext.prototype.getActiveUniform",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleNull("origGetActiveUniform", this, ...args);
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
			wrapping_function_body: `
				return farbleNull("oriGetUniformLocation", this, ...args);
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
			wrapping_function_body: `
				return farbleMinusOne("origGetAttribLocation", this, ...args);
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
			helping_code: farbleReturn,
			original_function: "parent.WebGLRenderingContext.prototype.readPixels",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleReturn("origReadPixels", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getFramebufferAttachmentParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetFramebufferAttachmentParameter", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getBufferParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetBufferParameter", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getProgramParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetProgramParameter", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getRenderbufferParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetRenderbufferParameter", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getShaderParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetShaderParameter", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getVertexAttrib",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetVertexAttrib", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getUniform",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetUniform", this, ...args);
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
			helping_code: farbleState,
			original_function: "parent.WebGLRenderingContext.prototype.getTexParameter",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farbleState("origGetTexParameter", this, ...args);
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
			helping_code: farblePrecisionFormat,
			original_function: "parent.WebGLRenderingContext.prototype.getShaderPrecisionFormat",
			wrapping_function_args: "...args",
			wrapping_function_body: `
				return farblePrecisionFormat(this, ...args);
			`,
		}
	];
	add_wrappers(wrappers);
})();
