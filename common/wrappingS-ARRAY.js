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
    function common_function () {
        var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
        for (arr in arrays) {
            let _old = window[arrays[arr]];

            window[arrays[arr]] = function (target) {
                let offset = Math.floor(Math.random() * 4096);
                let _data = new _old(...arguments);
                let _target = target;
                var proxy = new Proxy(_data, {
                    get(target, name) {
                        console.log(`OFFSET: ${offset}`);
                        console.log(`_target: ${_target}, target: ${target}`);
                        return _data[name];
                    }
                });
                copyFunctionPointer(proxy, _old);
                return proxy;
            };
            copyFunctionPointer(window[arrays[arr]], _old);
        }
    }

    var arrayz = `
    var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
        for (arr in arrays) {
            
        }`;

    var common_function_body = `
    let offset = Math.floor(Math.random() * 4096);
    let _data = new originalF(...arguments);
    let _target = target;
    var proxy = new Proxy(_data, {
        get(target, key, receiver) {
            console.log(\`OFFSET: \${offset}\`);
            console.log(\`_target: \${_target}, target: \${target}\`);
            if (key === "length") {
                return target["length"];
            }
            let value = Reflect.get(...arguments);
            return typeof value == 'function' ? value.bind(target) : value;
        },
    });
    copyFunctionPointer(proxy, originalF);
    return proxy;
    `;

    var wrappers = [
        {
            parent_object: "window",
            parent_object_property: "Uint8Array",
            original_function: "window.Uint8Array",
            wrapped_objects: [],
            helping_code: copyFunctionPointer,
            wrapping_function_args: `target`,
            wrapping_function_body: common_function_body,
            post_replacement_code: `copyFunctionPointer(window.Uint8Array, originalF)`
        }
    ];
    add_wrappers(wrappers);
})();
