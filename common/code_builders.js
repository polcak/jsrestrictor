/** \file
 * \brief Functions that build code that modifies JS evironment provided to page scripts
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2021  Giorgio Maone
 *  \author Copyright (C) 2022  Marek Salon
 *  \author Copyright (C) 2023  Martin Zmitko
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

/**
 * Create IIFE to wrap the code in closure
 */
function enclose_wrapping(code, ...args) {
	return `try{(function(...args) {${code}})(${args});} catch (e) {console.error(e)}`;
}

/**
 * Create wrapping that might be IIFE or a function that is immediately called and also available
 * for future.
 */
function enclose_wrapping2(code, name, params, call_with_window) {
	if (name === undefined) {
		return enclose_wrapping(code);
	}
	return `function ${name}(${params}) {${code}}
		${name}(${call_with_window ? "window" : ""});`
}

/**
 * Create code containing call of API counting function.
 */
function create_counter_call(wrapper, type) {
	let {parent_object, parent_object_property} = wrapper;
	let resource = `${parent_object}.${parent_object_property}`;
	let args = wrapper.report_args ? "args.map(x => JSON.stringify(x))" : "[]"
	return `if (fp_enabled && fp_${type}_count < 1000) {
		var stack = undefined;
		if (fpdTrackCallers) {
			try {
				throw new Error("FPDCallerTracker");
			} catch (e) {
				stack = e.stack.toString();
			}
		}
		updateCount(${JSON.stringify(resource)}, "${type}", ${args}, stack);
		fp_${type}_count += 1;
	}`;
}

/**
 * This function create code (as string) that creates code that can be used to inject (or overwrite)
 * a function in the page context.
 */
function define_page_context_function(wrapper) {
	let {parent_object, parent_object_property, original_function, replace_original_function} = wrapper;
	if (replace_original_function) {
		let lastDot = original_function.lastIndexOf(".");
		parent_object = original_function.substring(0, lastDot);
		parent_object_property = original_function.substring(lastDot + 1);
	}
	let originalF = original_function || `${parent_object}.${parent_object_property}`;
	let code = `
	let originalF = ${originalF};
	var fp_call_count = 0;
	let replacementF = function(${wrapper.wrapping_function_args}) {
		try {
			${create_counter_call(wrapper, "call")}
		}
		catch (e) { /* No action: let the wrapper continue uninterupted. TODO: let the user decide? */ }`
	
	// if apply_if condition is present, we need to wrap for FPD anyhow
	if (wrapper.apply_if !== undefined) {
		code += `
		if (${wrapper.apply_if}) {
			${wrapper.wrapping_function_body}
		}
		else {
			return originalF.call(this, ${wrapper.wrapping_function_args});
		}`
	}
	else {
		code += `${wrapper.wrapping_function_body}`
	}
	code += `
	};
	`;

	if (typeof browser_polyfill_used === "undefined") {
		code += `
			let innerF = replacementF;
			replacementF = function(...args) {
				let jshelter_debug_timestamp = xrayWindow.performance.now(); console.debug('JShelter performance ${originalF} start:', jshelter_debug_timestamp); // Intentionally one line

				// prepare callbacks
				args = args.map(a => typeof a === "function" ? WrapHelper.pageAPI(a) : a);

				let ret = WrapHelper.forPage(innerF.call(this, ...args));
				if (ret) {
					if (ret instanceof xrayWindow.Promise || ret instanceof WrapHelper.unX(xrayWindow).Promise) {
						ret = Promise.resolve(ret);
					}
					try {
						ret = WrapHelper.unX(ret);
					} catch (e) {}
				}
				console.debug('JShelter performance ${originalF} duration:', xrayWindow.performance.now() - jshelter_debug_timestamp);
				return ret;
			};
		`;
	}
	code += `
		exportFunction(replacementF, ${parent_object}, {defineAs: '${parent_object_property}'});
		${wrapper.post_replacement_code || ''}
	`;
	
	return enclose_wrapping2(code, wrapper.wrapping_code_function_name, wrapper.wrapping_code_function_params, wrapper.wrapping_code_function_call_window);
}

/**
 * This function creates code that assigns an already defined function to given property.
 */
function generate_assign_function_code(code_spec_obj) {
	return `exportFunction(${code_spec_obj.export_function_name},
		${code_spec_obj.parent_object},
		{defineAs: '${code_spec_obj.parent_object_property}'});
	`;
}

