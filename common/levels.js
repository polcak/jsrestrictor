//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019-2021  Libor Polcak
//  Copyright (C) 2019  Martin Timko
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

if ((typeof browser) === "undefined") {
	var browser = chrome;
}

/**
 * Wrapping groups
 *
 * Used to control the built-in levels and options GUI.
 */
var wrapping_groups = {
	empty_level: { /// Automatically populated
		level_text: "",
		level_id: "",
		level_description: "",
	},
	option_map: {}, ///Automatically populated
	associated_params: {}, ///Automatically populated
	get_wrappers: function(level) {
		wrappers = [];
		for (group of wrapping_groups.groups) {
			if (level[group.id] === true) {
				let arg_names = wrapping_groups.associated_params[group.id];
				let arg_values = arg_names.reduce(function(prev, name) {
					prev.push(level[name]);
					return prev;
				}, []);
				group.wrappers.forEach((w) => wrappers.push([w, ...arg_values]));
			}
		}
		return wrappers;
	},
	groups: [
		{
			name: "time_precision",
			description: "Manipulate the time precision provided by Date and performance",
			description2: ["If you enable Geolocation API wrapping below, timestamps provided by the Geolocation API will be wrapped as well"],
			options: [
				{
					description: "Manipulate time to",
					ui_elem: "select",
					name: "precision",
					default: 1,
					data_type: "Number",
					options: [
						{
							value: 2,
							description: "Hundredths of a second (1.230)",
						},
						{
							value: 1,
							description: "Tenths of a second (1.200)",
						},
						{
							value: 0,
							description: "Full seconds (1.000)",
						},
					],
				},
				{
					ui_elem: "input-checkbox",
					name: "randomize",
					description: "Apply additional randomization after rounding (note that the random noise is influenced by the selected precision and consequently is more effective with lower time precision)",
					data_type: "Boolean",
					default: false,
				},
			],
			wrappers: [
				// HRT
				"Performance.prototype.now",
				// PT2
				"PerformanceEntry.prototype",
				// ECMA
				"window.Date",
			],
		},
		{
			name: "htmlcanvaselement",
			description: "Protect against canvas fingerprinting",
			description2: ["Functions canvas.toDataURL(), canvas.toBlob(), CanvasRenderingContext2D.getImageData, OffscreenCanvas.convertToBlob() return modified image data to prevent fingerprinting",],
			options: [
				{
				description: "farbling type",
				ui_elem: "select",
				name: "method",
				default: 0,
				data_type: "Number",
				options: [
					{
						value: 0,
						description: "Alter image data based on domain and session hashes",
					},
					{
						value: 1,
						description: "Replace by white image",
					}
				],
			}
		],
			wrappers: [
				// H-C
				"CanvasRenderingContext2D.prototype.getImageData",
				"HTMLCanvasElement.prototype.toBlob",
				"HTMLCanvasElement.prototype.toDataURL",
				"OffscreenCanvas.prototype.convertToBlob"
			],
		},
		{
			name: "audiobuffer",
			description: "Protect against audio fingerprinting",
			description2: ["Functions AudioBuffer.getChannelData() and AudioBuffer.copyFromChannel() are modified to alter audio data based on domain key"],
			options: [
				{
					description: "farbling type",
					ui_elem: "select",
					name: "method",
					default: 0,
					data_type: "Number",
					options: [
						{
							value: 0,
							description: "Add amplitude noise based on domain hash",
						},
						{
							value: 1,
							description: "Replace by white noise based on domain hash",
						}
					],
				}
			],
			wrappers: [
				// AUDIO
				"AudioBuffer.prototype.getChannelData",
				"AudioBuffer.prototype.copyFromChannel",
				"AnalyserNode.prototype.getByteTimeDomainData",
				"AnalyserNode.prototype.getFloatTimeDomainData",
				"AnalyserNode.prototype.getByteFrequencyData",
				"AnalyserNode.prototype.getFloatFrequencyData"
			],
		},
		{
			name: "webgl",
			description: "Protect against wegbl fingerprinting",
			description2: [],
			options: [{
				description: "farbling type",
				ui_elem: "select",
				name: "method",
				default: 0,
				data_type: "Number",
				options: [
					{
						value: 0,
						description: "Generate random numbers/strings based on domain hash",
					},
					{
						value: 1,
						description: "Return bottom values (null, empty string)",
					}
				],
			}],
			wrappers: [
				// WEGBL
				"WebGLRenderingContext.prototype.getParameter",
				"WebGL2RenderingContext.prototype.getParameter",
				"WebGLRenderingContext.prototype.getFramebufferAttachmentParameter",
				"WebGLRenderingContext.prototype.getActiveAttrib",
				"WebGLRenderingContext.prototype.getActiveUniform",
				"WebGLRenderingContext.prototype.getAttribLocation",
				"WebGLRenderingContext.prototype.getBufferParameter",
				"WebGLRenderingContext.prototype.getProgramParameter",
				"WebGLRenderingContext.prototype.getRenderbufferParameter",
				"WebGLRenderingContext.prototype.getShaderParameter",
				"WebGLRenderingContext.prototype.getShaderPrecisionFormat",
				"WebGLRenderingContext.prototype.getTexParameter",
				"WebGLRenderingContext.prototype.getUniformLocation",
				"WebGLRenderingContext.prototype.getVertexAttribOffset",
				"WebGLRenderingContext.prototype.getSupportedExtensions",
				"WebGLRenderingContext.prototype.getExtension",
				"WebGLRenderingContext.prototype.readPixels",
				"WebGL2RenderingContext.prototype.readPixels"
			],
		},
		{
			name: "enumerateDevices",
			description: "Hide multimedia devices. Consequently, prevent fingerprinting based on the multimedia devices connected to the computer",
			description2: [],
			options: [],
			wrappers: [
				// MCS
				"MediaDevices.prototype.enumerateDevices",
			],
		},
		{
			name: "hardware",
			description: "Spoof hardware information to the most popular HW",
			description2: [
				navigator.deviceMemory !== undefined ? "navigator.deviceMemory: 4" : "",
				"navigator.hardwareConcurrency: 2",
			],
			options: [],
			wrappers: [
				// HTML-LS
				"navigator.hardwareConcurrency",
				// DM
				"navigator.deviceMemory",
			],
		},
		{
			name: "xhr",
			description: "Filter XMLHttpRequest requests",
			description2: [],
			options: [
				{
					ui_elem: "input-radio",
					name: "behaviour",
					data_type: "Boolean",
					options: [
						{
							value: "block",
							description: "Block all XMLHttpRequest.",
							default: false,
						},
						{
							value: "ask",
							description: "Ask before executing an XHR request.",
							default: true,
						},
					],
				},
			],
			wrappers: [
				// AJAX
				"window.XMLHttpRequest",
			],
		},
		{
			name: "arrays",
			description: "Protect against ArrayBuffer exploitation",
			description2: [],
			options: [
				{
					ui_elem: "input-checkbox",
					name: "mapping",
					description: "Use random mapping of array indexing to memory.",
					data_type: "Boolean",
					default: false,
				},
			],
			wrappers: [
				"window.DataView",
				"window.Uint8Array",
				"window.Int8Array",
				"window.Uint8ClampedArray",
				"window.Int16Array",
				"window.Uint16Array",
				"window.Int32Array",
				"window.Uint32Array",
				"window.Float32Array",
				"window.Float64Array",
			],
		},
		{
			name: "shared_array",
			description: "Protect against SharedArrayBuffer exploitation:",
			description2: [],
			options: [
				{
					ui_elem: "input-radio",
					name: "approach",
					data_type: "Boolean",
					options: [
						{
							value: "block",
							description: "Block SharedArrayBuffer.",
							default: true,
						},
						{
							value: "polyfill",
							description: "Randomly slow messages to prevent high resolution timers.",
							default: false,
						},
					],
				},
			],
			wrappers: [
				// SHARED
				"window.SharedArrayBuffer"
			],
		},
		{
			name: "webworker",
			description: "Protect against WebWorker exploitation",
			description2: [],
			options: [
				{
					ui_elem: "input-radio",
					name: "approach",
					data_type: "Boolean",
					options: [
						{
							value: "polyfill",
							description: "Remove real parallelism, use WebWorker polyfill.",
							default: true,
						},
						{
							value: "slow",
							description: "Randomly slow messages to prevent high resolution timers.",
							default: false,
						},
					],
				},
			],
			wrappers: [
				"window.Worker",
			],
		},
		{
			name: "geolocation",
			description: "Geolocation API wrapping",
			description2: [],
			options: [
				{
					description: "Location obfuscation",
					ui_elem: "select",
					name: "locationObfuscationType",
					default: 0,
					data_type: "Number",
					options: [
						{
							value: 0,
							description: "Turn location services off",
						},
						//{
						//	value: 1,
						//	description: "Use the position below",
						//},
						{
							value: 2,
							description: "Use accuracy of hundreds of meters",
						},
						{
							value: 3,
							description: "Use accuracy of kilometers",
						},
						{
							value: 4,
							description: "Use accuracy of tens of kilometers",
						},
						{
							value: 5,
							description: "Use accuracy of hundreds of kilometers",
						},
						{
							value: -1,
							description: "Provide accurate data (use when you really need to provide exact location)",
						},
					],
				},
			],
			wrappers: [
				// GPS
				"navigator.geolocation",
				"navigator.geolocation.getCurrentPosition",
				"navigator.geolocation.watchPosition",
				"navigator.geolocation.clearWatch"
			],
		},
		{
			name: "battery",
			description: "Disable Battery status API",
			description2: [],
			default: true,
			options: [],
			wrappers: [
				// BATTERY
				"navigator.getBattery",
			],
		},
		{
			name: "windowname",
			description: "Clear window.name value on the webpage loading",
			description2: [],
			default: true,
			options: [],
			wrappers: [
				// WINDOW-NAME
				"window.name",
			],
		},
	],
}

