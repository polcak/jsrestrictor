#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Matus Svancar
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
import pytest
from values_getters import get_audio

## AudioContext and AnalyserNode tests
##
## All of these tests fail in Google Chrome on JShelter level 3 - expected failure because of known bug:
## selenium.common.exceptions.JavascriptException: Message: javascript error:
## Failed to execute 'getRandomValues' on 'Crypto': parameter 1 is not of type 'ArrayBufferView'.

@pytest.fixture(scope='module', autouse=True)
def audio_data(browser):
    audio = None
    try:
        audio = get_audio(browser.driver)
    except:
        print("\nCan not read audio data.")
    return audio

## Test AudioContext.getChannelData
def test_channel_data(browser, audio_data, expected):
    if audio_data:
        if expected.audio.get_channel == 'SPOOF VALUE':
            assert audio_data['get_channel'] != browser.real.audio.get_channel
        else:
            assert audio_data['get_channel'] == browser.real.audio.get_channel
    else:
        assert False

## Test AudioContext.copyFromChannel
def test_copy_channel(browser, audio_data, expected):
    if audio_data:
        if expected.audio.copy_channel == 'SPOOF VALUE':
            assert audio_data['copy_channel'] != browser.real.audio.copy_channel
        else:
            assert audio_data['copy_channel'] == browser.real.audio.copy_channel
    else:
        assert False

## Test AnalyserNode.getByteTimeDomainData
def test_byte_time_domain(browser, audio_data, expected):
    if audio_data:
        if expected.audio.byte_time_domain == 'SPOOF VALUE':
            assert audio_data['byte_time_domain'] != browser.real.audio.byte_time_domain
        else:
            assert audio_data['byte_time_domain'] == browser.real.audio.byte_time_domain
    else:
        assert False

## Test AnalyserNode.getFloatTimeDomainData
def test_float_time_domain(browser, audio_data, expected):
    if audio_data:
        if expected.audio.float_time_domain == 'SPOOF VALUE':
            assert audio_data['float_time_domain'] != browser.real.audio.float_time_domain
        else:
            assert audio_data['float_time_domain'] == browser.real.audio.float_time_domain
    else:
        assert False

## Test AnalyserNode.getByteFrequencyData
def test_byte_frequency(browser, audio_data, expected):
    if audio_data:
        if expected.audio.byte_frequency == 'SPOOF VALUE':
            assert audio_data['byte_frequency'] != browser.real.audio.byte_frequency
        else:
            assert audio_data['byte_frequency'] == browser.real.audio.byte_frequency
    else:
        assert False

## Test AnalyserNode.getFloatFrequencyData
def test_float_frequency(browser, audio_data, expected):
    if audio_data:
        if expected.audio.float_frequency == 'SPOOF VALUE':
            assert audio_data['float_frequency'] != browser.real.audio.float_frequency
        else:
            assert audio_data['float_frequency'] == browser.real.audio.float_frequency
    else:
        assert False
