#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Matus Svancar
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
from values_getters import get_webgl_params
from values_getters import get_webgl_pixels
from values_getters import get_dataURL_canvas
from values_getters import get_webgl_precisions

@pytest.fixture(scope='module', autouse=True)
def webgl_params(browser):
    return get_webgl_params(browser.driver, "webglCanvas")

# Test WebGLRenderingContext.getParameter for unmaskedVendor
def test_unmasked_vendor(browser, webgl_params, expected):
    if expected.webgl_parameters == 'REAL VALUE':
        assert webgl_params['unmaskedVendor'] == browser.real.webgl_parameters['unmaskedVendor']
    else:
        if webgl_params['unmaskedVendor'] == browser.real.webgl_parameters['unmaskedVendor']:
            assert webgl_params['unmaskedVendor'] == None
        else:
            assert True

# Test WebGLRenderingContext.getParameter for unmaskedRenderer
def test_unmasked_renderer(browser, webgl_params, expected):
    if expected.webgl_parameters == 'REAL VALUE':
        assert webgl_params['unmaskedRenderer'] == browser.real.webgl_parameters['unmaskedRenderer']
    else:
        assert webgl_params['unmaskedRenderer'] != browser.real.webgl_parameters['unmaskedRenderer']

# Test WebGLRenderingContext.getParameter
def test_other_parameters(browser, webgl_params, expected):
    if expected.webgl_parameters == 'SPOOF VALUE':
        assert ((webgl_params['MAX_VERTEX_UNIFORM_COMPONENTS'] in {browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_COMPONENTS'],browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_COMPONENTS']-1}) and
               (webgl_params['MAX_VERTEX_UNIFORM_BLOCKS'] in {browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_BLOCKS'],browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_BLOCKS']-1}) and
               (webgl_params['MAX_VERTEX_OUTPUT_COMPONENTS'] in {browser.real.webgl_parameters['MAX_VERTEX_OUTPUT_COMPONENTS'],browser.real.webgl_parameters['MAX_VERTEX_OUTPUT_COMPONENTS']-1}) and
               (webgl_params['MAX_VARYING_COMPONENTS'] in {browser.real.webgl_parameters['MAX_VARYING_COMPONENTS'],browser.real.webgl_parameters['MAX_VARYING_COMPONENTS']-1}) and
               (webgl_params['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS'] in {browser.real.webgl_parameters['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS'],browser.real.webgl_parameters['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS']-1}) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_COMPONENTS'] in {browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_COMPONENTS'],browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_COMPONENTS']-1}) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_BLOCKS'] in {browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_BLOCKS'],browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_BLOCKS']-1}) and
               (webgl_params['MAX_FRAGMENT_INPUT_COMPONENTS'] in {browser.real.webgl_parameters['MAX_FRAGMENT_INPUT_COMPONENTS'],browser.real.webgl_parameters['MAX_FRAGMENT_INPUT_COMPONENTS']-1}) and
               (webgl_params['MAX_UNIFORM_BUFFER_BINDINGS'] in {browser.real.webgl_parameters['MAX_UNIFORM_BUFFER_BINDINGS'],browser.real.webgl_parameters['MAX_UNIFORM_BUFFER_BINDINGS']-1}) and
               (webgl_params['MAX_COMBINED_UNIFORM_BLOCKS'] in {browser.real.webgl_parameters['MAX_COMBINED_UNIFORM_BLOCKS'],browser.real.webgl_parameters['MAX_COMBINED_UNIFORM_BLOCKS']-1}) and
               (webgl_params['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS'] in {browser.real.webgl_parameters['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS'],browser.real.webgl_parameters['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS']-1}) and
               (webgl_params['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS'] in {browser.real.webgl_parameters['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS'],browser.real.webgl_parameters['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS']-1}) and
               (webgl_params['MAX_VERTEX_ATTRIBS'] in {browser.real.webgl_parameters['MAX_VERTEX_ATTRIBS'],browser.real.webgl_parameters['MAX_VERTEX_ATTRIBS']-1}) and
               (webgl_params['MAX_VERTEX_UNIFORM_VECTORS'] in {browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_VECTORS'],browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_VECTORS']-1}) and
               (webgl_params['MAX_VERTEX_TEXTURE_IMAGE_UNITS'] in {browser.real.webgl_parameters['MAX_VERTEX_TEXTURE_IMAGE_UNITS'],browser.real.webgl_parameters['MAX_VERTEX_TEXTURE_IMAGE_UNITS']-1}) and
               (webgl_params['MAX_TEXTURE_SIZE'] in {browser.real.webgl_parameters['MAX_TEXTURE_SIZE'],browser.real.webgl_parameters['MAX_TEXTURE_SIZE']-1}) and
               (webgl_params['MAX_CUBE_MAP_TEXTURE_SIZE'] in {browser.real.webgl_parameters['MAX_CUBE_MAP_TEXTURE_SIZE'],browser.real.webgl_parameters['MAX_CUBE_MAP_TEXTURE_SIZE']-1}) and
               (webgl_params['MAX_3D_TEXTURE_SIZE'] in {browser.real.webgl_parameters['MAX_3D_TEXTURE_SIZE'],browser.real.webgl_parameters['MAX_3D_TEXTURE_SIZE']-1}) and
               (webgl_params['MAX_ARRAY_TEXTURE_LAYERS'] in {browser.real.webgl_parameters['MAX_ARRAY_TEXTURE_LAYERS'],browser.real.webgl_parameters['MAX_ARRAY_TEXTURE_LAYERS']-1}))
    elif expected.webgl_parameters == 'ZERO VALUE':
        assert ((webgl_params['MAX_VERTEX_UNIFORM_COMPONENTS'] == 0) and
               (webgl_params['MAX_VERTEX_UNIFORM_BLOCKS'] == 0) and
               (webgl_params['MAX_VERTEX_OUTPUT_COMPONENTS'] == 0) and
               (webgl_params['MAX_VARYING_COMPONENTS'] == 0) and
               (webgl_params['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS'] == 0) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_COMPONENTS'] == 0) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_BLOCKS'] == 0) and
               (webgl_params['MAX_FRAGMENT_INPUT_COMPONENTS'] == 0) and
               (webgl_params['MAX_UNIFORM_BUFFER_BINDINGS'] == 0) and
               (webgl_params['MAX_COMBINED_UNIFORM_BLOCKS'] == 0) and
               (webgl_params['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS'] == 0) and
               (webgl_params['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS'] == 0) and
               (webgl_params['MAX_VERTEX_ATTRIBS'] == browser.real.webgl_parameters['MAX_VERTEX_ATTRIBS']) and
               (webgl_params['MAX_VERTEX_UNIFORM_VECTORS'] == browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_VECTORS']) and
               (webgl_params['MAX_VERTEX_TEXTURE_IMAGE_UNITS'] == browser.real.webgl_parameters['MAX_VERTEX_TEXTURE_IMAGE_UNITS']) and
               (webgl_params['MAX_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_TEXTURE_SIZE']) and
               (webgl_params['MAX_CUBE_MAP_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_CUBE_MAP_TEXTURE_SIZE']) and
               (webgl_params['MAX_3D_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_3D_TEXTURE_SIZE']) and
               (webgl_params['MAX_ARRAY_TEXTURE_LAYERS'] == browser.real.webgl_parameters['MAX_ARRAY_TEXTURE_LAYERS']))
    else:
        assert ((webgl_params['MAX_VERTEX_UNIFORM_COMPONENTS'] == browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_COMPONENTS']) and
               (webgl_params['MAX_VERTEX_UNIFORM_BLOCKS'] == browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_BLOCKS']) and
               (webgl_params['MAX_VERTEX_OUTPUT_COMPONENTS'] == browser.real.webgl_parameters['MAX_VERTEX_OUTPUT_COMPONENTS']) and
               (webgl_params['MAX_VARYING_COMPONENTS'] == browser.real.webgl_parameters['MAX_VARYING_COMPONENTS']) and
               (webgl_params['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS'] == browser.real.webgl_parameters['MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS']) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_COMPONENTS'] == browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_COMPONENTS']) and
               (webgl_params['MAX_FRAGMENT_UNIFORM_BLOCKS'] == browser.real.webgl_parameters['MAX_FRAGMENT_UNIFORM_BLOCKS']) and
               (webgl_params['MAX_FRAGMENT_INPUT_COMPONENTS'] == browser.real.webgl_parameters['MAX_FRAGMENT_INPUT_COMPONENTS']) and
               (webgl_params['MAX_UNIFORM_BUFFER_BINDINGS'] == browser.real.webgl_parameters['MAX_UNIFORM_BUFFER_BINDINGS']) and
               (webgl_params['MAX_COMBINED_UNIFORM_BLOCKS'] == browser.real.webgl_parameters['MAX_COMBINED_UNIFORM_BLOCKS']) and
               (webgl_params['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS'] == browser.real.webgl_parameters['MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS']) and
               (webgl_params['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS'] == browser.real.webgl_parameters['MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS']) and
               (webgl_params['MAX_VERTEX_ATTRIBS'] == browser.real.webgl_parameters['MAX_VERTEX_ATTRIBS']) and
               (webgl_params['MAX_VERTEX_UNIFORM_VECTORS'] == browser.real.webgl_parameters['MAX_VERTEX_UNIFORM_VECTORS']) and
               (webgl_params['MAX_VERTEX_TEXTURE_IMAGE_UNITS'] == browser.real.webgl_parameters['MAX_VERTEX_TEXTURE_IMAGE_UNITS']) and
               (webgl_params['MAX_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_TEXTURE_SIZE']) and
               (webgl_params['MAX_CUBE_MAP_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_CUBE_MAP_TEXTURE_SIZE']) and
               (webgl_params['MAX_3D_TEXTURE_SIZE'] == browser.real.webgl_parameters['MAX_3D_TEXTURE_SIZE']) and
               (webgl_params['MAX_ARRAY_TEXTURE_LAYERS'] == browser.real.webgl_parameters['MAX_ARRAY_TEXTURE_LAYERS']))

# Test WebGLRenderingContext.getShaderPrecisionFormat
def test_webgl_precisions(browser, expected):
    precisions = get_webgl_precisions(browser.driver,"webglCanvas")
    if expected.webgl_precisions == 'SPOOF VALUE':
        assert precisions != browser.real.webgl_precisions
    else:
        assert precisions == browser.real.webgl_precisions

# Test WebGLRenderingContext.readPixels
def test_webgl_read_pixels(browser, expected):
    pixels = get_webgl_pixels(browser.driver,"webglCanvas")
    if pixels == "ERROR":
        print("\nWebGLRenderingContext.readPixels failed.")
        assert False
    if expected.webgl_pixels == 'SPOOF VALUE':
        assert pixels != browser.real.webgl_pixels
    else:
        assert pixels == browser.real.webgl_pixels

# Test HTMLCanvasElement.toDataURL on webgl canvas
def test_webgl_to_data_URL(browser, expected):
    image = get_dataURL_canvas(browser.driver,"webglCanvas")
    if expected.webgl_dataURL == 'SPOOF VALUE':
        assert image != browser.real.webgl_dataURL
    else:
        assert image == browser.real.webgl_dataURL