/**
 * This function wraps object properties using WrapHelper.defineProperties().
 */
function generate_object_properties(code_spec_obj, fpd_only) {
	var code = `
		if (!("${code_spec_obj.parent_object_property}" in ${code_spec_obj.parent_object})) {
			// Do not wrap an object that is not defined, e.g. because it is experimental feature.
			// This should reduce fingerprintability.
			return;
		}
	`;
	for (let assign of code_spec_obj.wrapped_objects || []) {
		code += `var ${assign.wrapped_name} = window.${assign.original_name};`;
	}
	code += `
	{
		let descriptor = WrapHelper.getDescriptor(${code_spec_obj.parent_object}, "${code_spec_obj.parent_object_property}");
	`
	for (let wrap_spec of code_spec_obj.wrapped_properties) {
		// variable name used for distinguishing between different original properties of the same wrapper
		var original_property = `originalP_${wrap_spec.property_name}`;

		var counting_wrapper = `
			function(...args) {
				${create_counter_call(code_spec_obj, wrap_spec.property_name)}

				// checks type of underlying wrapper/definition and returns it (no changes to semantics)
				if (typeof (${fpd_only ? original_property : wrap_spec.property_value}) === 'function') {
				 	return (${fpd_only ? original_property : wrap_spec.property_value}).bind(this)(...args);
				}
				else {
					return (${fpd_only ? original_property : wrap_spec.property_value});
				}
			}
		`;

		if (fpd_only) {
			code += `var ${original_property} = descriptor["${wrap_spec.property_name}"];`;
		}

		code += `
			originalPDF = descriptor["${wrap_spec.property_name}"];
			var fp_${wrap_spec.property_name}_count = 0;
			replacementPD = ${counting_wrapper};
			descriptor["${wrap_spec.property_name}"] = replacementPD;
		`;
	}
	code += `WrapHelper.defineProperty(${code_spec_obj.parent_object},
		"${code_spec_obj.parent_object_property}", descriptor);
	}`;
	return code;
}

/**
 * This function removes a property.
 */
function generate_delete_properties(code_spec_obj) {
	var code = `
	`;
	for (prop of code_spec_obj.delete_properties) {
		code += `
			if ("${prop}" in ${code_spec_obj.parent_object}) {
				// Delete only properties that are available.
				// The if should be safe to be deleted but it can possibly reduce fingerprintability
				WrapHelper.defineProperty(
					${code_spec_obj.parent_object},
					"${prop}", {get: undefined, set: undefined, configurable: false, enumerable: false}
				);
			}
		`
	}
	return code;
}

/**
 * This function generates code that makes an assignment.
 */
function generate_assignement(code_spec_obj) {
	return `${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property} = ${code_spec_obj.value};`
}

/**
 * This function builds the wrapping code.
 */
