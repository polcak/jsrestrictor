//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019-2020 Libor Polcak
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

/// The original script injecting function
var injectScriptElement = injectScript;

/**
 * This function create code (as string) that creates code that can be used to inject (or overwrite)
 * a function in the page context. Supporting code for dealing with bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1267027.
 */
function define_page_context_function_ffbug(wrapper) {
	return `(function() {
					function tobeexported(${wrapper.wrapping_function_args}) {
						${wrapper.wrapping_function_body}
					}
					exportFunction(tobeexported, ${wrapper.parent_object}, {defineAs: '${wrapper.parent_object_property}'});
					${wrapper.post_replacement_code || ''}
			})();
	`
}

/**
 * This function creates code that assigns an already defined function to given property. Supporting
 * code for dealing with bug https://bugzilla.mozilla.org/show_bug.cgi?id=1267027.
 */
function generate_assign_function_code_ffbug(code_spec_obj) {
	return `exportFunction(${code_spec_obj.export_function_name}, ${code_spec_obj.parent_object},
			{defineAs: '${code_spec_obj.parent_object_property}'});
	`
}

/**
 * Alternative definition of the build_code function.
 *
 * FIXME:this code needs improvements, see bug #25
 */
function build_code_ffbug(wrapper, ...args) {
	var post_wrapping_functions = {
		function_define: define_page_context_function_ffbug,
		function_export: generate_assign_function_code_ffbug,
	};
	var code = "";
	for (wrapped of wrapper.wrapped_objects) {
		code += `var ${wrapped.wrapped_name} = window.wrappedJSObject.${wrapped.original_name};`;
	}
	code += `${wrapper.helping_code || ''}`;
	if (wrapper.wrapping_function_body) {
		code += `function tobeexported(${wrapper.wrapping_function_args}) {
				${wrapper.wrapping_function_body}
			}
	`;
	}
	if (wrapper["wrapper_prototype"] !== undefined) {
		code += `Object.setPrototypeOf(tobeexported, ${wrapper.wrapper_prototype});
		`;
	}
	code += `exportFunction(tobeexported, ${wrapper.parent_object}, {defineAs: '${wrapper.parent_object_property}'});
	`
	if (wrapper["post_wrapping_code"] !== undefined) {
		for (code_spec of wrapper["post_wrapping_code"]) {
			code += post_wrapping_functions[code_spec.code_type](code_spec);
		}
	}
	return enclose_wrapping(code, ...args);
};

/**
 * Determine if we are running in the context where FF blocks script inserting due to bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1267027
 */
function is_firefox_blocking_scripts() {
	var array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	random_str = "JSR" + array[0];
	if (window.wrappedJSObject[random_str] !== undefined) {
		// Unlikely, but we hit an existing property
		return is_firefox_blocking_scripts(); // rerun and generate a new number
	}
	injectScriptElement(enclose_wrapping(`window.${random_str} = 1;`));
	if (window.wrappedJSObject[random_str] === undefined) {
		return true;
	}
	else {
		injectScriptElement(enclose_wrapping(`delete window.${random_str};`));
		return false;
	}
}

/**
 * This function deals with the Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=1267027
 * See also https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
 */
window.injectScript = function prevent_ffbug(code, wrappers, ffbug_present) {
	if (ffbug_present === undefined) {
		ffbug_present = is_firefox_blocking_scripts();
		browser.runtime.sendMessage({
			message: "ffbug1267027",
			url: window.location.href,
			present: ffbug_present
		});
	}
	if (ffbug_present === true) {
		build_code = build_code_ffbug;
		eval(wrap_code(wrappers));
	}
	else {
		injectScriptElement(code);
	}
}