/**
 * Check if the given API is supported by the browser
 * @param String to the object which presence to check.
 */
function is_api_undefined(api) {
	let s = api.split(".");
	let last = window;
	for (p of s) {
		try {
			if (last[p] === undefined) {
				return true;
			}
		}
		catch (e) {
			// We may have encountered something like
			// TypeError: 'get startTime' called on an object that does not implement interface PerformanceEntry.
			break;
		}
		last = last[p];
	}
	return false;
}

/**
 * Returns true if all given API wrappers are unsuported.
 */
function are_all_api_unsupported(wrappers) {
	for (wrapper of wrappers) {
		if (!is_api_undefined(wrapper)) {
			return false;
		}
	}
	return true;
}

/// Automatically populate infered metadata in wrapping_groups.
wrapping_groups.groups.forEach(function (group) {
	group.id = group.name;
	group.data_type = "Boolean";
	group.ui_elem = "input-checkbox";
	wrapping_groups.empty_level[group.id] = are_all_api_unsupported(group.wrappers) ? true : Boolean(group.default);
	wrapping_groups.option_map[group.id] = group
	wrapping_groups.associated_params[group.id] = [];
	group.options.forEach((function (gid, option) {
		option.id = `${gid}_${option.name}`;
		if (option.default !== undefined) {
			wrapping_groups.empty_level[option.id] = option.default;
			wrapping_groups.associated_params[group.id].push(option.id);
		}
		wrapping_groups.option_map[option.id] = option;
		if (option.options !== undefined) {
			option.options.forEach((function (oid, choice) {
				choice.id = `${oid}_${choice.value}`;
				if (choice.default !== undefined) {
					wrapping_groups.empty_level[choice.id] = choice.default;
					wrapping_groups.associated_params[group.id].push(choice.id);
				}
				if (choice.ui_elem === undefined && option.ui_elem !== undefined) {
					choice.ui_elem = option.ui_elem;
				}
				wrapping_groups.option_map[choice.id] = choice;
			}).bind(null, option.id));
		}
	}).bind(null, group.id));
});