var build_code = function(wrapper, ...args) {
	let post_wrapping_functions = {
		function_define: define_page_context_function,
		function_export: generate_assign_function_code,
		object_properties: generate_object_properties,
		delete_properties: generate_delete_properties,
		assign: generate_assignement,
	};

	let target = `${wrapper.parent_object}.${wrapper.parent_object_property}`;
	let code = "";

	{
		// Do not wrap an object that is not defined, e.g. because it is experimental feature.
		// This should reduce fingerprintability.
		let objPath = [], undefChecks = [];
		for (leaf of target.split('.')) {
			undefChecks.push(
				objPath.length ? `!("${leaf}" in ${objPath.join('.')})` // avoids e.g. Event.prototype.timeStamp from throwing "Illegal invocation"
											 : `typeof ${leaf} === "undefined"`
			);
			objPath.push(leaf);
		}

    code += `
		try {
			if (${undefChecks.join(" || ")}) return;
		} catch (e) {
			return;
		}`;
	}

	for (let {original_name = target, wrapped_name, callable_name} of wrapper.wrapped_objects || []) {
		if (original_name !== target) {
			code += `
				if (typeof ${original_name} === undefined) return;
				`;
		}
		if (wrapped_name) {
			code += `var ${wrapped_name} = window.${original_name};`;
		}
		if (callable_name) {
			code += `var ${callable_name} = WrapHelper.pageAPI(window.${original_name});`;
		}
	}
	code += `
		${wrapper.helping_code || ''}`;

	if (wrapper.wrapping_function_body){
		code += `${define_page_context_function(wrapper)}`;
	}

	let build_post_normal = () => {
		if (wrapper["post_wrapping_code"] !== undefined) {
			for (code_spec of wrapper["post_wrapping_code"]) {
				if (code_spec.apply_if !== undefined) {
					code += `if (${code_spec.apply_if}) {`
				}
				code += post_wrapping_functions[code_spec.code_type](code_spec);
				if (code_spec.apply_if !== undefined) {
					code += "}";
				}
				// if not wrapped because of apply_if condition in post wrapping object, still needs to be wrapped for FPD
				if (code_spec.apply_if !== undefined && code_spec.code_type == "object_properties") {
					code += "else {" + generate_object_properties(code_spec, true) + "}";
				}
			}
		}
	}

	let build_post_fpd = () => {
		if (wrapper["post_wrapping_code"] !== undefined) {
			for (code_spec of wrapper["post_wrapping_code"]) {
				// if not wrapped because of apply_if condition in post wrapping object, still needs to be wrapped for FPD
				if (code_spec.apply_if !== undefined && code_spec.code_type == "object_properties") {
					code += generate_object_properties(code_spec, true);
				}
			}
		}
	}

	// if apply_if is present in main wrapper object and contains post wrapping code -> wrap for FPD only if condition is FALSE
	if (wrapper.apply_if !== undefined) {
		code += `if (${wrapper.apply_if}) {`
		build_post_normal();
		code += `} else {`
		build_post_fpd();
		code += `}`
	}
	else {
		build_post_normal();
	}

	if (wrapper["wrapper_prototype"] !== undefined) {
		let source = wrapper.wrapper_prototype;
		code += `if (${target.prototype} !== ${source.prototype}) { // prevent cyclic __proto__ errors on Proxy
			Object.setPrototypeOf(${target}, ${source});
		}`;
	}
	if (wrapper.freeze !== undefined) {
		code += `
			if (${wrapper.freeze}) {
				Object.freeze(${wrapper.parent_object}.${wrapper.parent_object_property});
			}
		`;
	}

	return enclose_wrapping(code, ...args);
};

/**
 * Transform wrapping arrays into injectable code.
 */
function wrap_code(wrappers) {
	if (wrappers.length === 0) {
		return; // Nothing to wrap
	}

	let build = (wrapper) => {
		try {
			return build_code(build_wrapping_code[wrapper[0]], wrapper.slice(1));
		} catch (e) {
			console.error(e);
			return "";
		}
	};

	let fpd_placeholder = "\n\n// FPD_S\n\n// FPD_E"
	return generate_code(joinWrappingCode(wrappers.map(x => build(x))) + fpd_placeholder);
}

/**
 * Join array of wrapping codes into single string.
 */
let joinWrappingCode = code => {
	return code.join("\n").replace(/\bObject\.(create|definePropert)/g, "WrapHelper.$1");
}

/**
 * Insert WebAssembly initialization code into wrapped injection code.
 */
