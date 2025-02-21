/** \file
 * \brief FPD module initial configuration 
 *
 *  \author Copyright (C) 2021  Marek Salon
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

/** \file
 *
 * \brief This file is part of Fingerprint Detector (FPD) and contains the function for loading configuration files.
 *
 * \ingroup FPD
 */

//DEF_FPD_FILES_S
var fp_config_files = [];
//DEF_FPD_FILES_E

/**
 *  Object containing parsed input from JSON configuration files of FPD module.
 */
var fp_levels = {};

/// \cond (Exclude this section from the doxygen documentation. If this section is not excluded, it is documented as a separate function.)
{
	// parse input files into fp_levels for each level, generate wrapping code and initialize FPD module
	let loadFpdConfig = async () => {
		for (let file of fp_config_files) {
			try {
				let config = JSON.parse(await readFile(browser.runtime.getURL(`fp_config/${file}.json`)));
				let file_splitted = file.split("-");
				let file_levels = file_splitted[1].split("_").filter(x => x != 'lvl');
				fp_levels[file_splitted[0]] = fp_levels[file_splitted[0]] || {};
				for (let level of file_levels) {
					fp_levels[file_splitted[0]][level] = config;
				}
			}
			catch (e) {
				console.error(e);
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

		fp_levels.page_wrappers = [];
		for (let level in fp_levels.wrappers) {
			let tmpWrappers = {};
			for (let wrapper of fp_levels.wrappers[level]) {
				if (!Object.keys(tmpWrappers).includes(wrapper.resource)) {
					let sameResources = fp_levels.wrappers[level].filter(x => x.resource == wrapper.resource);
					tmpWrappers[wrapper.resource] = mergeWrappers(sameResources);
				}
			}
			fp_levels.wrappers[level] = Object.values(tmpWrappers);

			// Save FPD wrappers for page configuration
			fp_levels.page_wrappers[level] = fp_levels.wrappers[level].map(w => [
				// Wrapped object name
				w.resource,
				// Wrapped object type (0 - function, 1 - property)
				w.type === "property" ? 1 : 0,
				// Array specifying property types to wrap (getter, setter or both)
				Array.from(new Set(w.groups.map(x => x.property != undefined ? x.property : "get"))),
				// Specify if arguments should be sent for evaulation
				w.groups.some(group => "arguments" in group) ? 1 : 0,
			]);
		}

		// initialize FPD module (background script and event listeners)
		initFpd();

		fp_levels_initialised = true;
		if (levels_initialised) { // Wait for both levels_initialised and fp_levels_initialised
			var orig_levels_updated_callbacks = levels_updated_callbacks;
			levels_updated_callbacks = [];
			orig_levels_updated_callbacks.forEach((it) => it());
			await updateUserScripts();
		}
	}
	loadFpdConfig();
}
/// \endcond
