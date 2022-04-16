/** \file
 * \brief Functions that help to automate process of building wrapping code for FPD module
 *
 *  \author Copyright (C) 2021  Marek Salon
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

/** \file
 *
 * \brief This file is part of Fingerprint Detector (FPD) and contains helper functions for automated wrappers creation. 
 * File also contains loading routine for FPD configuration files (groups-lvl_X.json, wrappers-lvl_X.json, etc...).
 *
 * \ingroup FPD
 */

//DEF_FPD_FILES_S
var fp_config_files = [];
//DEF_FPD_FILES_E

/**
 * The object carrying code for builded FPD wrappers
 */
var fp_wrapped_codes = {};

/**
 *  Object containing parsed input from JSON configuration files of FPD module.
 */
var fp_levels = {};

/**
 *  Additional wrappers for specialized purposes.
 */
var additional_wrappers = [
	{
		parent_object: "HTMLElement.prototype",
		parent_object_property: "offsetHeight",
		wrapped_objects: [],
		post_wrapping_code: [
			{
				code_type: "object_properties",
				parent_object: "HTMLElement.prototype",
				parent_object_property: "offsetHeight",
				wrapped_objects: [
					{
						original_name: `
							Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight") ? 
							Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")["get"] : 
							HTMLElement.prototype.offsetHeight
						`,
						wrapped_name: "originalD_get"
					}
				],
				wrapped_properties: [
					{
						property_name: "get",
						property_value: `function() {
							// workaround - style property is bound to HTMLElement instance, check fontFamily value with every access
							let font = this.style.fontFamily;
							updateCount("CSSStyleDeclaration.prototype.fontFamily", "set", [font]);
							return originalD_get.call(this);
						}`
					}
				]
			}
		]
	},
	{
		parent_object: "HTMLElement.prototype",
		parent_object_property: "offsetWidth",
		wrapped_objects: [],
		post_wrapping_code: [
			{
				code_type: "object_properties",
				parent_object: "HTMLElement.prototype",
				parent_object_property: "offsetWidth",
				wrapped_objects: [
					{
						original_name: `
							Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth") ? 
							Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")["get"] : 
							HTMLElement.prototype.offsetWidth
						`,
						wrapped_name: "originalD_get"
					}
				],
				wrapped_properties: [
					{
						property_name: "get",
						property_value: `function() {
							// workaround - style property is bound to HTMLElement instance, check fontFamily value with every access
							let font = this.style.fontFamily;
							updateCount("CSSStyleDeclaration.prototype.fontFamily", "set", [font]);
							return originalD_get.call(this);
						}`
					}
				]
			}
		]
	}
]

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
{
	// parse input files into fp_levels for each level, generate wrapping code and initialize FPD module
	let loadFpdConfig = async () => {
		for (let file of fp_config_files) {
			let response = await fetch(browser.runtime.getURL(`fp_config/${file}.json`));
			let content = await response.json();

			let file_splitted = file.split("-");
			let file_levels = file_splitted[1].split("_").filter(x => x != 'lvl');
			
			fp_levels[file_splitted[0]] = fp_levels[file_splitted[0]] || {};
			for (let level of file_levels) {
				fp_levels[file_splitted[0]][level] = content;
			}
		}

		// merge duplicit entries of the same resource to be wrapped only once
		let mergeWrappers = (sameResources) => {
			let mergeGroups = () => {
				let accArray = [];
				for (let resource of sameResources) {
					accArray.push(...resource.groups);
				}
				return accArray;
			}

			return {
				resource: sameResources[0].resource,
				type: sameResources[0].type,
				groups: mergeGroups()
			}
		}

		for (let level in fp_levels.wrappers) {
			let tmpWrappers = {};
			for (let wrapper of fp_levels.wrappers[level]) {
				if (!Object.keys(tmpWrappers).includes(wrapper.resource)) {
					let sameResources = fp_levels.wrappers[level].filter(x => x.resource == wrapper.resource);
					tmpWrappers[wrapper.resource] = mergeWrappers(sameResources);
				}
			}
			fp_levels.wrappers[level] = Object.values(tmpWrappers);
		}

		for (let level in fp_levels.wrappers) {
			// define wrapper for each FPD endpoint (using default JSS definition of wrappers)
			let tmp_build_wrapping_code = {};
			for (let wrap_item of fp_levels.wrappers[level]) {
				if (wrap_item.type == "property") {
					tmp_build_wrapping_code[wrap_item.resource] = fp_build_property_wrapper(wrap_item);
				}
				else if (wrap_item.type == "function") {
					tmp_build_wrapping_code[wrap_item.resource] = fp_build_function_wrapper(wrap_item);
				}
			}
				
			// if there is an additional wrapper for resource, overwrite default definition with it
			for (let additional_item of additional_wrappers) {
				let { parent_object, parent_object_property } = additional_item;
				let resource = `${parent_object}.${parent_object_property}`;			
				if (resource in tmp_build_wrapping_code) {
					tmp_build_wrapping_code[resource] = additional_item;
				}
			}

			// transform each wrapper to wrapping code and index it in memory for quick access
			fp_wrapped_codes[level] = {};
			for (let build_item in tmp_build_wrapping_code) {
				try {
					fp_wrapped_codes[level][build_item] = build_code(tmp_build_wrapping_code[build_item]);
				} catch (e) {
					console.error(e);
					fp_wrapped_codes[level][build_item] = "";
				}
			}
		}

		// initialize FPD module (background script and event listeners)
		initFpd();
	}
	loadFpdConfig();
}
/// \endcond

