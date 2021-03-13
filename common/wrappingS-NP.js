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
//
//  Copyright (c) 2020 The Brave Authors.

/** \file
 * This file contains wrappers for NavigatorPlugins.plugins https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins/plugins
 * \ingroup wrappers
 *
 *
 * These approaches are inspired by the algorithms created by Brave Software <https://brave.com>
 * available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/modules/plugins/dom_plugin_array.cc)
 *
 */

/*
 * Create private namespace
 */
(function() {
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
        value:  randomString(32)
      },
      enabledPlugin:{
        value: null
      }
    });
    return ret;
  }
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
        value:  mime.description
      },
      enabledPlugin:{
        value: plugin
      }
    });
    return ret;
  }
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
        value: randomString(nameLength)
      },
      filename:{
        value: randomString(filenameLength),
      },
      description:{
        value:  randomString(descLength)
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

  function fakePluginArray(plugins){
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

  function fakeMimeTypeArray(plugins){
    var ret = Object.create(MimeTypeArray.prototype);
    ret.__proto__.item = item;
    ret.__proto__.namedItem = namedItem;
    ret.__proto__.refresh = refresh;
    var counter = 0;
    for(var i = 0;i<plugins.length;i++){
      for(var j = 0;j>=0;j++){
        if((typeof plugins[i][j] != 'undefined') && (ret.namedItem(plugins[i][j].name)==null) && (plugins[i][j].type != "")){
          ret[counter] = plugins[i][j];
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
  function farblePlugin(plugin){
    var chrome = ["Chrome ", "Chromium ", "Web ", "Browser ", "OpenSource ", "Online ", "JavaScript ", ""];
    var pdf = ["PDF ", "Portable Document Format ", "portable-document-format ", "document ", "doc ", "PDF and PS ", "com.adobe.pdf "];
    var viewer = ["Viewer", "Renderer", "Display", "Plugin", "plug-in", "plug in", "extension", ""];
    var name = plugin.name;
    var description = plugin.description;
    if(plugin.name.includes("PDF")){
      name = chrome[Math.floor(prng() * (chrome.length))]+pdf[Math.floor(prng() * (pdf.length))]+viewer[Math.floor(prng() * (viewer.length))];
      description = pdf[Math.floor(prng() * (pdf.length))];
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
        value: randomString(32),
      },
      description:{
        value:  description
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
  var fakes = fakeMime + fakePlugin + fakePluginArray + fakeMimeTypeArray;
	var wrappers = [
    {
			parent_object: "navigator",
			parent_object_property: "plugins",
			wrapped_objects: [],
			helping_code:
				methods + farbles + fakes +`
				var plugins = navigator.plugins;
				var buffer = [];
				if(args[0]==0){
					for(var i = 0;i<plugins.length;i++){
						buffer.push(farblePlugin(plugins[i]));
					}
				}
				if(args[0]==0 || args[0]==1){
					var fakePlugin1 = fakePlugin(32, 16, 8);
					var fakePlugin2 = fakePlugin(31, 15, 7);
					buffer.push(fakePlugin1, fakePlugin2);
					shuffleArray(buffer);
				}
				var fakePluginArray = fakePluginArray(buffer);
				var fakeMimeTypeArray = fakeMimeTypeArray(fakePluginArray);
			`,
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "navigator",
					parent_object_property: "plugins",
					wrapped_objects: [],
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
					parent_object: "navigator",
					parent_object_property: "mimeTypes",
					wrapped_objects: [],
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
