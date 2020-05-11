//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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

/*
 * Create private namespace
 */

(function () {
    var wrappers = [
        {
            parent_object: "WebGLRenderingContext.prototype",
            parent_object_property: "bufferSubData",
            original_function: "WebGLRenderingContext.prototype.bufferSubData",
            wrapped_objects: [],
            wrapping_function_body: `
                if (arguments[2] !== null && typeof arguments[2] === 'object' && is_proxy in arguments[2]){
                    arguments[2] = arguments[2].subarray(0);
                }
                return originalF.call(this, ...arguments);
            `,
        },
        {
            parent_object: "WebGLRenderingContext.prototype",
            parent_object_property: "texImage2D",
            original_function: "WebGLRenderingContext.prototype.texImage2D",
            wrapped_objects: [],
            wrapping_function_body: `
                if (arguments[8] !== null && typeof arguments[8] === 'object' && is_proxy in arguments[8]){
                    arguments[8] = arguments[8].subarray(0);
                }
                return originalF.call(this, ...arguments);
            `,
        },
        {
            parent_object: "WebGLRenderingContext.prototype",
            parent_object_property: "texSubImage2D",
            original_function: "WebGLRenderingContext.prototype.texSubImage2D",
            wrapped_objects: [],
            wrapping_function_body: `
                if (arguments[8] !== null && typeof arguments[8] === 'object' && is_proxy in arguments[8]){
                    arguments[8] = arguments[8].subarray(0);
                }
                return originalF.call(this, ...arguments);
            `,
        },
        {
            parent_object: "WebGLRenderingContext.prototype",
            parent_object_property: "readPixels",
            original_function: "WebGLRenderingContext.prototype.readPixels",
            wrapped_objects: [],
            wrapping_function_body: `
                if (arguments[6] !== null && typeof arguments[6] === 'object' && is_proxy in arguments[6]){
                    arguments[6] = arguments[6].subarray(0);
                }
                return originalF.call(this, ...arguments);
            `,
        },

    ];

    add_wrappers(wrappers);
})();
