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
	wrapper_map: {}, ///Automatically populated
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
			label: browser.i18n.getMessage("timePrecision"),
			description: browser.i18n.getMessage("timePrecision"),
			description2: [browser.i18n.getMessage("timePrecisionDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("poor"),
					description: browser.i18n.getMessage("poorDescription"),
					config: [2, false],
				},
				{
					short: browser.i18n.getMessage("low"),
					description: browser.i18n.getMessage("lowDescription"),
					config: [1, false],
				},
				{
					short: browser.i18n.getMessage("high"),
					description: browser.i18n.getMessage("highDescription"),
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
			label: browser.i18n.getMessage("locallyRenderedImages"),
			description: browser.i18n.getMessage("locallyRenderedImagesDescription"),
			description2: [
				browser.i18n.getMessage("locallyRenderedImagesDescription2"),
				browser.i18n.getMessage("locallyRenderedImagesDescription22")
			],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription"),
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
				"CanvasRenderingContext2D.prototype.isPointInPath",
				"WebGLRenderingContext.prototype.readPixels",
				"WebGL2RenderingContext.prototype.readPixels",
			],
		},
		{
			name: "audiobuffer",
			label: browser.i18n.getMessage("locallyGeneratedAudio"),
			description: browser.i18n.getMessage("locallyGeneratedAudioDescription"),
			description2: [
				browser.i18n.getMessage("locallyGeneratedAudioDescription2"),
			],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription2"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription2"),
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
			label: browser.i18n.getMessage("graphicCardInformation"),
			description: browser.i18n.getMessage("graphicCardInformationDescription"),
			description2: [
				browser.i18n.getMessage("graphicCardInformationDescription2"),
				browser.i18n.getMessage("graphicCardInformationDescription3"),
		],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription3"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription3"),
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
			],
		},
		{
			name: "plugins",
			label: browser.i18n.getMessage("installedBrowserPlugins"),
			description: browser.i18n.getMessage("installedBrowserPluginsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription4"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("fake"),
					description: browser.i18n.getMessage("fakeDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("empty"),
					description: browser.i18n.getMessage("emptyDescription"),
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
			label: browser.i18n.getMessage("connectedCamerasAndMicrophones"),
			description: browser.i18n.getMessage("connectedCamerasAndMicrophonesDescription"),
			description2: [
				browser.i18n.getMessage("connectedCamerasAndMicrophonesDescription2"),
		],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription5"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("addFake"),
					description: browser.i18n.getMessage("addFakeDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("empty"),
					description: browser.i18n.getMessage("emptyDescription"),
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
			label: browser.i18n.getMessage("deviceMemoryAndCPU"),
			description: browser.i18n.getMessage("deviceMemoryAndCPUDescription"),
			description2: [
				browser.i18n.getMessage("deviceMemoryAndCPUDescription2"),
			],
			params: [
				{
					short: browser.i18n.getMessage("low"),
					description: browser.i18n.getMessage("lowDescription2"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("medium"),
					description: browser.i18n.getMessage("mediumDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("high"),
					description: browser.i18n.getMessage("highDescription2"),
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
			name: "net",
			label: browser.i18n.getMessage("networkConditions"),
			description: browser.i18n.getMessage("networkConditionsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription4"),
					config: [0],
				},
			],
			wrappers: [
				// NET
				"Navigator.prototype.connection",
				"window.NetworkInformation",
			],
		},
		{
			name: "xhr",
			label: browser.i18n.getMessage("xMLHttpRequestRequests"),
			description: browser.i18n.getMessage("xMLHttpRequestRequestsDescription"),
			description2: [browser.i18n.getMessage("xMLHttpRequestRequestsDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("ask"),
					description: browser.i18n.getMessage("askDescription"),
					config: [false, true],
				},
				{
					short: browser.i18n.getMessage("block"),
					description: browser.i18n.getMessage("blockDescription"),
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
			description: browser.i18n.getMessage("ArrayBufferDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("shift"),
					description: browser.i18n.getMessage("shiftDescription"),
					config: [false],
				},
				{
					short: browser.i18n.getMessage("randomize"),
					description: browser.i18n.getMessage("randomizeDescription"),
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
				'window.BigInt64Array',
				'window.BigUint64Array',
			],
		},
		{
			name: "shared_array",
			label: "SharedArrayBuffer",
			description: browser.i18n.getMessage("SharedArrayBufferDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("medium"),
					description: browser.i18n.getMessage("mediumDescription2"),
					config: [false],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription5"),
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
			description: browser.i18n.getMessage("webWorkerDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("medium"),
					description: browser.i18n.getMessage("mediumDescription2"),
					config: [false],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription6"),
					config: [true],
				},
			],
			wrappers: [
				"window.Worker",
			],
		},
		{
			name: "geolocation",
			label: browser.i18n.getMessage("physicalLocationGeolocation"),
			description: browser.i18n.getMessage("physicalLocationGeolocationDescription"),
			description2: [browser.i18n.getMessage("physicalLocationGeolocationDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("timestampOnly"),
					description: browser.i18n.getMessage("timestampOnlyDescription"),
					config: [-1],
				},
				{
					short: browser.i18n.getMessage("village"),
					description: browser.i18n.getMessage("villageDescription"),
					config: [2],
				},
				{
					short: browser.i18n.getMessage("town"),
					description: browser.i18n.getMessage("townDescription"),
					config: [3],
				},
				{
					short: browser.i18n.getMessage("region"),
					description: browser.i18n.getMessage("regionDescription"),
					config: [4],
				},
				{
					short: browser.i18n.getMessage("longDistance"),
					description: browser.i18n.getMessage("longDistanceDescription"),
					config: [5],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription7"),
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
			label: browser.i18n.getMessage("physicalEnvironmentSensors"),
			description: browser.i18n.getMessage("physicalEnvironmentSensorsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("high"),
					description: browser.i18n.getMessage("highDescription3"),
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
        "OrientationSensor.prototype.quaternion",

        // AmbientLightSensor
        "AmbientLightSensor.prototype.illuminance"
			],
		},
		{
			name: "useridle",
			label: browser.i18n.getMessage("userIdleDetection"),
			description: browser.i18n.getMessage("userIdleDetectionDescription"),
			description2: [browser.i18n.getMessage("userIdleDetectionDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("confuse"),
					description: browser.i18n.getMessage("confuseDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("denyAccess"),
					description: browser.i18n.getMessage("denyAccessDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("remove"),
					description: browser.i18n.getMessage("removeDescription"),
					config: [2],
				},
			],
			wrappers: [
				// COOP-SCHEDULING
				"window.IdleDetector",
				"IdleDetector.requestPermission",
				"IdleDetector.prototype.screenState",
				"IdleDetector.prototype.userState",
			],
		},
		{
			name: "coopschedule",
			label: browser.i18n.getMessage("idlePeriodTaskScheduling"),
			description: browser.i18n.getMessage("idlePeriodTaskSchedulingDescription"),
			description2: [browser.i18n.getMessage("idlePeriodTaskSchedulingDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription6"),
					config: [],
				},
			],
			wrappers: [
				// COOP-SCHEDULING
				"IdleDeadline.prototype.didTimeout",
				"IdleDeadline.prototype.timeRemaining",
			],
		},
		{
			name: "gamepads",
			label: browser.i18n.getMessage("gamepads"),
			description: browser.i18n.getMessage("gamepadsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription8"),
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
			label: browser.i18n.getMessage("virtualAndAugmentedRealityDevices"),
			description: browser.i18n.getMessage("virtualAndAugmentedRealityDevicesDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription9"),
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
			name: "playback",
			label: browser.i18n.getMessage("multimediaPlayback"),
			description: browser.i18n.getMessage("multimediaPlaybackDescription"),
			description2: [browser.i18n.getMessage("multimediaPlaybackDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("littleLies"),
					description: browser.i18n.getMessage("littleLiesDescription7"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription10"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("silence"),
					description: browser.i18n.getMessage("silenceDescription"),
					config: [2],
				},
			],
			wrappers: [
				// EME
				"Navigator.prototype.requestMediaKeySystemAccess",
				// MEDIA-CAPABILITIES
				"MediaCapabilities.prototype.encodingInfo",
				"MediaCapabilities.prototype.decodingInfo",
				// HTML5
				"HTMLMediaElement.prototype.canPlayType",
			],
		},
		{
			name: "analytics",
			label: browser.i18n.getMessage("unreliableTransfersToServerBeacons"),
			description: browser.i18n.getMessage("unreliableTransfersToServerBeaconsDescription"),
			description2: [browser.i18n.getMessage("unreliableTransfersToServerBeaconsDescription2"), browser.i18n.getMessage("unreliableTransfersToServerBeaconsDescription3")],
			params: [
				{
					short: browser.i18n.getMessage("disabled"),
					description: browser.i18n.getMessage("disabledDescription"),
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
			label: browser.i18n.getMessage("hardwareBattery"),
			description: browser.i18n.getMessage("hardwareBatteryDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("disabled"),
					description: browser.i18n.getMessage("disabledDescription2"),
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
			label: browser.i18n.getMessage("persistentIdentifierOfTheBrowserTab"),
			description: browser.i18n.getMessage("persistentIdentifierOfTheBrowserTabDescription"),
			description2: [browser.i18n.getMessage("persistentIdentifierOfTheBrowserTabDescription2"), browser.i18n.getMessage("persistentIdentifierOfTheBrowserTabDescription3")],
			params: [
				{
					short: browser.i18n.getMessage("strict"),
					description: browser.i18n.getMessage("strictDescription11"),
					config: [],
				},
			],
			wrappers: [
				// WINDOW-NAME
				"window.name",
			],
		},
		{
			name: "nfc",
			label: browser.i18n.getMessage("nearFieldCommunicationNFC"),
			description: browser.i18n.getMessage("nearFieldCommunicationNFCDescription"),
			description2: [browser.i18n.getMessage("nearFieldCommunicationNFCDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("disabled"),
					description: browser.i18n.getMessage("disabledDescription2"),
					config: [],
				},
			],
			wrappers: [
				// BATTERY
				"window.NDEFMessage",
				"window.NDEFReader",
				"window.NDEFRecord",
			],
		},
	],
}
var modify_wrapping_groups = modify_wrapping_groups || (() => null); // Give other scripts the possibility to modify the wrapping_groups objects
modify_wrapping_groups();

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
	for (wrapper_name of group.wrappers) {
		wrapping_groups.wrapper_map[wrapper_name] = group.name;
	}
});

// *****************************************************************************
// levels of protection

// Level aliases
const L0 = "0";
const L1 = "1";
const L2 = "2";
const L3 = "3";
const L_EXPERIMENTAL = "Experiment"; // Use a long ID so that it is not in conflict with pre0.7 user-defined levels

/// Built-in levels
var level_0 = {
	"builtin": true,
	"level_id": L0,
	"level_text": browser.i18n.getMessage("turnJavaScriptShieldOff"),
	"level_description": browser.i18n.getMessage("javaScriptAPIsAreNotWrapped"),
};

var level_1 = {
	"builtin": true,
	"level_id": L1,
	"level_text": browser.i18n.getMessage("turnFingerprintingProtectionOff"),
	"level_description": browser.i18n.getMessage("applySecurityCountermeasures"),
	"time_precision": 3,
	"net": 1,
	"webworker": 2,
	"geolocation": 3,
  "physical_environment": 1,
	"useridle": 1,
	"coopschedule": 1,
	"gamepads": 1,
	"vr": 1,
	"analytics": 1,
	"battery": 1,
	"nfc": 1,
};

var level_2 = {
	"builtin": true,
	"level_id": L2,
	"level_text": browser.i18n.getMessage("recommended"),
	"level_description": browser.i18n.getMessage("makeTheBrowserAppearDifferently"),
	"time_precision": 3,
	"htmlcanvaselement": 1,
	"audiobuffer": 1,
	"webgl": 1,
	"plugins": 2,
	"enumerateDevices": 2,
	"hardware": 1,
	"net": 1,
	"webworker": 2,
	"geolocation": 3,
  "physical_environment": 1,
	"useridle": 2,
	"coopschedule": 1,
	"gamepads": 1,
	"vr": 1,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
	"nfc": 1,
};

var level_3 = {
	"builtin": true,
	"level_id": L3,
	"level_text": browser.i18n.getMessage("strict"),
	"level_description": browser.i18n.getMessage("enableAllNonexperimentalProtection"),
	"time_precision": 3,
	"htmlcanvaselement": 2,
	"audiobuffer": 2,
	"webgl": 2,
	"plugins": 3,
	"enumerateDevices": 3,
	"hardware": 3,
	"net": 1,
	"webworker": 2,
	"geolocation": 6,
  "physical_environment": 1,
	"useridle": 3,
	"coopschedule": 1,
	"gamepads": 1,
	"vr": 1,
	"playback": 2,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
	"nfc": 1,
};

var level_experimental = {
	"builtin": true,
	"level_id": L_EXPERIMENTAL,
	"level_text": browser.i18n.getMessage("experimental"),
	"level_description": browser.i18n.getMessage("strictLevelProtections"),
	"time_precision": 3,
	"htmlcanvaselement": 2,
	"audiobuffer": 2,
	"webgl": 2,
	"plugins": 3,
	"enumerateDevices": 3,
	"hardware": 3,
	"net": 1,
	"xhr": 1,
	"arrays": 2,
	"shared_array": 2,
	"webworker": 2,
	"geolocation": 6,
  "physical_environment": 1,
	"useridle": 3,
	"coopschedule": 1,
	"gamepads": 1,
	"vr": 1,
	"playback": 3,
	"analytics": 1,
	"battery": 1,
	"windowname": 1,
	"nfc": 1,
};

var modify_builtin_levels = modify_builtin_levels || (() => null); // Give other scripts the possibility to modify builtin levels
modify_builtin_levels();

var levels = {};
var default_level = {};
var domains = {};
var wrapped_codes = {};
function init_levels() {
	levels = {
		[level_0.level_id]: level_0,
		[level_1.level_id]: level_1,
		[level_2.level_id]: level_2,
		[level_3.level_id]: level_3,
		[level_experimental.level_id]: level_experimental
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
	var subDomains = extractSubDomains(getEffectiveDomain(url));
	for (let domain of subDomains.reverse()) {
		if (domain in domains) {
			let l = domains[domain];
			if (l.tweaks && !("wrapper_code" in l)) {
				l.wrappers = wrapping_groups.get_wrappers(l);
				l.wrapped_code = wrap_code(l.wrappers) || "";
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
