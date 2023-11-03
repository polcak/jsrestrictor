/** \file
 * \brief Operations and data structures connected to protection levels
 *
 *  \author Copyright (C) 2019-2021  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2021  Matus Svancar
 *	\author Copyright (C) 2022  Marek Salon
 *  \author Copyright (C) 2022  Martin Bednar
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
			label: browser.i18n.getMessage("jssgroupTimePrecision"),
			description: browser.i18n.getMessage("jssgroupTimePrecision"),
			description2: [browser.i18n.getMessage("jssgroupTimePrecisionDescription2", browser.i18n.getMessage("jssgroupPhysicalLocationGeolocation"))],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupPoor"),
					description: browser.i18n.getMessage("jssgroupTimePoorDescription"),
					config: [2, false],
				},
				{
					short: browser.i18n.getMessage("jssgroupLow"),
					description: browser.i18n.getMessage("jssgroupTimeLowDescription"),
					config: [1, false],
				},
				{
					short: browser.i18n.getMessage("jssgroupHigh"),
					description: browser.i18n.getMessage("jssgroupTimeHighDescription"),
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
			label: browser.i18n.getMessage("jssgroupLocallyRenderedImages"),
			description: browser.i18n.getMessage("jssgroupLocallyRenderedImagesDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupCanvasLocallyRenderedImagesDescription2"),
				browser.i18n.getMessage("jssgroupCanvasLocallyRenderedImagesDescription3")
			],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupLocallyRenderedImagesLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupLocallyRenderedImagesStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupLocallyGeneratedAudio"),
			description: browser.i18n.getMessage("jssgroupLocallyGeneratedAudioDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupLocallyGeneratedAudioDescription2"),
			],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupLocallyGeneratedAudioLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupLocallyGeneratedAudioStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupGraphicCardInformation"),
			description: browser.i18n.getMessage("jssgroupGraphicCardInformationDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupGraphicCardInformationDescription2"),
				browser.i18n.getMessage("jssgroupGraphicCardInformationDescription3"),
		],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupGraphicCardInformationLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupGraphicCardInformationStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupInstalledBrowserPlugins"),
			description: browser.i18n.getMessage("jssgroupInstalledBrowserPluginsDescription"),
			description2: [browser.i18n.getMessage("jssgroupInstalledBrowserPluginsDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupInstalledBrowserPluginsLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupFake"),
					description: browser.i18n.getMessage("jssgroupInstalledBrowserPluginsFakeDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupInstalledBrowserPluginsStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophones"),
			description: browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophonesDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophonesDescription2"),
		],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophonesLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupAddFake"),
					description: browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophonesAddFakeDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupConnectedCamerasAndMicrophonesStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupHardware"),
			description: browser.i18n.getMessage("jssgroupHardwareDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupHardwareDescription2"),
			],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLow"),
					description: browser.i18n.getMessage("jssgroupHardwareLowDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupMedium"),
					description: browser.i18n.getMessage("jssgroupHardwareMediumDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupHigh"),
					description: browser.i18n.getMessage("jssgroupHardwareHighDescription"),
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
			label: browser.i18n.getMessage("jssgroupNetworkConditions"),
			description: browser.i18n.getMessage("jssgroupNetworkConditionsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupNetworkConditionsRemoveDescription"),
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
			label: browser.i18n.getMessage("jssgroupXMLHttpRequestRequests"),
			description: browser.i18n.getMessage("jssgroupXMLHttpRequestRequestsDescription"),
			description2: [browser.i18n.getMessage("jssgroupXMLHttpRequestRequestsDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupAsk"),
					description: browser.i18n.getMessage("jssgroupXMLHttpRequestRequestsAskDescription"),
					config: [false, true],
				},
				{
					short: browser.i18n.getMessage("jssgroupBlock"),
					description: browser.i18n.getMessage("jssgroupXMLHttpRequestRequestsBlockDescription"),
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
			label: browser.i18n.getMessage("jssgroupArrays"),
			description: browser.i18n.getMessage("jssgroupArraysDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupArraysShift"),
					description: browser.i18n.getMessage("jssgroupArraysShiftDescription"),
					config: [false],
				},
				{
					short: browser.i18n.getMessage("jssgroupArraysRandomize"),
					description: browser.i18n.getMessage("jssgroupArraysRandomizeDescription"),
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
			label: browser.i18n.getMessage("jssgroupSharedArraysBuffer"),
			description: browser.i18n.getMessage("jssgroupSharedArraysBufferDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupMedium"),
					description: browser.i18n.getMessage("jssgroupSharedArraysBufferMediumDescription"),
					config: [false],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupSharedArraysBufferStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupWebWorker"),
			description: browser.i18n.getMessage("jssgroupWebWorkerDescription"),
			description2: [browser.i18n.getMessage("jssgroupWebWorkerDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLow"),
					description: browser.i18n.getMessage("jssgroupWebWorkerLowDescription"),
					config: [false, false],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupWebWorkerStrictDescription"),
					config: [true, false],
				},
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupWebWorkerRemoveDescription"),
					config: [false, true],
				},
			],
			wrappers: [
				"window.Worker",
			],
		},
		{
			name: "geolocation",
			label: browser.i18n.getMessage("jssgroupPhysicalLocationGeolocation"),
			description: browser.i18n.getMessage("jssgroupPhysicalLocationGeolocationDescription"),
			description2: [browser.i18n.getMessage("jssgroupPhysicalLocationGeolocationDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupGeolocationTimestampOnly"),
					description: browser.i18n.getMessage("jssgroupGeolocationTimestampOnlyDescription", browser.i18n.getMessage("jssgroupTimePrecision")),
					config: [-1],
				},
				{
					short: browser.i18n.getMessage("jssgroupGeolocationVillage"),
					description: browser.i18n.getMessage("jssgroupGeolocationVillageDescription"),
					config: [2],
				},
				{
					short: browser.i18n.getMessage("jssgroupGeolocationTown"),
					description: browser.i18n.getMessage("jssgroupGeolocationTownDescription"),
					config: [3],
				},
				{
					short: browser.i18n.getMessage("jssgroupGeolocationRegion"),
					description: browser.i18n.getMessage("jssgroupGeolocationRegionDescription"),
					config: [4],
				},
				{
					short: browser.i18n.getMessage("jssgroupGeolocationLongDistance"),
					description: browser.i18n.getMessage("jssgroupGeolocationLongDistanceDescription"),
					config: [5],
				},
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupGeolocationRemoveDescription"),
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
			label: browser.i18n.getMessage("jssgroupPhysicalEnvironmentSensors"),
			description: browser.i18n.getMessage("jssgroupPhysicalEnvironmentSensorsDescription"),
			description2: [browser.i18n.getMessage("jssgroupPhysicalEnvironmentSensorsDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupHigh"),
					description: browser.i18n.getMessage("jssgroupPhysicalEnvironmentSensorsHighDescription"),
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
			label: browser.i18n.getMessage("jssgroupUserIdleDetection"),
			description: browser.i18n.getMessage("jssgroupUserIdleDetectionDescription"),
			description2: [browser.i18n.getMessage("jssgroupUserIdleDetectionDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupConfuse"),
					description: browser.i18n.getMessage("jssgroupConfuseDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupBlock"),
					description: browser.i18n.getMessage("jssgroupBlockDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupRemoveDescription"),
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
			label: browser.i18n.getMessage("jssgroupCoopschedule"),
			description: browser.i18n.getMessage("jssgroupCoopscheduleDescription"),
			description2: [browser.i18n.getMessage("jssgroupCoopscheduleDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupConfuse"),
					description: browser.i18n.getMessage("jssgroupCoopscheduleConfuseDescription"),
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
			label: browser.i18n.getMessage("jssgroupGamepads"),
			description: browser.i18n.getMessage("jssgroupGamepadsDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupGamepadsStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupVirtualAndAugmentedRealityDevices"),
			description: browser.i18n.getMessage("jssgroupVirtualAndAugmentedRealityDevicesDescription"),
			description2: [browser.i18n.getMessage("jssgroupVirtualAndAugmentedRealityDevicesDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupVirtualAndAugmentedRealityDevicesStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupMultimediaPlayback"),
			description: browser.i18n.getMessage("jssgroupMultimediaPlaybackDescription"),
			description2: [browser.i18n.getMessage("jssgroupMultimediaPlaybackDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupLittleLies"),
					description: browser.i18n.getMessage("jssgroupMultimediaPlaybackLittleLiesDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupMultimediaPlaybackStrictDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupBlock"),
					description: browser.i18n.getMessage("jssgroupMultimediaPlaybackBlockDescription"),
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
			label: browser.i18n.getMessage("jssgroupUnreliableTransfersToServerBeacons"),
			description: browser.i18n.getMessage("jssgroupUnreliableTransfersToServerBeaconsDescription"),
			description2: [browser.i18n.getMessage("jssgroupUnreliableTransfersToServerBeaconsDescription2"), browser.i18n.getMessage("jssgroupUnreliableTransfersToServerBeaconsDescription3")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupBlock"),
					description: browser.i18n.getMessage("jssgroupUnreliableTransfersToServerBeaconsBlockDescription"),
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
			label: browser.i18n.getMessage("jssgroupHardwareBattery"),
			description: browser.i18n.getMessage("jssgroupHardwareBatteryDescription"),
			description2: [],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupHardwareBatteryRemoveDescription"),
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
			label: browser.i18n.getMessage("jssgroupPersistentIdentifierOfTheBrowserTab"),
			description: browser.i18n.getMessage("jssgroupPersistentIdentifierOfTheBrowserTabDescription"),
			description2: [browser.i18n.getMessage("jssgroupPersistentIdentifierOfTheBrowserTabDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupStrict"),
					description: browser.i18n.getMessage("jssgroupPersistentIdentifierOfTheBrowserTabStrictDescription"),
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
			label: browser.i18n.getMessage("jssgroupNFC"),
			description: browser.i18n.getMessage("jssgroupNFCDescription"),
			description2: [browser.i18n.getMessage("jssgroupNFCDescription2")],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupRemove"),
					description: browser.i18n.getMessage("jssgroupNFCRemoveDescription"),
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
		{
			name: "wasm",
			label: browser.i18n.getMessage("jssgroupWASM"),
			description: browser.i18n.getMessage("jssgroupWASMDescription"),
			description2: [
				browser.i18n.getMessage("jssgroupWASMDescription2", [browser.i18n.getMessage("jssgroupLocallyRenderedImages"), browser.i18n.getMessage("jssgroupLocallyGeneratedAudio"), browser.i18n.getMessage("jssgroupLittleLies")]),
				browser.i18n.getMessage("jssgroupWASMDescription3"),
			],
			params: [
				{
					short: browser.i18n.getMessage("jssgroupWASMDisabled"),
					description: browser.i18n.getMessage("jssgroupWASMDisabledDescription"),
					config: [0],
				},
				{
					short: browser.i18n.getMessage("jssgroupWASMPassive"),
					description: browser.i18n.getMessage("jssgroupWASMPassiveDescription"),
					config: [1],
				},
				{
					short: browser.i18n.getMessage("jssgroupWASMActive"),
					description: browser.i18n.getMessage("jssgroupWASMActiveDescription"),
					description2: [
						"jssgroupWASMActiveDescription2","jssgroupWASMActiveDescription3","jssgroupWASMActiveDescription4"
					],
					config: [2],
				},
			],
			wrappers: [], // Special case with no wrappers, this group is for modifying htmlcanvaselement, webgl and audiobuffer farbling behaviour
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
	if (!are_all_api_unsupported(group.wrappers) || group.wrappers.length === 0) {
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
	"level_text": browser.i18n.getMessage("JSSL0Name"),
	"level_description": browser.i18n.getMessage("JSSL0Description"),
};

var level_1 = {
	"builtin": true,
	"level_id": L1,
	"level_text": browser.i18n.getMessage("JSSL1Name"),
	"level_description": browser.i18n.getMessage("JSSL1Description"),
	"time_precision": 3,
	"net": 1,
	"webworker": 3,
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
	"level_text": browser.i18n.getMessage("JSSL2Name"),
	"level_description": browser.i18n.getMessage("JSSL2Description"),
	"time_precision": 3,
	"htmlcanvaselement": 1,
	"audiobuffer": 1,
	"webgl": 1,
	"plugins": 2,
	"enumerateDevices": 2,
	"hardware": 1,
	"net": 1,
	"webworker": 3,
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
	"wasm": 1,
};

var level_3 = {
	"builtin": true,
	"level_id": L3,
	"level_text": browser.i18n.getMessage("JSSL3Name"),
	"level_description": browser.i18n.getMessage("JSSL3Description"),
	"time_precision": 3,
	"htmlcanvaselement": 2,
	"audiobuffer": 2,
	"webgl": 2,
	"plugins": 3,
	"enumerateDevices": 3,
	"hardware": 3,
	"net": 1,
	"webworker": 3,
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
	"level_text": browser.i18n.getMessage("JSSLexperimentalName"),
	"level_description": browser.i18n.getMessage("JSSLexperimentalDescription"),
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
}
init_levels();

let levels_initialised = false; // Initialized in updateLevels()
let fp_levels_initialised = false; // Initialized in fp_levels.js/loadFpdConfig()
let levels_updated_callbacks = [];
var tweak_domains = tweak_domains || {};
function updateLevels(res) {
	init_levels();
	custom_levels = res["custom_levels"] || {};
	for (let key in custom_levels) {
		levels[key] = custom_levels[key];
	}
	for (let key in levels) {
		levels[key].wrappers = wrapping_groups.get_wrappers(levels[key]);
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
	var redefined_domains = res["domains"] || {};
	for (let [d, settings] of Object.entries(tweak_domains)) {
		if ((default_level.level_id in settings.level_id) && !(d in redefined_domains)) {
			redefined_domains[d] = {level_id: default_level.level_id, tweaks: settings.tweaks};
		}
	}
	for (let [d, {level_id, tweaks, restore, restore_tweaks}] of Object.entries(redefined_domains)) {
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

	levels_initialised = true;
	if (fp_levels_initialised) { // Wait for both levels_initialised and fp_levels_initialised
		var orig_levels_updated_callbacks = levels_updated_callbacks;
		levels_updated_callbacks = [];
		orig_levels_updated_callbacks.forEach((it) => it());
	}
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
		// Tweaks not contain the new value defined by the user. However, that might
		// be the value of the level. Remove such tweaks as they to not change the
		// level of protection
		if (tweaks) {
			for (let [group, param] of Object.entries(tweaks)) {
				if (param === (levels[level_id][group] || 0)) {
					delete tweaks[group]; // remove redundant entries
				}
			}
			if (Object.keys(tweaks).length === 0) {
				tweaks = undefined;
			}
			// Do not save built-in tweaks as they are automatically added in updateLevels
			if (k in tweak_domains) {
				// Skip further check if the user has a different default_level
				if (default_level.level_id in tweak_domains[k].level_id) {
					tdb_tweaks = Object.entries(tweak_domains[k].tweaks);
					current_tweaks = Object.entries(tweaks || {});
					if (tdb_tweaks.length === current_tweaks.length) {
						var equal = true;
						for ([name, val] of tdb_tweaks) {
							if (tweaks[name] !== val) {
								equal = false;
								break;
							}
						}
						if (equal) {
							// This entry should not be saved
							continue;
						}
					}
				}
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
			if (l.tweaks) {
				l.wrappers = wrapping_groups.get_wrappers(l);
			}
			return l;
		}
	}
	return default_level;
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
