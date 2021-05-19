//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Libor Polcak, Marek Saloň
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

/**
 * Create IIFE to wrap the code in closure
 */
function enclose_wrapping(code, ...args) {
	return `try{(function(...args) {${code}})(${args});} catch {}`;
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
	var originalF = wrapper["original_function"] || `${wrapper.parent_object}.${wrapper.parent_object_property}`;
	return enclose_wrapping2(`var originalF = ${originalF};
			var fp_counter_call = 0;
			var replacementF = function(${wrapper.wrapping_function_args}) {
				// This comment is needed to correctly differentiate wrappers with the same body
				// by the toString() wrapper
				// ${wrapper.parent_object}.${wrapper.parent_object_property} - ${wrapper.original_function}
				// Prevent fingerprintability of the extension by toString behaviour
				// ${gen_random32()}

				// Sending access log to content script
				if (fp_counter_call < 1000) {
					window.top.postMessage({
						purpose: "fp-detection",
						enabled: fp_enabled,
						resource: "${wrapper.parent_object}.${wrapper.parent_object_property}",
						type: "call",
						args: Array.from(arguments).map(x => JSON.stringify(x))
					}, "*");
				}

				// increase fp_counter to limit messages of particular resource
				if (fp_enabled && fp_counter_call < 1000) {
					fp_counter_call += 1;
				}

				${wrapper.wrapping_function_body}
			};
			${wrapper.replace_original_function ? wrapper.original_function : `${wrapper.parent_object}.${wrapper.parent_object_property}`} = replacementF;
			original_functions[replacementF.toString()] = originalF.toString();
			${wrapper.post_replacement_code || ''}
	`, wrapper.wrapping_code_function_name, wrapper.wrapping_code_function_params, wrapper.wrapping_code_function_call_window);
}

/**
 * This function creates code that assigns an already defined function to given property.
 */
function generate_assign_function_code(code_spec_obj) {
	return `${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property} = ${code_spec_obj.export_function_name};
	`
}

/**
 * This function wraps object properties using Object.defineProperties.
 */
