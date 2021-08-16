Title: WebAudio
Filename: ../common/wrappingS-WEBA.js

This file contains wrappers for AudioBuffer and AnalyserNode related calls
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

The goal is to prevent fingerprinting by modifying the values from functions which are reading/copying from AudioBuffer and AnalyserNode.
So the audio content of wrapped objects is the same as intended.

The modified content can be either a white noise based on domain key or a fake audio data that is modified according to
domain key to be different than the original albeit very similar (i.e. the approach
inspired by the algorithms created by Brave Software <https://brave.com>
available at https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/execution_context/execution_context.cc.)

Note:  Both approaches are detectable by a fingerprinter that checks if a predetermined audio
is the same as the read one. Nevertheless, the aim of the wrappers is
to limit the finerprintability.


