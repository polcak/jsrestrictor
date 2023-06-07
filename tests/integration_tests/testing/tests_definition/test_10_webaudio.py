#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Matus Svancar
#  Copyright (C) 2022  Libor Polčák
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
from web_browser_shared import get_shared_browser
from web_browser_type import BrowserType

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

def assertNotEqualNumbersInTexts(spoofed, orig, max_similarity = 0.05):
    """
    max_similarity: As data are changed probabilistically, we can tolerate some data that are the
    same.
    """
    assert len(spoofed) == len(orig)
    not_changed = 0
    for x, y in zip(spoofed, orig):
        if x == y:
            not_changed += 1
    assert not_changed < (max_similarity * len(orig))

## Test AudioContext.getChannelData
def test_channel_data(browser, audio_data, expected):
    if audio_data:
        if expected.audio.get_channel == 'SPOOF VALUE':
            assert audio_data['get_channel'] != browser.real.audio.get_channel
            assertNotEqualNumbersInTexts(audio_data['get_channel'], browser.real.audio.get_channel)
        else:
            assert audio_data['get_channel'] == browser.real.audio.get_channel
    else:
        assert False

## Test that repeated calls of getChannelData (interleaved with copyFromChannel) return the same data
def test_multiple_get_channel_data(browser, audio_data, expected):
    assert audio_data['get_channel'] == audio_data['get_channel2']

## Test AudioContext.copyFromChannel
def test_copy_channel(browser, audio_data, expected):
    if audio_data:
        if expected.audio.copy_channel == 'SPOOF VALUE':
            assert audio_data['copy_channel'] != browser.real.audio.copy_channel
            assertNotEqualNumbersInTexts(audio_data['copy_channel'], browser.real.audio.copy_channel)
        else:
            assert audio_data['copy_channel'] == browser.real.audio.copy_channel
    else:
        assert False

## Test that repeated calls of copyFromChannel (interleaved with getChannelData) return the same data
def test_multiple_copy_channel(browser, audio_data, expected):
    if get_shared_browser().jsr_level == 3 or get_shared_browser().jsr_level == "Experiment":
        # Note that it is not possible to use xfail as decorator as those are evaluated during
        # module import and the module is not reimported for different levels
        pytest.xfail("JShelter creates different white noise during each copyFromChannel() call. As we do not care about fingerprintability in this level, we do not care that the noise is different")
    assert audio_data['copy_channel'] == audio_data['copy_channel2']

## Test that getChannelData and copyFromChannel return the same data
def test_get_channel_equal_copy_channel(browser, audio_data, expected):
    if get_shared_browser().jsr_level == 3 or get_shared_browser().jsr_level == "Experiment":
        # Note that it is not possible to use xfail as decorator as those are evaluated during
        # module import and the module is not reimported for different levels
        pytest.xfail("JShelter creates different white noise during each copyFromChannel() call. As we do not care about fingerprintability in this level, we do not care that the noise is different")
    assert audio_data['copy_channel'] == audio_data['get_channel']

## Test AnalyserNode.getByteTimeDomainData
def test_byte_time_domain(browser, audio_data, expected):
    if get_shared_browser().jsr_level == "Experiment" and get_shared_browser().type == BrowserType.FIREFOX:
        # Note that it is not possible to use xfail as decorator as those are evaluated during
        # module import and the module is not reimported for different levels
        pytest.xfail("This test will work only after Array Wrappers are fixed in Firefox")
    if audio_data:
        if expected.audio.byte_time_domain == 'SPOOF VALUE':
            assert audio_data['byte_time_domain'] != browser.real.audio.byte_time_domain
            assertNotEqualNumbersInTexts(audio_data['byte_time_domain'],
                                         browser.real.audio.byte_time_domain,
                                         0.7) # The code modifies the value with 0.5 probability
        else:
            assert audio_data['byte_time_domain'] == browser.real.audio.byte_time_domain
    else:
        assert False

## Test AnalyserNode.getFloatTimeDomainData
def test_float_time_domain(browser, audio_data, expected):
    if get_shared_browser().jsr_level == "Experiment" and get_shared_browser().type == BrowserType.FIREFOX:
        # Note that it is not possible to use xfail as decorator as those are evaluated during
        # module import and the module is not reimported for different levels
        pytest.xfail("This test will work only after Array Wrappers are fixed in Firefox")
    if audio_data:
        if expected.audio.float_time_domain == 'SPOOF VALUE':
            assert audio_data['float_time_domain'] != browser.real.audio.float_time_domain
            assertNotEqualNumbersInTexts(audio_data['float_time_domain'], browser.real.audio.float_time_domain)
        else:
            assert audio_data['float_time_domain'] == browser.real.audio.float_time_domain
    else:
        assert False

## Test AnalyserNode.getByteFrequencyData
def test_byte_frequency(browser, audio_data, expected):
    if audio_data:
        if expected.audio.byte_frequency == 'SPOOF VALUE':
            assert audio_data['byte_frequency'] != browser.real.audio.byte_frequency
            assertNotEqualNumbersInTexts(audio_data['byte_frequency'],
                                         browser.real.audio.byte_frequency,
                                         0.7) # The code modifies the value with 0.5 probability
        else:
            assert audio_data['byte_frequency'] == browser.real.audio.byte_frequency
    else:
        assert False

## Test AnalyserNode.getFloatFrequencyData
def test_float_frequency(browser, audio_data, expected):
    if audio_data:
        if expected.audio.float_frequency == 'SPOOF VALUE':
            assert audio_data['float_frequency'] != browser.real.audio.float_frequency
            assertNotEqualNumbersInTexts(audio_data['float_frequency'], browser.real.audio.float_frequency)
        else:
            assert audio_data['float_frequency'] == browser.real.audio.float_frequency
    else:
        assert False

## Test little lies farbling
def test_little_lies(browser, audio_data, expected):
    if get_shared_browser().jsr_level != 2:
        pytest.skip("Apply the test to the little lies level only")
    def assertNumberesSimilar(spoofed, orig, epsilon):
        assert len(spoofed) == len(orig)
        for x, y in zip(spoofed, orig):
            assert abs(x - y) <= epsilon
    assertNumberesSimilar(audio_data['get_channel'], browser.real.audio.get_channel, 0.01)
    assertNumberesSimilar(audio_data['copy_channel'], browser.real.audio.copy_channel, 0.01)
    # See issue 114 for more details why the following lines are commented out
    #assertNumberesSimilar(audio_data['byte_time_domain'], browser.real.audio.byte_time_domain, 1)
    #assertNumberesSimilar(audio_data['float_time_domain'], browser.real.audio.float_time_domain, 0.01)
    #assertNumberesSimilar(audio_data['byte_frequency'], browser.real.audio.byte_frequency, 1)
    #assertNumberesSimilar(audio_data['float_frequency'], browser.real.audio.float_frequency, 0.01)