// levels of protection

var level_0 = {
	"level_id": "0",
	"level_text": "Built-in 0",
	"level_description": "No protection at all",
};

var level_1 = {
	"level_id": "1",
	"level_text": "Built-in 1",
	"level_description": "Minimal level of protection",
	"time_precision": true,
	"time_precision_precision": 2,
	"time_precision_randomize": false,
	"hardware": true,
	"battery": true,
	"geolocation": true,
	"geolocation_locationObfuscationType": 2,
	"windowname": true,
};

var level_2 = {
	"level_id": "2",
	"level_text": "Built-in 2",
	"level_description": "Recomended level of protection for most sites",
	"time_precision": true,
	"time_precision_precision": 1,
	"time_precision_randomize": false,
	"hardware": true,
	"battery": true,
	"htmlcanvaselement": true,
	"htmlcanvaselement_method": 1,
	"audiobuffer": true,
	"audiobuffer_method": 0,
	"webgl": true,
	"webgl_method": 1,
	"enumerateDevices": true,
	"geolocation": true,
	"geolocation_locationObfuscationType": 3,
	"windowname": true,
};

var level_3 = {
	"level_id": "3",
	"level_text": "Built-in 3",
	"level_description": "High level of protection",
	"time_precision": true,
	"time_precision_precision": 0,
	"time_precision_randomize": true,
	"hardware": true,
	"battery": true,
	"htmlcanvaselement": true,
	"htmlcanvaselement_method": 1,
	"audiobuffer": true,
	"audiobuffer_method": 0,
	"webgl": true,
	"webgl_method": 1,
	"enumerateDevices": true,
	"xhr": true,
	"xhr_behaviour_block": false,
	"xhr_behaviour_ask": true,
	"arrays": true,
	"arrays_mapping": true,
	"shared_array": true,
	"shared_array_approach_block": true,
	"shared_array_approach_polyfill": false,
	"webworker": true,
	"webworker_approach_polyfill": true,
	"webworker_approach_slow": false,
	"geolocation": true,
	"geolocation_locationObfuscationType": 0,
	"windowname": true,
};