function insert_wasm_code(code) {
	let wasm_code = (() => {
		const wasm_memory = new WebAssembly.Memory({initial: 1});
		// Memory layout:
		// +-----------------+--------------+----------+---------------------------------------- - -
		// | CRC table       | Xoring table | Reserved | Data
		// | 256 * u16       | 8 * u32      |          | 
		// +-----------------+--------------+----------+---------------------------------------- - -
		// 0                 512            544        1024
		const crc_offset = 0;
		const xoring_offset = 512;
		const reserved_offset = 544;
		const data_offset = 1024;

		WebAssembly.instantiateStreaming(fetch("/* WASM_URL */"), {env: {memory: wasm_memory}}).then(result => {
			new Uint16Array(wasm_memory.buffer, crc_offset, crc16_table.length).set(crc16_table);
			const xoring = new Uint32Array(wasm_memory.buffer, xoring_offset, 8);
			for (let i = 0; i < 64; i += 8) {
				xoring[i / 8] = parseInt(domainHash.slice(i, i + 8), 16) >>> 0;
			}

			wasm = {
				// Getter and setter for data in WASM memory. Because we need access from page context,
				// we can't just get a memory view and use it directly. The view needs to be exported to be
				// usable in the page context on Firefox.
				// This means that views returned by wasm.get() aren't actually views of the WASM memory,
				// but rather copies of the data and modifying them won't affect the underlying memory.
				// We can't export the wasm memory directly either, it is bound to the WASM instance and
				// it's not possible to export the instance as well.
				// For constructing views of the correct type, we can't use constructors passed from page context,
				// a content script constructor must be used. For now, we use just 2 types, so passing a bool 
				// to differentiate is enough.
				get(length, offset = 0, float = false) {
					if (float) {
						return WrapHelper.forPage(new Float32Array(wasm_memory.buffer, data_offset + offset, length));
					} else {
						return WrapHelper.forPage(new Uint8Array(wasm_memory.buffer, data_offset + offset, length));
					}
				},
				set(data, offset = 0, float = false) {
					if (float) {
						new Float32Array(wasm_memory.buffer, data_offset + offset, data.length).set(data);
					} else {
						new Uint8Array(wasm_memory.buffer, data_offset + offset, data.length).set(data);
					}
				},
				// Grow the WASM memory if needed.
				grow(needed_bytes) {
					const memory_size = wasm_memory.buffer.byteLength;
					needed_bytes += data_offset;
					if (memory_size < needed_bytes) {
						try {
							wasm_memory.grow(Math.ceil((needed_bytes - memory_size) / 65536));
						} catch (e) {
							console.warn("Failed to grow WASM memory, falling back to JS implementation", e);
							return false;
						}
					}
					return true;
				},
				// Make WASM exported functions available to wrappers.
				...result.instance.exports,
				ready: true
			}
			Object.freeze(wasm);
			console.debug("WASM farbling module initialized");
		}).catch(e => {
			console.warn("Failed to instantiate WASM farbling module, falling back to JS implementation", e);
		});
	}).toString().replace("/* WASM_URL */", browser.runtime.getURL("farble.wasm"));

	return code.replace("// WASM_CODE //", `(${wasm_code})()`);
}

/**
 * Append wrapped codes to NSCL helpers and create injectable code.
 */
