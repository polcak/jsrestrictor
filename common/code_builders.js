/** \file
 * \brief Functions that build code that modifies JS evironment provided to page scripts
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2021  Giorgio Maone
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
	return enclose_wrapping2(`let originalF = ${originalF};
			let replacementF = function(${wrapper.wrapping_function_args}) {
				${wrapper.wrapping_function_body}
			};
			if (WrapHelper.XRAY) {
				let innerF = replacementF;
				replacementF = function(...args) {
					let ret = WrapHelper.forPage(innerF.call(this, ...args));
					if (ret) {
						try {
							ret = ret.wrappedJSObject || ret;
						} catch (e) {}
					}
					return ret;
				}
			}
			exportFunction(replacementF, ${parent_object}, {defineAs: '${parent_object_property}'});
			${wrapper.post_replacement_code || ''}
	`, wrapper.wrapping_code_function_name, wrapper.wrapping_code_function_params, wrapper.wrapping_code_function_call_window);
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
function generate_object_properties(code_spec_obj) {
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
		let obj = ${code_spec_obj.parent_object};
		let prop = "${code_spec_obj.parent_object_property}";
		let descriptor = Object.getOwnPropertyDescriptor(obj, prop);
		if (!descriptor) {
			// let's traverse the prototype chain in search of this property
			for (let proto = Object.getPrototypeOf(obj); proto; proto = Object.getPrototypeOf(obj)) {
				if (descriptor = Object.getOwnPropertyDescriptor(proto, prop)) {
					obj = proto.wrappedJSObject || proto;
					break;
				}
			}
			if (!descriptor) descriptor = {
				// Originally not a descriptor, fallback
				enumerable: true,
				configurable: true,
			};
		}
	`
	for (let wrap_spec of code_spec_obj.wrapped_properties) {
		code += `
			originalPDF = descriptor["${wrap_spec.property_name}"];
			replacementPD = ${wrap_spec.property_value};
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
	var post_wrapping_functions = {
		function_define: define_page_context_function,
		function_export: generate_assign_function_code,
		object_properties: generate_object_properties,
		delete_properties: generate_delete_properties,
		assign: generate_assignement,
	};

	var code = `try {if (${wrapper.parent_object} === undefined) {return;}} catch (e) {return; /* It seems that the parent object does not exist */ }`;
	for (let wrapped of wrapper.wrapped_objects || []) {
		code += `
			var ${wrapped.wrapped_name} = window.${wrapped.original_name};
			if (${wrapped.wrapped_name} === undefined) {
				// Do not wrap an object that is not defined, e.g. because it is experimental feature.
				// This should reduce fingerprintability.
				return;
			}
		`;
	}
	code += `${wrapper.helping_code || ''}`;
	if (wrapper.wrapping_function_body){
		code += `${define_page_context_function(wrapper)}`;
	}
	if (wrapper["post_wrapping_code"] !== undefined) {
		for (code_spec of wrapper["post_wrapping_code"]) {
			if (code_spec.apply_if !== undefined) {
				code += `if (${code_spec.apply_if}) {`
			}
			code += post_wrapping_functions[code_spec.code_type](code_spec);
			if (code_spec.apply_if !== undefined) {
				code += "}";
			}
		}
	}
	if (wrapper["wrapper_prototype"] !== undefined) {
		let target = `${wrapper.parent_object}.${wrapper.parent_object_property}`;
		let source = wrapper.wrapper_prototype;
		code += `if (${target.prototype} !== ${source.prototype}) { // prevent cyclic __proto__ errors on Proxy
			Object.setPrototypeOf(${target}, ${source});
		}`;
	}
	code += `
		if (${wrapper.freeze}) {
			Object.freeze(${wrapper.parent_object}.${wrapper.parent_object_property});
		}
	`;
	return enclose_wrapping(code, ...args);
};

/**
 * Transform wrapping arrays into code.
 *
 * @param Array of wrapping arrays.
 */
function wrap_code(wrappers) {
	if (wrappers.length === 0) {
		return; // Nothing to wrap
	}

	let build = wrapper => {
		try {
			return build_code(build_wrapping_code[wrapper[0]], wrapper.slice(1));
		} catch (e) {
			console.log(e);
			return "";
		}
	};

	let code = (w => {

		// cross-wrapper globals
		let xrayWindow = window; // the "privileged" xray window wrapper in Firefox
		let WrapHelper; // xray boundary helper
		{
			const XRAY = xrayWindow !== unwrappedWindow;
			let privilegedToPage = new WeakMap();
			let pageReady = new WeakSet();

			let promise =  obj =>	xrayWindow.Promise.resolve(obj).then(r => forPage(r));

			forPage = obj => {
				if (typeof obj !== "object" && typeof obj !== "function" || obj === null
					|| pageReady.has(obj)) return obj;
				if (privilegedToPage.has(obj)) return privilegedToPage.get(obj); // keep clone identity
				let ret = obj; // fallback
				if (XRAY) {
					try {
						ret = typeof obj.then === "function" ? promise(obj) : cloneInto(obj, unwrappedWindow, {cloneFunctions: true, wrapReflectors: true});
					} catch (e) {
						// can't be cloned: must be a Proxy
					}
				} else {
					// Chromium: just use patchWindow's exportFunction() to make our wrappers look like native functions
					if (typeof obj === "function") {
						ret = exportFunction(obj, unwrappedWindow);
					}
				}
				pageReady.add(ret);
				privilegedToPage.set(obj, ret);
				return ret;
			}

			let fixProp = (d, prop, obj) => {
				for (let accessor of ["set", "get"]) {
					if (typeof d[accessor] === "function") {
						d[accessor] = exportFunction(d[accessor], obj, {defineAs: `${accessor} ${prop}`});
					}
				}
				if (typeof d.value === "object") d.value = forPage(d.value);
				return d;
			};
			let OriginalProxy = unwrappedWindow.Proxy;
			let Proxy = OriginalProxy;
			if (XRAY) {
				// automatically export Proxy construcor parameters
				let proxyConstructorHandler =  forPage({
					construct(targetConstructor, args) {
						let [target, handler] = args.wrappedJSObject || args;
						let selfProxy = !!(target === WrapHelper.Proxy && handler.construct);
						if (selfProxy) {
							let {construct} = handler;
							handler.construct = (target, args) => {
								let proxy = construct(target, args.wrappedJSObject || args);
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
			}
			WrapHelper = {
				XRAY, // boolean, are we in a xray environment (i.e. on Firefox)?
				shared: {}, // shared storage object for in inter-wrapper coordination

				// XwrapHelper.forPage() can be used by "complex" proxies to explicitly
				// prepare an object/function created in Firefox's sandboxed content script environment
				// to be consumed/called from the page context (mostly useful to handle callback-based APIs),
				// see the geolocation wrappers
				forPage,
				isForPage: obj => pageReady.has(obj),

				// xray-aware Object creation helpers, mostly used transparently by the code builders
				defineProperty(obj, prop, descriptor, ...args) {
					if (obj.wrappedJSObject) obj = obj.wrappedJSObject;
					return Object.defineProperty(obj, prop, fixProp(descriptor, prop, obj), ...args);
				},
				defineProperties(obj, descriptors, ...args) {
					if (obj.wrappedJSObject) obj = obj.wrappedJSObject;
					for (let [prop, d] of Object.entries(descriptors)) {
						fixProp(d, prop, obj);
					}
					return Object.defineProperties(obj.wrappedJSObject || obj, descriptors, ...args);
				},
				create(proto, descriptors) {
					let obj = forPage(Object.create(proto && proto.wrappedJSObject || proto));
					return descriptors ? this.defineProperties(obj, descriptors) && obj : obj;
				},
				// the original Proxy constructor
				OriginalProxy,
				// our xray-aware proxied Proxy constructor
				Proxy,
			};
			Object.freeze(WrapHelper);
		}

		with(unwrappedWindow) {
			let window = unwrappedWindow;
			let {Proxy} = WrapHelper;
			let {Promise, Object} = xrayWindow;
			try {
				// WRAPPERS //

			} finally {
				// cleanup environment if necessary
			}

		}
	}).toString().replace('// WRAPPERS //',
		wrappers.map(build)
		.join("\n")
		.replace(/\bObject\.(create|definePropert)/g, "WrapHelper.$1"));

	return `(${code})();`;
}

