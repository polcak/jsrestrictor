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

function copyFunctionPointer(target, source) {
    if (source === null || target === null || target === source) {
        return;
    }

    if (source === undefined || target === undefined) {
        return;
    }

    var keys = Reflect.ownKeys(source);
    for (var k in keys) {
        if (!keys.hasOwnProperty(k)) continue;
        var name = keys[k];
        if (typeof (source[name]) === "function") {
            target[name] = source[name];
        } else if (typeof (source[name]) === "object") {
            target[name] = source[name];
            copyFunctionPointer(target[name], source[name]);
        }
    }
}

(function () {
    var common_function_body = `
    let offset = Math.floor(Math.random() * 4096);
    let _data = new originalF(...arguments);
    let _target = target;
    var proxy = new Proxy(_data, {
        get(target, key, receiver) {
            let random_idx = Math.floor(Math.random() * (target["length"] - 1));
            let rand_val = target[random_idx];
            let proto_keys = ["buffer", "byteLength", "byteOffset", "length"];
            if (proto_keys.indexOf(key) >= 0) {
                return target[key];
            }
            let value = Reflect.get(...arguments);
            return typeof value == 'function' ? value.bind(target) : value;
        },
    });
    copyFunctionPointer(proxy, originalF);
    
    proxy.prototype.subarray = function(){
        console.log('subarray');
        return proxy;
    }
    proxy.prototype.slice = function(){
        console.log('slice');
        return proxy;
    }
    
    let j;
    for (let i = 0; i < _data['length']; i++) {
        j = _data[i];
    }
    return proxy;
    `;


    let DEFAULT_WRAPPER = {
        parent_object: "window",
        parent_object_property: "_PROPERTY_",
        original_function: "window._PROPERTY_",
        wrapped_objects: [],
        helping_code: copyFunctionPointer,
        wrapping_function_args: `target`,
        wrapping_function_body: common_function_body,
        post_replacement_code: `copyFunctionPointer(window._PROPERTY_, originalF)`
    };

    var wrappers = [];

    var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];

    for (let p of arrays) {
        let wrapper = {...DEFAULT_WRAPPER};
        wrapper.parent_object_property = wrapper.parent_object_property.replace("_PROPERTY_", p);
        wrapper.original_function = wrapper.original_function.replace("_PROPERTY_", p);
        wrapper.post_replacement_code = wrapper.post_replacement_code.replace("_PROPERTY_", p);
        wrapper.wrapping_function_body += `${p};`;
        wrappers.push(wrapper);
    }

    add_wrappers(wrappers);
})();