function generate_code(wrapped_code) {
	let code = (w => {

		// cross-wrapper globals
		let xrayWindow = window; // the "privileged" xray window wrapper in Firefox
		let WrapHelper; // xray boundary helper
		{
			const XRAY = (xrayWindow.top !== unwrappedWindow.top && typeof XPCNativeWrapper !== "undefined");
			let privilegedToPage = new WeakMap();
			let pageReady = new WeakSet();

			let promise =  obj =>	obj.then(r => forPage(r));

			forPage = obj => {
				if (typeof obj !== "object" && typeof obj !== "function" || obj === null
					|| pageReady.has(obj)) return obj;
				if (privilegedToPage.has(obj)) return privilegedToPage.get(obj); // keep clone identity
				let ret = obj; // fallback
				if (XRAY) {
					if (obj instanceof xrayWindow.Promise) {
						return promise(obj);
					}
					if (obj instanceof unX(xrayWindow).Promise) {
						return new xrayWindow.Promise((resolve, reject) => {
								unX(xrayWindow).Promise.prototype.then.call(obj,
									forPage(r => {
										if (r.wrappedJSObject && r.wrappedJSObject === unX(r)) {
											r = unX(r)
										} else r = forPage(r);
										resolve(r);
									}
									), forPage(e => reject(e)))
								});
					}
					try {
						if (obj.wrappedJSObject && obj.wrappedJSObject === unX(obj)) {
							return obj;
						}
					} catch (e) {}
					try {
						ret = cloneInto(obj, unX(xrayWindow), {cloneFunctions: true, wrapReflectors: true});
					} catch (e) {
						// can't be cloned: must be a Proxy
					}
				} else {
					// Chromium: just use patchWindow's exportFunction() to make our wrappers look like native functions
					if (typeof obj === "function") {
						ret = exportFunction(obj, unX(xrayWindow));
					}
				}
				pageReady.add(ret);
				privilegedToPage.set(obj, ret);
				return ret;
			}

			let fixProp = (d, prop, obj) => {
				for (let accessor of ["set", "get"]) {
					if (typeof d[accessor] === "function") {
						let f = d[accessor];
						d[accessor] = exportFunction(d[accessor], obj, {defineAs: `${accessor} ${prop}`});
					}
				}
				if (typeof d.value === "object") d.value = forPage(d.value);
				return d;
			};
			let OriginalProxy = unwrappedWindow.Proxy;
			let Proxy = OriginalProxy;
			let pageAPI, unX;
			if (XRAY) {

				unX = o => XPCNativeWrapper.unwrap(o);

				// automatically export Proxy constructor parameters
				let proxyConstructorHandler =  forPage({
					construct(targetConstructor, args) {
						let [target, handler] = unX(args);
						let selfProxy = !!(target === WrapHelper.Proxy && handler.construct);
						if (selfProxy) {
							let {construct} = handler;
							handler.construct = (target, args) => {
								let proxy = construct(target, unX(args));
								pageReady.add(proxy);
								return proxy;
							}
						}

						target = forPage(target);
						handler = forPage(handler);
						let proxy = new targetConstructor(target, handler);
						pageReady.add(proxy);
						return proxy;
					},
				});
				Proxy = new OriginalProxy(OriginalProxy, proxyConstructorHandler);
				let then;
				let apiHandler = {
					apply(target, thisArg, args) {
						let pa = unX(args);
						for (let j = pa.length; j-- > 0;) {
							let a = pa[j];
							if (a && unX(a) === a) {
								pa[j] = forPage(a);
							} else if (typeof a === "function") {
								pa[j] = new Proxy(a, apiHandler);
							}
						}
						console.debug("apiHandler call", target, thisArg, pa);
						let ret = target.apply(thisArg, pa);
						if (ret) {
							console.debug("apiHandler ret", ret, ret instanceof Promise, ret instanceof unX(xrayWindow).Promise, ret instanceof xrayWindow.Promise, ret.then);
							if (ret instanceof xrayWindow.Promise) {
							  then = then || (then = new Proxy(xrayWindow.Promise.prototype.then, apiHandler));
								if (ret.wrappedJSObject) {
									let p = unX(ret);
									if (p === ret.wrappedJSObject) {
										p.then = then
										ret = p;
									}
								}
							} else {
								ret = forPage(ret);
							}
						}
						return ret;
					}
				};



				pageAPI = f => {
					if (typeof f !== "function") return f;
					return new Proxy(f, apiHandler);
				}
			} else {
				pageAPI = unX = f => f;
			}

			let overlay;
			{
				let overlayProtos = new WeakMap();
				let overlayObjects = new WeakMap();
				overlay = (obj, data) => {
					obj = unX(obj);
					let proto = obj.__proto__;
					let proxiedProps = overlayProtos.get(proto);
					if (!proxiedProps) overlayProtos.set(proto, proxiedProps = {});
					let props = Object.getOwnPropertyDescriptors(data);
					for (let p in props) {
						if (p in proxiedProps) continue;
						for (let rootProto = proto; ;) {
							let protoProps = Object.getOwnPropertyDescriptors(rootProto);
							let protoProp = protoProps[p];
							if (!protoProp) {
								rootProto = rootProto.__proto__;
								if (rootProto) continue;
							}
							if (protoProp) {
								let original;
								if (protoProp.get) {
									let getterHandler =  forPage({
										apply(target, thisArg, args) {
											let obj = unX(thisArg);
											if (overlayObjects.has(obj)) {
												let data = overlayObjects.get(obj);
												return forPage(data[p]);
											}
											return target.apply(thisArg, args);
										}
									});
									let original = protoProp.get;
									protoProp.get = new Proxy(protoProp.get, getterHandler);
								} else if (typeof protoProp.value === "function") {
									original = protoProp.value;
									let methodHandler = forPage({
										apply(target, thisArg, args) {
											let obj = unX(thisArg);
											if (overlayObjects.has(obj)) {
												let data = overlayObjects.get(obj);
												return forPage(data[p].apply(thisArg, args));
											}
											return target.apply(thisArg, args);
										}
									});
									protoProp.value = new Proxy(protoProp.value, methodHandler);
								} else {
									protoProp = null;
								}
								if (protoProp) {
									Reflect.defineProperty(rootProto, p, protoProp);
									proxiedProps[p] = {rootProto, original, protoProp};
									break;
								}
							}
							Reflect.defineProperty(obj, p, forPage(props[p]));
							break;
						}
					}
					overlayObjects.set(obj, data);
					return obj;
				}
			}
			let createObj = unX(xrayWindow).Object.create;
			WrapHelper = {
				XRAY, // boolean, are we in a xray environment (i.e. on Firefox)?
				shared: {}, // shared storage object for in inter-wrapper coordination

				// WrapHelper.forPage() can be used by "complex" proxies to explicitly
				// prepare an object/function created in Firefox's sandboxed content script environment
				// to be consumed/called from the page context, and to make replacements for native
				// objects and functions provided by the wrappers look as much native as possible.
				// in most cases, however, this gets automated by the code builders replacing
				// Object methods found in the wrapper sources with their WrapHelper counterparts
				// and by proxying "callable_name" functions through WrapHelper.pageAPI().
				forPage,
				_forPage: x => x, // dummy for easily testing out the preparation
				isForPage: obj => pageReady.has(obj),
				unX, // safely waives xray wrappers
				// xray-aware Object creation helpers, mostly used transparently by the code builders
				defineProperty(obj, prop, descriptor, ...args) {
					obj = unX(obj);
					return Object.defineProperty(obj, prop, fixProp(descriptor, prop, obj), ...args);
				},
				defineProperties(obj, descriptors, ...args) {
					obj = unX(obj);
					for (let [prop, d] of Object.entries(descriptors)) {
						descriptors[prop] = fixProp(d, prop, obj);
					}
					return Object.defineProperties(obj, descriptors, ...args);
				},
				create(proto, descriptors) {
					let unwrappedProto = unX(proto);
					let obj = unX(createObj(unwrappedProto));
					try {
						if (proto && !obj.__proto__) {
							obj = Object.create(XPCNativeWrapper(proto));
						}
					} catch (e) {
						// access denied to obj.__proto__, wrappers mismatch
						obj = forPage(Object.create(proto));
					}
					return descriptors ? this.defineProperties(obj, descriptors) && obj : obj;
				},
				getDescriptor(obj, prop) {
					let descriptor = Object.getOwnPropertyDescriptor(obj, prop);
					if (!descriptor) {
						// let's traverse the prototype chain in search of this property
						for (let proto = Object.getPrototypeOf(obj); proto; proto = Object.getPrototypeOf(obj)) {
							if (descriptor = Object.getOwnPropertyDescriptor(proto, prop)) {
								obj = unX(obj);
								break;
							}
						}
						if (!descriptor) descriptor = {
							// Originally not a descriptor, fallback
							enumerable: true,
							configurable: true,
						};
					}
					return descriptor;
				},

				// WrapHelper.overlay(obj, data)
				// Proxies the prototype of the obj object in order to return the properties of the data object
				// as if they were native properties (e.g. as if they were returned by getters on the prototype chain,
				// rather than defined on the instance).
				// This allows spoofing some native objects data in a less detectable / fingerprintable way than using
				// Object.defineProperty(). See wrappingS-MCS.js for an example.
				overlay,
				// WrapHelper.pageAPI(f)
				// Proxies the function/method f so that arguments and return values, and especially callbacks and
				// Promise objects, are recursively managed in order to transparently marshal objects back
				// and forth Firefox's sandbox for extensions and the page scripts.
				pageAPI,
				// the original Proxy constructor
				OriginalProxy,
				// our xray-aware proxied Proxy constructor
				Proxy,
			};
			Object.freeze(WrapHelper);
		}

		// The object available to wrappers later containing farbling WASM optmitimized functions if enabled
		let wasm = Object.freeze({ready: false});

		// Farbling WebAssembly module initialization placeholder
		// WASM_CODE //

		with(unwrappedWindow) {
			let window = unwrappedWindow;
			let {Proxy} = WrapHelper;
			let {Promise, Object, Array, JSON} = xrayWindow;
			
			// add flag variable that determines whether messages should be sent
			let fp_enabled = false;

			(function () {
				let {port} = env;
				function updateCount(wrapperName, wrapperType, wrapperArgs, stack) {
					port.postMessage({
						wrapperName,
						wrapperType,
						wrapperArgs,
						stack
					});
				}
				try {
					// WRAPPERS //
				} finally {
					// cleanup environment if necessary
				}
			})();

			// after injection code completed, allow messages (calls from wrappers won't be counted)
			fp_enabled = true;
		}
	}).toString().replace('// WRAPPERS //', wrapped_code)

	return `(${code})();`;
}