// Level aliases
const L0 = "0";
const L1 = "1";
const L2 = "2";
const L3 = "3";

var levels = {};
var default_level = {};
var domains = {};
var wrapped_codes = {};
function init_levels() {
	levels = {
		[level_0.level_id]: level_0,
		[level_1.level_id]: level_1,
		[level_2.level_id]: level_2,
		[level_3.level_id]: level_3
	};
	default_level = Object.create(levels[L2]);
	default_level.level_text = "Default";
	domains = {};
	wrapped_codes = {};
}
init_levels();

let levels_initialised = false;
let levels_updated_callbacks = [];
function updateLevels(res) {
	init_levels();
	custom_levels = res["custom_levels"] || {};
	for (let key in custom_levels) {
		levels[key] = custom_levels[key];
	}
	for (let key in levels) {
		levels[key].wrappers = wrapping_groups.get_wrappers(levels[key]);
	}
	if (window.wrap_code !== undefined) {
		for (l in levels) {
			wrapped_codes[l] = wrap_code(levels[l].wrappers) || "";
		}
	}
	var new_default_level = res["__default__"];
	if (new_default_level === undefined || new_default_level === null || !(new_default_level in levels)) {
		default_level = Object.create(levels[L2]);
		setDefaultLevel(L2);
	}
	else {
		default_level = Object.create(levels[new_default_level]);
	}
	default_level.is_default = true;
	var new_domains = res["domains"] || {};
	for (let d in new_domains) {
		domains[d] = levels[new_domains[d].level_id];
	}
	var orig_levels_updated_callbacks = levels_updated_callbacks;
	levels_updated_callbacks = [];
	orig_levels_updated_callbacks.forEach((it) => it());
	levels_initialised = true;
}
browser.storage.sync.get(null, updateLevels);

function changedLevels(changed, area) {
	browser.storage.sync.get(null, updateLevels);
}
browser.storage.onChanged.addListener(changedLevels);

function setDefaultLevel(level) {
	browser.storage.sync.set({__default__: level});
}

function saveDomainLevels() {
	tobesaved = {};
	for (k in domains) {
		tobesaved[k] = {level_id: domains[k].level_id};
	}
	browser.storage.sync.set({domains: tobesaved});
}

function getCurrentLevelJSON(url) {
	var subDomains = extractSubDomains(wwwRemove(new URL(url).hostname));
	for (let domain of subDomains.reverse()) {
		if (domain in domains) {
			let l = domains[domain];
			return [l, wrapped_codes[l.level_id]];
		}
	}
	return [default_level, wrapped_codes[default_level.level_id]];
}
