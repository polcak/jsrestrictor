// SPDX-FileCopyrightText: 2021 Matúš Švancár
//
// SPDX-License-Identifier: GPL-3.0-or-later

var pxi_output;
var copy_output;
var pxi_full_buffer;

function run_pxi_fp() {
	try {
		if (context = new(window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100), !context) {
			document.getElementById("channel_data_result").innerHTML = "OfflineAudioContext not supported";
			pxi_output = 0;
		}

		// Create oscillator
		pxi_oscillator = context.createOscillator();
		pxi_oscillator.type = "triangle";
		pxi_oscillator.frequency.value = 1e4;

		// Create and configure compressor
		pxi_compressor = context.createDynamicsCompressor();
		pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
		pxi_compressor.knee && (pxi_compressor.knee.value = 40);
		pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
		pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
		pxi_compressor.attack && (pxi_compressor.attack.value = 0);
		pxi_compressor.release && (pxi_compressor.release.value = .25);

		// Connect nodes
		pxi_oscillator.connect(pxi_compressor);
		pxi_compressor.connect(context.destination);

		// Start audio processing
		pxi_oscillator.start(0);
		context.startRendering();
		var channel2 = new Float32Array(context.length);
		context.oncomplete = function(evnt) {
			pxi_output = 0;
			copy_output = 0;
			var channel1 = evnt.renderedBuffer.getChannelData(0);
			evnt.renderedBuffer.copyFromChannel(channel2, 0);
			for (var i = 4500; 5e3 > i; i++) {
				pxi_output += Math.abs(channel1[i]);
				copy_output += Math.abs(channel2[i]);
			}

			document.getElementById("channel_data_result").innerHTML = pxi_output.toString();
			document.getElementById("copy_result").innerHTML = copy_output.toString();
			pxi_compressor.disconnect();
		}
	} catch (u) {
		pxi_output = 0;
	}
}

var float_result = [];
var byte_result = [];

function run_hybrid_fp() {
	var audioCtx = new(window.AudioContext || window.webkitAudioContext),
		oscillator = audioCtx.createOscillator(),
		analyser = audioCtx.createAnalyser(),
		gain = audioCtx.createGain(),
		scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

	// Create and configure compressor
	compressor = audioCtx.createDynamicsCompressor();
	compressor.threshold && (compressor.threshold.value = -50);
	compressor.knee && (compressor.knee.value = 40);
	compressor.ratio && (compressor.ratio.value = 12);
	compressor.reduction && (compressor.reduction.value = -20);
	compressor.attack && (compressor.attack.value = 0);
	compressor.release && (compressor.release.value = .25);

	gain.gain.value = 0; // Disable volume
	oscillator.type = "triangle"; // Set oscillator to output triangle wave
	oscillator.connect(compressor); // Connect oscillator output to dynamic compressor
	compressor.connect(analyser); // Connect compressor to analyser
	analyser.connect(scriptProcessor); // Connect analyser output to scriptProcessor input
	scriptProcessor.connect(gain); // Connect scriptProcessor output to gain input
	gain.connect(audioCtx.destination); // Connect gain output to audiocontext destination

	scriptProcessor.onaudioprocess = function(bins) {
		float_bins = new Float32Array(analyser.frequencyBinCount);
		byte_bins = new Uint8Array(analyser.frequencyBinCount);
		analyser.getFloatFrequencyData(float_bins);
		analyser.getByteFrequencyData(byte_bins);
		var floatTimeData = new Float32Array(analyser.fftSize);
		analyser.getFloatTimeDomainData(floatTimeData);
		const byteTimeData = new Uint8Array(analyser.fftSize);
		analyser.getByteTimeDomainData(byteTimeData);
		for (var i = 0; i < float_bins.length; i = i + 1) {
			float_result.push(float_bins[i]);
			byte_result.push(byte_bins[i]);
		}
		analyser.disconnect();
		scriptProcessor.disconnect();
		gain.disconnect();
		document.getElementById("float_frequency_result").innerHTML = float_result.slice(0, 40).toString();
		document.getElementById("byte_frequency_result").innerHTML = byte_result.slice(0, 40).toString();
		document.getElementById("float_time_result").innerHTML = floatTimeData.slice(0, 40).toString();
		document.getElementById("byte_time_result").innerHTML = byteTimeData.slice(0, 40).toString();
	};

	oscillator.start(0);
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("play").addEventListener("click", function() {
		run_pxi_fp();
		run_hybrid_fp();
	});
});