/**
 * The function that appends FPD wrappers into injectable code, if JSS hasn't wrapped certain FPD endpoints already.
 *
 * \param code String containing injectable code generated by "generate_code" method.
 * \param jss_wrappers Array of wrappers defined by JSS level object.
 * \param fpd_level Identifier of the current FPD level/config.
 * 
 * \returns Modified injectable code that also contains FPD wrapping code.
 */
function fp_update_wrapping_code(code, jss_wrappers, fpd_level) {
	// mozno nemusi
	//code = code.replace(/\/\/ FPD_S[\s\S]*?\/\/ FPD_E/, "// FPD_S\n\n// FPD_E");
	let fpd_wrappers = Object.keys(fp_wrapped_codes[fpd_level])
		.filter(key => !jss_wrappers.map(x => x[0]).includes(key))
		.reduce((obj, key) => {
			obj[key] = fp_wrapped_codes[fpd_level][key];
			return obj;
		}, {});
	let fpd_code = joinWrappingCode(Object.values(fpd_wrappers));
	return code.replace("// FPD_S\n", `// FPD_S\n ${fpd_code}`);
}

/**
 * The function that creates injectable code specifically for FPD wrappers in case that JSS hasn't wrapped anything.
 *
 * \param fpd_level Identifier of the current FPD level/config.
 * 
 * \returns Injectable code containing only FPD wrapping code.
 */
function fp_generate_wrapping_code(fpd_level) {
	return generate_code("// FPD_S\n" + joinWrappingCode(Object.values(fp_wrapped_codes[fpd_level])) + "\n// FPD_E");
}

/**
 * The function splitting resource string into path and name.
 * For example: "window.navigator.userAgent" => path: "window.navigator", name: "userAgent"
 *
 * \param wrappers text String representing full name of resource.
 * 
 * \returns Object consisting of two properties (path, name) for given resource.
 */
function split_resource(text) {
    var index = text.lastIndexOf('.');
    return { 
		path: text.slice(0, index),
		name: text.slice(index + 1) 
	}
}

/**
 * The function that constructs implicit property wrapper object from FPD configuration.
 * 
 * \param wrap_item Single resource object from FPD wrappers definition.
 * 
 * \returns New declarative property wrapper supported by code_builder (same structure as explicitly defined wrappers).
 */
function fp_build_property_wrapper(wrap_item) {
	// return object initialization
	var wrapper_object = {};
	
	// get unique array of property types (set, get), if property not defined => implicit get
	var propTypes = Array.from(new Set(wrap_item.groups.map(
		(x) => { return x.property != undefined ? x.property : "get" })));

	// if properties to wrap exist, create property wrapper based on wrap_item input
	if (propTypes.size != 0) {
		var resource_splitted = split_resource(wrap_item.resource);
		wrapper_object = {
			parent_object: resource_splitted["path"],
			parent_object_property: resource_splitted["name"],
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: resource_splitted["path"],
					parent_object_property: resource_splitted["name"],
					wrapped_objects: [],
					wrapped_properties: [],
				}
			],
		};

		// create post_wrapping_code to wrap every property type
		for (let type of propTypes) {

			// save original resource - get property from descriptor, if do not exists, save it directly
			wrapper_object.post_wrapping_code[0].wrapped_objects.push({
				original_name: `
					Object.getOwnPropertyDescriptor(${resource_splitted["path"]}, "${resource_splitted["name"]}") ?
					Object.getOwnPropertyDescriptor(${resource_splitted["path"]}, "${resource_splitted["name"]}")["${type}"] :
					${type == "get" ? wrap_item.resource : undefined}
				`,
				wrapped_name: `originalD_${type}`,
			});

			// return original property (do not change semantics)
			wrapper_object.post_wrapping_code[0].wrapped_properties.push({
				property_name: type,
				property_value: `
					originalD_${type}
				`,
			})
		};
	}
	return wrapper_object;
}

/**
 * The function that constructs implicit function wrapper object from FPD configuration.
 * 
 * \param wrap_item Single resource object from FPD wrappers definition.
 * 
 * \returns New declarative function wrapper supported by code_builder (same structure as explicitly defined wrappers).
 */
function fp_build_function_wrapper(wrap_item) {
	var resource_splitted = split_resource(wrap_item.resource);
	
	var wrapper_object = {
		parent_object: resource_splitted["path"],
		parent_object_property: resource_splitted["name"],

		// save original function into variable
		wrapped_objects: [{
			original_name: `${resource_splitted["path"]}.${resource_splitted["name"]}`,
			wrapped_name: `originalF_${resource_splitted["name"]}`
		}],
		wrapping_function_args: "...args",
		
		// call original function on return with same arguments and context (do not change semantics)
		wrapping_function_body: `
			return originalF_${resource_splitted["name"]}.call(this, ...args);
		`,
	};
	return wrapper_object;
}
