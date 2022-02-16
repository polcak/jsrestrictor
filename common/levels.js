/** \file
 * \brief Operations and data structures connected to protection levels
 *
 *  \author Copyright (C) 2019-2021  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2021  Matus Svancar
 *	\author Copyright (C) 2022  Marek Salon
 *  \author Copyright (C) 2022  Martin Bednar
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
 * Wrapping groups
 *
 * Used to control the built-in levels and GUI (e.g. level tweaks).
 */
var wrapping_groups = {
	empty_level: { /// Automatically populated
		level_text: "",
		level_id: "",
		level_description: "",
	},
	group_map: {}, ///Automatically populated
	group_names: [], ///Automatically populated
	get_wrappers: function(level) {
		wrappers = [];
		for (group of wrapping_groups.groups) {
			if ((level[group.id] !== undefined) && level[group.id] !== 0) {
				let arg_values = group.params[level[group.id] - 1].config;
				group.wrappers.forEach((w) => wrappers.push([w, ...arg_values]));
			}
		}
		return wrappers;
	},
	groups: [
		{
			name: "time_precision",
			label: "Time precision",
			description: "Prevent attacks and fingerprinting techniques relying on precise time measurement (or make them harder).",
			description2: ["Limit the precision of high resolution time stamps (Date, Performance, events, Gamepad API, Web VR API). Timestamps provided by the Geolocation API are wrapped as well if you enable Geolocation API wrapping"],
			params: [
				{
					short: "Poor",
					description: "Round time to hundredths of a second (1.230)",
					config: [2, false],
				},
				{
					short: "Low",
					description: "Round time to tenths of a second (1.200)",
					config: [1, false],
				},
				{
					short: "High",
					description: "Randomize decimal digits with noise (1.451)",
					config: [0, true],
				},
			],
			wrappers: [
				// HRT
				"Performance.prototype.now",
				// PT2
				"PerformanceEntry.prototype",
				// ECMA
				"window.Date",
				// DOM
				"Event.prototype.timeStamp",
				// GP
				"Gamepad.prototype.timestamp",
				// VR
				"VRFrameData.prototype.timestamp",
        // SENSOR
        "Sensor.prototype.timestamp",
			],
		},
		{
			name: "htmlcanvaselement",
			label: "Localy rendered images",
			description: "Protect against canvas fingerprinting.",
			description2: [
				"Functions canvas.toDataURL(), canvas.toBlob(), CanvasRenderingContext2D.getImageData(), OffscreenCanvas.convertToBlob() return modified image data to prevent fingerprinting",
				"CanvasRenderingContext2D.isPointInStroke() and CanvasRenderingContext2D.isPointInPath() are modified to lie with probability"
			],
			params: [
				{
					short: "White lie",
					description: "Alter image data based on domain hash",
					config: [0],
				},
				{
					short: "Strict",
					description: "Replace by white image",
					config: [1],
				},
			],
			wrappers: [
				// H-C
				"CanvasRenderingContext2D.prototype.getImageData",
				"HTMLCanvasElement.prototype.toBlob",
				"HTMLCanvasElement.prototype.toDataURL",
				"OffscreenCanvas.prototype.convertToBlob",
				"CanvasRenderingContext2D.prototype.isPointInStroke",
				"CanvasRenderingContext2D.prototype.isPointInPath"
			],
		},
		{
			name: "audiobuffer",
			label: "Locally generated audio and audio card information",
			description: "Protect against audio fingerprinting, spoof details of your audio card.",
			description2: [
				"Functions AudioBuffer.getChannelData(), AudioBuffer.copyFromChannel(), AnalyserNode.getByteTimeDomainData(), AnalyserNode.getFloatTimeDomainData(), AnalyserNode.getByteFrequencyData() and AnalyserNode.getFloatFrequencyData() are modified to alter audio data based on domain key"
			],
			params: [
				{
					short: "White lie",
					description: "Add amplitude noise based on domain hash",
					config: [0],
				},
				{
					short: "Strict",
					description: "Replace by white noise based on domain hash",
					config: [1],
				},
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
			label: "Localy rendered images and graphic card information",
			description: "Protect against WEBGL fingerprinting, spoof details of your graphic card.",
			description2: [
				"Function WebGLRenderingContext.getParameter() returns modified/bottom values for certain parameters",
				"WebGLRenderingContext functions .getFramebufferAttachmentParameter(), .getActiveAttrib(), .getActiveUniform(), .getAttribLocation(), .getBufferParameter(), .getProgramParameter(), .getRenderbufferParameter(), .getShaderParameter(), .getShaderPrecisionFormat(), .getTexParameter(), .getUniformLocation(), .getVertexAttribOffset(), .getSupportedExtensions() and .getExtension() return modified values",
				"Function WebGLRenderingContext.readPixels() returns modified image data to prevent fingerprinting"
		],
			params: [
				{
					short: "White lie",
					description: "Generate random numbers/strings based on domain hash, modified canvas",
					config: [0],
				},
				{
					short: "Strict",
					description: "Return bottom values (null, empty string), empty canvas",
					config: [1],
				},
			],
			wrappers: [
				// WEBGL
				"WebGLRenderingContext.prototype.getParameter",
				"WebGL2RenderingContext.prototype.getParameter",
				"WebGLRenderingContext.prototype.getFramebufferAttachmentParameter",
				"WebGL2RenderingContext.prototype.getFramebufferAttachmentParameter",
				"WebGLRenderingContext.prototype.getActiveAttrib",
				"WebGL2RenderingContext.prototype.getActiveAttrib",
				"WebGLRenderingContext.prototype.getActiveUniform",
				"WebGL2RenderingContext.prototype.getActiveUniform",
				"WebGLRenderingContext.prototype.getAttribLocation",
				"WebGL2RenderingContext.prototype.getAttribLocation",
				"WebGLRenderingContext.prototype.getBufferParameter",
				"WebGL2RenderingContext.prototype.getBufferParameter",
				"WebGLRenderingContext.prototype.getProgramParameter",
				"WebGL2RenderingContext.prototype.getProgramParameter",
				"WebGLRenderingContext.prototype.getRenderbufferParameter",
				"WebGL2RenderingContext.prototype.getRenderbufferParameter",
				"WebGLRenderingContext.prototype.getShaderParameter",
				"WebGL2RenderingContext.prototype.getShaderParameter",
				"WebGLRenderingContext.prototype.getShaderPrecisionFormat",
				"WebGL2RenderingContext.prototype.getShaderPrecisionFormat",
				"WebGLRenderingContext.prototype.getTexParameter",
				"WebGL2RenderingContext.prototype.getTexParameter",
				"WebGLRenderingContext.prototype.getUniformLocation",
				"WebGL2RenderingContext.prototype.getUniformLocation",
				"WebGLRenderingContext.prototype.getVertexAttribOffset",
				"WebGL2RenderingContext.prototype.getVertexAttribOffset",
				"WebGLRenderingContext.prototype.getSupportedExtensions",
				"WebGL2RenderingContext.prototype.getSupportedExtensions",
				"WebGLRenderingContext.prototype.getExtension",
				"WebGL2RenderingContext.prototype.getExtension",
				"WebGLRenderingContext.prototype.readPixels",
				"WebGL2RenderingContext.prototype.readPixels"
			],
		},
		{
			name: "plugins",
			label: "Installed browser plugins",
			description: "Protect against plugin fingerprinting",
			description2: [],
			params: [
				{
					short: "White lie",
					description: "Edit current and add two fake plugins",
					config: [0],
				},
				{
					short: "Fake",
					description: "Return two fake plugins",
					config: [1],
				},
				{
					short: "Empty",
					description: "Return empty",
					config: [2],
				},
			],
			wrappers: [
				// NP
				"Navigator.prototype.plugins", // also modifies "Navigator.prototype.mimeTypes",
			],
		},
		{
			name: "enumerateDevices",
			label: "Connected cameras and microphones",
			description: "Prevent fingerprinting based on the multimedia devices connected to the computer",
			description2: [
				"Function MediaDevices.enumerateDevices() is modified to return empty or modified result"
		],
			params: [
				{
					short: "White lie",
					description: "Randomize order",
					config: [0],
				},
				{
					short: "Add fake",
					description: "Add 0-4 fake devices and randomize order",
					config: [1],
				},
				{
					short: "Empty",
					description: "Return empty",
					config: [2],
				},
			],
			wrappers: [
				// MCS
				"MediaDevices.prototype.enumerateDevices",
			],
		},
		{
			name: "hardware",
			label: "Device memory and CPU",
			description: "Spoof hardware information on the amount of RAM and CPU count.",
			description2: [
				"Getters navigator.deviceMemory and navigator.hardwareConcurrency return modified values",
			],
			params: [
				{
					short: "Low",
					description: "Return random valid value between minimum and real value",
					config: [0],
				},
				{
					short: "Medium",
					description: "Return random valid value between minimum and 8",
					config: [1],
				},
				{
					short: "High",
					description: "Return 4 for navigator.deviceMemory and 2 for navigator.hardwareConcurrency",
					config: [2],
				},
			],
			wrappers: [
				// HTML-LS
				"Navigator.prototype.hardwareConcurrency",
				// DM
				"Navigator.prototype.deviceMemory",
			],
		},
		{
			name: "xhr",
			label: "XMLHttpRequest requests (XHR)",
			description: "Filter reliable XHR requests to server.",
			description2: ["Note that these requests are broadly employed for benign purposes and also note that Fetch, SSE, WebRTC, and WebSockets APIs are not blocked. All provide similar and some even better means of communication with server. For practical usage, we recommend activating Fingerprint Detector instead of XHR wrappers. JShelter keeps the wrapper as it is useful for some users mainly for experimental reasons."],
			params: [
				{
					short: "Ask",
					description: "Ask before executing an XHR request",
					config: [false, true],
				},
				{
					short: "Block",
					description: "Block all XMLHttpRequests",
					config: [true, false],
				},
			],
			wrappers: [
				// AJAX
				"XMLHttpRequest.prototype.open",
				"XMLHttpRequest.prototype.send",
			],
		},
		{
			name: "arrays",
			label: "ArrayBuffer",
			description: "Protect against ArrayBuffer exploitation, for example, to prevent side channel attacks on memory layout (or make them harder).",
			description2: [],
			params: [
				{
					short: "Shift",
					description: "Shift indexes to make memory page boundaries detection harder",
					config: [false],
				},
				{
					short: "Randomize",
					description: "Use random mapping of array indexing to memory",
					config: [true],
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
			label: "SharedArrayBuffer",
			description: "Protect against SharedArrayBuffer exploitation, for example, to prevent side channel attacks on memory layout (or make them harder).",
			description2: [],
			params: [
				{
					short: "Medium",
					description: "Randomly slow messages to prevent high resolution timers",
					config: [false],
				},
				{
					short: "Strict",
					description: "Block SharedArrayBuffer",
					config: [true],
				},
			],
			wrappers: [
				// SHARED
				"window.SharedArrayBuffer"
			],
		},
		{
			name: "webworker",
			label: "WebWorker",
			description: "Protect against WebWorker exploitation, for example, to provide high resolution timers",
			description2: [],
			params: [
				{
					short: "Medium",
					description: "Randomly slow messages to prevent high resolution timers",
					config: [false],
				},
				{
					short: "Strict",
					description: "Remove real parallelism, use WebWorker polyfill",
					config: [true],
				},
			],
			wrappers: [
				"window.Worker",
			],
		},
		{
			name: "geolocation",
			label: "Physical location (geolocation)",
			description: "Limit the information on real-world position provided by Geolocation API.",
			description2: [],
			params: [
				{
					short: "Poor",
					description: "Provide accurate data (use when you really need to provide exact location and you want to protect geolocation timestamps)",
					config: [-1],
				},
				{
					short: "Very low",
					description: "Use accuracy of hundreds of meters",
					config: [2],
				},
				{
					short: "Low",
					description: "Use accuracy of kilometers",
					config: [3],
				},
				{
					short: "Medium",
					description: "Use accuracy of tens of kilometers",
					config: [4],
				},
				{
					short: "High",
					description: "Use accuracy of hundreds of kilometers",
					config: [5],
				},
				{
					short: "Strict",
					description: "Turn location services off",
					config: [0],
				},
			],
			wrappers: [
				// GPS
				"Navigator.prototype.geolocation",
				"window.Geolocation",
				"window.GeolocationCoordinates",
				"window.GeolocationPosition",
				"window.GeolocationPositionError",
				"Geolocation.prototype.getCurrentPosition",
				"Geolocation.prototype.watchPosition",
				"Geolocation.prototype.clearWatch"
			],
		},
    {
			name: "physical_environment",
			label: "Physical environement sensors",
			description: "Limit the information provided by physical environment sensors like Magnetometer or Accelerometer.",
			description2: [],
			params: [
				{
					short: "High",
					description: "Emulate stationary device",
					config: [true],
				},
			],
			wrappers: [
        // GENERIC SENSOR API Sensors

				// Magnetometer
				"Magnetometer.prototype.x",
        "Magnetometer.prototype.y",
        "Magnetometer.prototype.z",

        // Accelerometer, LinearAccelerationSensor, and GravitySensor
        "Accelerometer.prototype.x",
        "Accelerometer.prototype.y",
        "Accelerometer.prototype.z",

        // Gyroscope
        "Gyroscope.prototype.x",
        "Gyroscope.prototype.y",
        "Gyroscope.prototype.z",

        // AbsoluteOrientationSensor and RelativeOrientationSensor
        "OrientationSensor.prototype.quaternion"
			],
		},
		{
			name: "gamepads",
			label: "Gamepads",
			description: "Prevent websites from accessing and learning information on local gamepads.",
			description2: [],
			params: [
				{
					short: "Strict",
					description: "Hide all gamepads",
					config: [true],
				},
			],
			wrappers: [
				// GAMEPAD
				"Navigator.prototype.getGamepads",
			],
		},
		{
			name: "vr",
			label: "Virtual and augmented reality devices",
			description: "Prevent websites from accessing and learning information on local virtual and augmented reality displays.",
			description2: [],
			params: [
				{
					short: "Strict",
					description: "Hide all devices",
					config: [],
				},
			],
			wrappers: [
				// VR
				"Navigator.prototype.activeVRDisplays",
				// XR
				"Navigator.prototype.xr",
			],
		},
		{
			name: "analytics",
			label: "Unreliable transfers to server (beacons)",
			description: "Prevent unreliable transfers to server (beacons).",
			description2: ["Such transfers are typically misused for analytics but occassionally may be used by e-shops or other pages.", "Prevent sending information through Beacon API."],
			params: [
				{
					short: "Disable",
					description: "The wrapper performs no action",
					config: [],
				},
			],
			wrappers: [
				// BEACON
				"Navigator.prototype.sendBeacon",
			],
		},
		{
			name: "battery",
			label: "Hardware battery",
			description: "Disable Battery status API",
			description2: [],
			params: [
				{
					short: "Disable",
					description: "Disable the API",
					config: [],
				},
			],
			wrappers: [
				// BATTERY
				"Navigator.prototype.getBattery",
				"window.BatteryManager",
			],
		},
		{
			name: "windowname",
			label: "Persistent identifier of the browser tab",
			description: "Clear window.name value on the webpage loading.",
			description2: ["This API might be occasionally used for benign purposes.", "This API provides a possibility to detect cross-site browsing in one tab and broser session."],
			params: [
				{
					short: "Strict",
					description: "Clear during page reload",
					config: [],
				},
			],
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
	if (!are_all_api_unsupported(group.wrappers)) {
		wrapping_groups.group_names.push(group.name);
		wrapping_groups.empty_level[group.id] = 0;
	}
	wrapping_groups.group_map[group.id] = group
});

// *****************************************************************************
// levels of protection

// Level aliases
const L0 = "0";
const L1 = "1";
const L2 = "2";
const L3 = "3";

/// Built-in levels
var level_0 = {
	"builtin": true,
	"level_id": L0,
	"level_text": "Turn JavaScript shield off",
	"level_description": "No protection at all",
};

var level_1 = {
	"builtin": true,
	"level_id": L1,
	"level_text": "Minimal",
	"level_description": "Minimal level of protection",
	"time_precision": 1,
	"plugins": 1,
	"hardware": 1,
	"geolocation": 2,
  "physical_environment": 1,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
};

var level_2 = {
	"builtin": true,
	"level_id": L2,
	"level_text": "Recommended",
	"level_description": "Recommended level of protection for most sites",
	"time_precision": 2,
	"htmlcanvaselement": 1,
	"audiobuffer": 1,
	"webgl": 1,
	"plugins": 2,
	"enumerateDevices": 2,
	"hardware": 1,
	"geolocation": 3,
  "physical_environment": 1,
	"gamepads": 1,
	"vr": 1,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
};

var level_3 = {
	"builtin": true,
	"level_id": L3,
	"level_text": "High",
	"level_description": "High level of protection",
	"time_precision": 3,
	"htmlcanvaselement": 2,
	"audiobuffer": 2,
	"webgl": 2,
	"plugins": 3,
	"enumerateDevices": 3,
	"hardware": 3,
	"xhr": 1,
	"arrays": 2,
	"shared_array": 2,
	"webworker": 2,
	"geolocation": 6,
  "physical_environment": 1,
	"gamepads": 1,
	"vr": 1,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
};

const BUILTIN_LEVEL_NAMES = [L0, L1, L2, L3];

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
			wrapped_codes[l] = wrap_code(levels[l]) || "";
		}
	}
	var new_default_level = res["__default__"];
	if (new_default_level === undefined || new_default_level === null || !(new_default_level in levels)) {
		default_level = Object.assign({}, levels[L2]);
		setDefaultLevel(L2);
	}
	else {
		default_level = Object.assign({}, levels[new_default_level]);
	}
	default_level.is_default = true;
	var new_domains = res["domains"] || {};
	for (let [d, {level_id, tweaks, restore, restore_tweaks}] of Object.entries(new_domains)) {
		let level = levels[level_id];
		if (level === undefined) {
			domains[d] = default_level;
		}
		else {
			if (tweaks) {
				// this domain has "tweaked" wrapper groups from other levels, let's merge them
				level = Object.assign({}, level, tweaks);
				level.tweaks = tweaks;
				delete level.wrappers; // we will lazy instantiate them on demand in getCurrentLevelJSON()
			}
			if (restore) {
				level.restore = restore;
				if (restore_tweaks) {
					level.restore_tweaks = restore_tweaks;
				}
			}
		}
		domains[d] = level;
	}
	var orig_levels_updated_callbacks = levels_updated_callbacks;
	levels_updated_callbacks = [];
	orig_levels_updated_callbacks.forEach((it) => it());
	levels_initialised = true;
}
browser.storage.sync.get(null).then(updateLevels);

function changedLevels(changed, area) {
	browser.storage.sync.get(null).then(updateLevels);
}
browser.storage.onChanged.addListener(changedLevels);

function setDefaultLevel(level) {
	browser.storage.sync.set({__default__: level});
}

function saveDomainLevels() {
	tobesaved = {};
	for (k in domains) {
		let {level_id, tweaks, restore, restore_tweaks} = domains[k];
		if (k[k.length - 1] === ".") {
			k = k.substring(0, k.length-1);
		}
		if (tweaks) {
			for (let [group, param] of Object.entries(tweaks)) {
				if (param === (levels[level_id][group] || 0)) {
					delete tweaks[group]; // remove redundant entries
				}
			}
			if (Object.keys(tweaks).length === 0) {
				tweaks = undefined;
			}
		}
		tobesaved[k] = tweaks ? {level_id, tweaks} : {level_id};
		if (restore) {
			tobesaved[k].restore = restore;
			if (restore_tweaks) {
				tobesaved[k].restore_tweaks = restore_tweaks;
			}
		}
	}
	browser.storage.sync.set({domains: tobesaved});
}

function getCurrentLevelJSON(url) {
	var subDomains = extractSubDomains(wwwRemove(new URL(url).hostname));
	for (let domain of subDomains.reverse()) {
		if (domain in domains) {
			let l = domains[domain];
			if (l.tweaks && !("wrapper_code" in l)) {
			  l.wrappers = wrapping_groups.get_wrappers(l);
				l.wrapped_code = wrap_code(l) || "";
			}
			return [l, l.tweaks ? l.wrapped_code : wrapped_codes[l.level_id]];
		}
	}
	return [default_level, wrapped_codes[default_level.level_id]];
}

function getTweaksForLevel(level_id, tweaks_obj) {
	tweaks_obj = tweaks_obj || {}; // Make sure that tweaks_obj is an object
	let working = Object.assign({}, wrapping_groups.empty_level, levels[level_id], tweaks_obj);
	Object.keys(working).forEach(function(key) {
		if (!wrapping_groups.group_names.includes(key)) {
			delete working[key];
		}
	});
	return working;
}