function generate_object_properties(code_spec_obj, only_fp_mode = false) {
	// descriptor for non-existing property
	var force_desc = `
		descriptor = { // Descriptor for newly created property
			get: () => { return this.${code_spec_obj.parent_object_property} },
			set: (val) => { this.${code_spec_obj.parent_object_property} = val },
			configurable: false,
			enumerable: true
		};
	}
	`;
	// descriptor for existing property
	var standard_desc = `
		descriptor = { // Originally not a descriptor
			get: ${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property},
			set: undefined,
			configurable: false,
			enumerable: true
		};
	}
	`;
	var code = `
		if (!("${code_spec_obj.parent_object_property}" in ${code_spec_obj.parent_object}) && ${!code_spec_obj.force_wrapping}) {
			// Do not wrap an object that is not defined, e.g. because it is experimental feature.
			// This should reduce fingerprintability.
			return;
		}
	`;
	for (assign of code_spec_obj.wrapped_objects) {
		code += `var ${assign.wrapped_name} = ${assign.original_name};`;
	}
	code += `descriptor = Object.getOwnPropertyDescriptor(
			${code_spec_obj.parent_object}, "${code_spec_obj.parent_object_property}");
		if (descriptor === undefined) {
	`;
	// if force wrapping enabled, new property is set with custom descriptor
	code += code_spec_obj.force_wrapping ? force_desc : standard_desc;
			
	for (wrap_spec of code_spec_obj.wrapped_properties) {
		// variable name for saving original property definition
		var default_desc = `originalP_${wrap_spec.property_name}`;

		// wrapping function that includes logging messages to be injected on top of other wrappers
		var fp_property = `
			function(...args) {
				// ToString() overload needed comment
				// ${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property}_${wrap_spec.property_name}
				// ${gen_random32()}

				if (fp_counter_${wrap_spec.property_name} < 1000) {
					window.top.postMessage({
						purpose: "fp-detection",
						enabled: fp_enabled,
						resource: "${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property}",
						type: "${wrap_spec.property_name}",
						args: Array.from(arguments).map(x => JSON.stringify(x))
					}, "*");
				}

				if (fp_enabled && fp_counter_${wrap_spec.property_name} < 1000) {
					fp_counter_${wrap_spec.property_name} += 1;
				}

 				// checks type of underlying wrapper/definition and returns it (no changes to semantics)
				if (typeof (${only_fp_mode || code_spec_obj.force_wrapping ? default_desc : wrap_spec.property_value}) === 'function') {
				 	return (${only_fp_mode || code_spec_obj.force_wrapping ? default_desc : wrap_spec.property_value}).bind(this)(...args);
				}
				else {
					return (${only_fp_mode || code_spec_obj.force_wrapping ? default_desc : wrap_spec.property_value});
				}
			}`;
		
		// only_fp_mode - when using apply_if - wrap resource for logging even when condition is not met
	    if (only_fp_mode || code_spec_obj.force_wrapping) {
			code += `var originalP_${wrap_spec.property_name} = descriptor["${wrap_spec.property_name}"];`;
		}
		code += `
			originalPDF = descriptor["${wrap_spec.property_name}"];
			var fp_counter_${wrap_spec.property_name} = 0;
			replacementPD = ${fp_property};
			descriptor["${wrap_spec.property_name}"] = replacementPD;
			if (replacementPD instanceof Function) {
				original_functions[replacementPD.toString()] = originalPDF ? originalPDF.toString() : undefined;
			}
		`;
	}
	code += `Object.defineProperty(${code_spec_obj.parent_object},
		"${code_spec_obj.parent_object_property}", descriptor);
	`;
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
				Object.defineProperty(
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
	var code = `if (${wrapper.parent_object} === undefined) {return;}`;
	
	// add flag variable that determines whether messages are valid (sended after wrappers injection)
	code += `var fp_enabled = false;`
	
	for (wrapped of wrapper.wrapped_objects) {
		code += `
			var ${wrapped.wrapped_name} = ${wrapped.original_name};
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
			// if not wrapped because of apply_if condition, still needs to be wrapped just because of logging
			if (code_spec.apply_if !== undefined && code_spec.code_type == "object_properties") {
				code += "else {" + post_wrapping_functions[code_spec.code_type](code_spec, true) + "}";
			}
		}
	}
	if (wrapper["wrapper_prototype"] !== undefined) {
		code += `Object.setPrototypeOf(${wrapper.parent_object}.${wrapper.parent_object_property},
				${wrapper.wrapper_prototype});
		`
	}

	code += `
		if (!${wrapper.nofreeze}) {
			// make property non-configurable to prevent its modifications that can corrupt logging
			Object.defineProperty(${wrapper.parent_object}, "${wrapper.parent_object_property}", {
				configurable:false
			});
			try {
				Object.freeze(${wrapper.parent_object}.${wrapper.parent_object_property});
			}
			catch {
				// some objects have properties defined on their prototype object which cannot be freezed
				// so try to define non-configurable properties on existing objects - allows monitor properties directly from prototype
				if (window.${fp_remove_proto(wrapper.parent_object)} && ${fp_remove_proto(wrapper.parent_object)}.${wrapper.parent_object_property}) {
					Object.defineProperty(${fp_remove_proto(wrapper.parent_object)}, "${wrapper.parent_object_property}", {
						get: Object.getOwnPropertyDescriptor(${wrapper.parent_object}, "${wrapper.parent_object_property}")["get"],
						set: Object.getOwnPropertyDescriptor(${wrapper.parent_object}, "${wrapper.parent_object_property}")["set"],
						configurable: false,
						enumerable: true,
					});
				}
			}
		}
	`;

	// make messages from this wrapper valid
	code += `fp_enabled = true;`
	return enclose_wrapping(code, ...args);
};

/**
 * Transform wrapping arrays into code.
 *
 * @param Array of wrapping arrays.
 */
function wrap_code(wrappers) {
	if (wrappers.length === 0 && fp_wrappers_length(wrappers) === 0) {
		return; // Nothing to wrap
	}

	// get all implicit wrappers for FPD logging
	var new_build_wrapping_code = fp_wrappers_create(wrappers);

	var code = `(function() {
		var original_functions = {};
		`;

	for (tobewrapped of wrappers) {
		try {
			code += build_code(build_wrapping_code[tobewrapped[0]], tobewrapped.slice(1));
		}
		catch (e) {
			console.log(e);
		}
	}

	// create code of implicit wrappers
	for (let key in new_build_wrapping_code) {
		try {
			code += build_code(new_build_wrapping_code[key]);
		}
		catch (e) {
			console.log(e);
		}
	}
	
	code += `
			var originalToStringF = Function.prototype.toString;
			var originalToStringStr = Function.prototype.toString();
			Function.prototype.toString = function() {
				var currentString = originalToStringF.call(this);
				var originalStr = original_functions[currentString];
				if (originalStr !== undefined) {
					return originalStr;
				}
				else {
					return currentString;
				}
			};
			original_functions[Function.prototype.toString.toString()] = originalToStringStr;
		})();`;
	return code;
}