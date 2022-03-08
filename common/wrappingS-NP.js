/** \file
 * \brief Wrappers for NavigatorPlugins
 *
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2022  Martin Bednar
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
 * This file contains wrappers for NavigatorPlugins. See the MDN docs on the [plugins](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/plugins)
 * and [MIME types](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/mimeTypes).
 *
 * \ingroup wrappers
 *
 * The goal is to prevent fingerprinting by modifying value returned by getters navigator.plugins and navigator.mimeTypes
 *
 * This wrapper operates with three levels of protection:
 *
 *	 * (0) - replace by shuffled edited PluginArray with two added fake plugins, edited MimeTypeArray
 *	 * (1) - replace by shuffled PluginArray with two fake plugins, empty MimeTypeArray
 *	 * (2) - replace by empty PluginArray and MimeTypeArray
 *
 * These approaches are inspired by the algorithms created by [Brave Software](https://brave.com)
 * available [here](https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/plugins/dom_plugin_array.cc).
 *
 */

/*
 * Create private namespace
 */
(function() {
	/**
	 * \brief create and return fake MimeType object
	 *
	 */
	function fakeMime(){
		var ret = Object.create(MimeType.prototype);
		Object.defineProperties(ret, {
			type:{
				value: ""
			},
			suffixes:{
				value: ""
			},
			description:{
				value: randomString(32, 0, fp_prng)
			},
			enabledPlugin:{
				value: null
			}
		});
		return ret;
	}
	/**
	 * \brief create and return fake MimeType object created from given mime and plugin
	 *
	 * \param mime original MimeType object https://developer.mozilla.org/en-US/docs/Web/API/MimeType
	 * \param plugin original Plugin object https://developer.mozilla.org/en-US/docs/Web/API/Plugin
	 */
	function farbleMime(mime, plugin){
		var ret = Object.create(MimeType.prototype);
		Object.defineProperties(ret, {
			type:{
				value: mime.type
			},
			suffixes:{
				value: mime.suffixes
			},
			description:{
				value: mime.description
			},
			enabledPlugin:{
				value: plugin
			}
		});
		return ret;
	}
	/**
	 * \brief create and return fake Plugin object
	 *
	 * \param descLength enum specifying browser 0 - Chrome 1 - Firefox
	 * \param filenameLength enum specifying browser 0 - Chrome 1 - Firefox
	 * \param nameLength enum specifying browser 0 - Chrome 1 - Firefox
	 */
	function fakePlugin(descLength, filenameLength, nameLength){
		var ret = Object.create(Plugin.prototype);
		var mime = fakeMime();
		Object.defineProperties(ret, {
			0:{
				value: mime
			},
			"":{
				value: mime
			},
			name:{
				value: randomString(nameLength, 0, fp_prng)
			},
			filename:{
				value: randomString(filenameLength, 0, fp_prng)
			},
			description:{
				value: randomString(descLength, 0, fp_prng)
			},
			version:{
				value: null
			},
			length:{
				value: 1
			}
		});
		ret.__proto__.item = item;
		ret.__proto__.namedItem = namedItem;
		return ret;
	}
	/**
	 * \brief create and return fake PluginArray object containing given plugins
	 *
	 * \param plugins array of Plugin objects https://developer.mozilla.org/en-US/docs/Web/API/Plugin
	 */
	function fakePluginArrayF(plugins){
		var ret = Object.create(PluginArray.prototype);
		var count = 0;
		for(var i = 0; i<plugins.length; i++) {
			ret[i] = plugins[i];
			if(plugins[i][0].type != "") {
				Object.defineProperty(ret, plugins[i].name, {
					value: plugins[count],
				});
				count++;
			}
		}
		Object.defineProperty(ret, 'length', {
			value: plugins.length,
		});
		ret.__proto__.item = item;
		ret.__proto__.namedItem = namedItem;
		ret.__proto__.refresh = refresh;
		return ret;
	}
	/**
	 * \brief create and return fake MimeTypeArray object
	 *
	 * \param plugins PluginArray object https://developer.mozilla.org/en-US/docs/Web/API/PluginArray
	 */
	function fakeMimeTypeArrayF(plugins){
		var ret = Object.create(MimeTypeArray.prototype);
		ret.__proto__.item = item;
		ret.__proto__.namedItem = namedItem;
		ret.__proto__.refresh = refresh;
		var counter = 0;
		for(var i = 0;i<plugins.length;i++){
			for(var j = 0;j>=0;j++){
				// (plugins[i][j].type != "") <- Exclude fake plugins. Fake plugin has type == "".
				if((typeof plugins[i][j] != 'undefined') && (ret.namedItem(plugins[i][j].name)==null) && (plugins[i][j].type != "")){
					ret[counter] = farbleMime(plugins[i][j], plugins[i]);
					ret[plugins[i][j].type] = plugins[i][j];
					counter++;
				}
				else{
					break;
				}
			}
		}

		Object.defineProperty(ret, 'length', {
			value: counter
		});
		return ret;
	}
	function item(arg){
		if(typeof arg != 'undefined' && Number.isInteger(Number(arg)))
			return this[arg];
		else return null;
	}

	function namedItem(arg){
		if(typeof arg != 'undefined' && this[arg])
			return this[arg];
		else return null;
	}
	function refresh(){
		return undefined;
	}
	/**
	 * \brief create modified Plugin object from given plugin
	 *
	 * \param plugin original Plugin object https://developer.mozilla.org/en-US/docs/Web/API/Plugin
	 *
	 * Replaces words in name and description parameters in PDF plugins (default plugins in most browsers)
	 */
	function farblePlugin(plugin, fp_prng){
		var name = plugin.name;
		var description = plugin.description;
		if(plugin.name.includes("PDF")){
			let chrome = ["Chrome ", "Chromium ", "Web ", "Browser ", "OpenSource ", "Online ", "JavaScript ", ""];
			let pdf = ["PDF ", "Portable Document Format ", "portable-document-format ", "document ", "doc ", "PDF and PS ", "com.adobe.pdf "];
			let viewer = ["Viewer", "Renderer", "Display", "Plugin", "plug-in", "plug in", "extension", ""];
			name = chrome[Math.floor(fp_prng() * (chrome.length))]+pdf[Math.floor(fp_prng() * (pdf.length))]+viewer[Math.floor(fp_prng() * (viewer.length))];
			description = pdf[Math.floor(fp_prng() * (pdf.length))];
		}
		var ret = Object.create(Plugin.prototype);
		var counter = 0;
		while(1){
			if(typeof plugin[counter] != 'undefined'){
				Object.defineProperties(ret, {
					[counter]:{
						value: farbleMime(plugin[counter],ret)
					},
					[plugin[counter].type]:{
						value: farbleMime(plugin[counter],ret)
					}
				});
			}
			else {
				break;
			}
			counter++;
		}
		Object.defineProperties(ret, {
			name:{
				value: name
			},
			filename:{
				value: randomString(32, 0, fp_prng),
			},
			description:{
				value: description
			},
			version:{
				value: null
			},
			length:{
				value: 1
			}
		});
		ret.__proto__.item = item;
		ret.__proto__.namedItem = namedItem;
		ret.__proto__.refresh = refresh;
		return ret;
	}
	var methods = item + namedItem + refresh + shuffleArray + randomString;
	var farbles = farblePlugin + farbleMime;
	var fakes = fakeMime + fakePlugin + fakePluginArrayF + fakeMimeTypeArrayF;
	var wrappers = [
		{
			parent_object: "Navigator.prototype",
			parent_object_property: "plugins",
			apply_if: "navigator.plugins.length > 0",
			wrapped_objects: [],
			helping_code:
				methods + farbles + fakes +`
				var fp_prng = alea(domainHash, "S-NP");
				var plugins = navigator.plugins;
				var buffer = [];
				if(args[0]==0){
					for(var i = 0;i<plugins.length;i++){
						buffer.push(farblePlugin(plugins[i]), fp_prng);
					}
				}
				if(args[0]==1){
					for(var i = 0;i<plugins.length;i++){
						buffer.push(plugins[i]);
					}
					shuffleArray(buffer);
				}
				if(args[0]==0 || args[0]==1){
					var fakePlugin1 = fakePlugin(32, 16, 8);
					var fakePlugin2 = fakePlugin(31, 15, 7);
					buffer.push(fakePlugin1, fakePlugin2);
					shuffleArray(buffer);
				}
				var fakePluginArray = fakePluginArrayF(buffer);
				if(args[0]==1 || args[0]==2){
					var fakeMimeTypeArray = fakeMimeTypeArrayF([]);
				}
				else {
					var fakeMimeTypeArray = fakeMimeTypeArrayF(fakePluginArray);
				}
			`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "Navigator.prototype",
					parent_object_property: "plugins",
					wrapped_objects: [],
					/** \brief replaces navigator.plugins getter
					 *
					 * Depending on level chosen this property returns:
					 *	* (0) - shuffled PluginArray object with modified original plugins and two fake plugins
					 *	* (1) - shuffled PluginArray object with two fake Plugins
					 *	* (2) - empty PluginArray object
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return fakePluginArray;
								}`,
						},
					],
				},
				{
					code_type: "object_properties",
					parent_object: "Navigator.prototype",
					parent_object_property: "mimeTypes",
					wrapped_objects: [],
					/** \brief replaces navigator.mimeTypes getter
					 *
					 * Depending on level chosen this property returns:
					 *	* (0) - modified MimeTypeArray with links to updated Plugins
					 *	* (1,2) - empty MimeTypeArray object
					 */
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									return fakeMimeTypeArray;
								}`,
						},
					],
				}
			],
		},
	];
	add_wrappers(wrappers);
})();
