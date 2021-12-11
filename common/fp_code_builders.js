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
 * \brief This file is part of Fingerprinting Detection (FPD) and contains helper functions for automated wrappers creation. 
 * File also contains loading routine for FPD configuration files (groups-lvl_X.json, wrappers-lvl_X.json, etc...).
 *
 * \ingroup FPD
 */

/**
 *  Object containing parsed input from JSON configuration files of FPD module.
 */
var fp_levels = {};

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
// parse input files from fp_config_code into fp_levels for each level
for (let key in fp_config_code) {
	// split file name and determine all asociated levels
	var key_splitted = key.split("-");
	var key_levels = key_splitted[1].split("_").filter(x => x != 'lvl');

	// divide input into groups/wrappers and asociated levels
	fp_levels[key_splitted[0]] = fp_levels[key_splitted[0]] || {};
	for (let level of key_levels) {
		fp_levels[key_splitted[0]][level] = JSON.parse(fp_config_code[key]);
	}
}

// merge duplicit entries of the same resource to be wrapped only once
{
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
}

/// \endcond

/**
 * The function returning amount of FPD wrappers defined for specific level.
 *
 * \param level_id Id of currently wrapped level.
 */
function fp_wrappers_length(level_id) {
	return fp_levels.wrappers[level_id] ? fp_levels.wrappers[level_id].length : fp_levels.wrappers["default"].length;
}

/**
 * The function for initialization of building new wrappers that are not explicitly defined (in wrappingS files).
 *
 * \param level Object of protection level containing array of explicitly wrapped resources.
 * 
 * \returns Standard object for wrapping resources by code_builder (structurally same as build_wrapping_code).
 */
function fp_wrappers_create(level) {
	// return object initialization
	var fpd_build_wrapping_code = {};
	
	// get id of wrapped level
	var level_id = level.level_id;

	// if level is not defined by FPD, use default FPD configuration
    if (fp_levels.wrappers[level.level_id] == undefined) {
		level_id = "default";
	}

	for (let wrap_item of fp_levels.wrappers[level_id]) {
		// implicitly create wrapper object for every defined resource that is not explicitly defined
		if (!(level.wrappers.map((x) => { return x[0] })).includes(wrap_item.resource)) {
			if (wrap_item.type == "property") {
				fpd_build_wrapping_code[wrap_item.resource] = fp_build_property_wrapper(wrap_item);
			}
			else if (wrap_item.type == "function") {
				fpd_build_wrapping_code[wrap_item.resource] = fp_build_function_wrapper(wrap_item);
			}
		}
	} 
    return fpd_build_wrapping_code;
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
					force_wrapping: wrap_item.force_wrapping ? true : false,
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
		force_wrapping: wrap_item.force_wrapping ? true : false,

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

/**
 * The function that try to remove prototype substrings from resource path and change first char to lower case.
 * Used in code_builder to optionally wrap existing object after its prototype is wrapped.
 *
 * \param input Path part of full resource name (parent_object in terms of code_builder).
 */
function fp_remove_proto(input) {
	var replacedStr = input.replace(".prototype","").replace(".__proto__","");
	return replacedStr.charAt(0).toLowerCase() + replacedStr.slice(1);
}