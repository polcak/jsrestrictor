//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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
 * The object carrying all the wrappers
 */
var build_wrapping_code = {};

/**
 * Create IIFE to wrap the code in closure
 */
function enclose_wrapping(code, ...args) {
	return `(function(...args) {${code}})(${args});`;
}

/**
 * This function create code (as string) that creates code that can be used to inject (or overwrite)
 * a function in the page context.
 */
function define_page_context_function(wrapper) {
	var originalF = wrapper["original_function"] || `${wrapper.parent_object}.${wrapper.parent_object_property}`;
	return enclose_wrapping(`var originalF = ${originalF};
			var replacementF = function(${wrapper.wrapping_function_args}) {
				${wrapper.wrapping_function_body}
			};
			${wrapper.parent_object}.${wrapper.parent_object_property} = replacementF;
			original_functions[replacementF.toString()] = originalF.toString();
			${wrapper.post_replacement_code || ''}
	`);
}

/**
 * This function creates code that assigns an already defined function to given property.
 */
function generate_assign_function_code(code_spec_obj) {
	return `${code_spec_obj.parent_object}.${code_spec_obj.parent_object_property} = ${code_spec_obj.export_function_name};
	`
}

/**
 * This function builds the wrapping code.
 */
var build_code = function(wrapper, ...args) {
	var post_wrapping_functions = {
		function_define: define_page_context_function,
		function_export: generate_assign_function_code,
	};
	var code = "";
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
			code += post_wrapping_functions[code_spec.code_type](code_spec);
		}
	}
	if (wrapper["wrapper_prototype"] !== undefined) {
		code += `Object.setPrototypeOf(${wrapper.parent_object}.${wrapper.parent_object_property},
				${wrapper.wrapper_prototype});
		`
	}
	code += `Object.freeze(${wrapper.parent_object}.${wrapper.parent_object_property});`;
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

