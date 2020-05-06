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
    // Copy function pointers to from source object to target object.
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

function constructDecorator(wrapped) {
    return function () {
        const res = wrapped.apply(originalF, arguments);
        return replacementF(res);
    }
}

function offsetDecorator(wrapped, type, proxyRef, offsetF) {
    return function () {
        var ref = proxyRef;
        let newArr = [];
        // Create a copy of array
        for (let i = 0; i < this.length; i++) {
            newArr[i] = this[offsetF(i)]
        }
        // Shift to original
        for (let i = 0; i < this.length; i++) {
            this[i] = newArr[i];
        }
        // Do func
        let res;
        if (type === 3) {
            res = wrapped.apply(new this.prototype.constructor(this), arguments);
        } else {
            res = wrapped.apply(this, arguments);
        }
        // Create copy of new arr
        let secArr = [];
        for (let i = 0; i < this.length; i++) {
            secArr[i] = this[i];
        }
        for (let i = 0; i < this.length; i++) {
            this[offsetF(i)] = secArr[i];
        }
        switch (type) {
            case 0:
                return proxyRef;
            case 1:
                return replacementF(res);
            case 2:
                return res;
            default:
                return res
        }
    }
}

function redefineNewArrayFunctions(target, offsetF) {
    target['sort'] = offsetDecorator(target['sort'], 0, target, offsetF);
    target['reverse'] = offsetDecorator(target['reverse'], 0, target, offsetF);
    target['fill'] = offsetDecorator(target['fill'], 0, target, offsetF);
    target['copyWithin'] = offsetDecorator(target['copyWithin'], 0, target, offsetF);
    target['slice'] = offsetDecorator(target['slice'], 1, target, offsetF);
    target['map'] = offsetDecorator(target['map'], 1, target, offsetF);
    target['filter'] = offsetDecorator(target['filter'], 1, target, offsetF);
    target['subarray'] = offsetDecorator(target['subarray'], 2, target, offsetF);
    target['set'] = offsetDecorator(target['set'], 2, target, offsetF);
    target['reduce'] = offsetDecorator(target['reduce'], 2, target, offsetF);
    target['reduceRight'] = offsetDecorator(target['reduceRight'], 2, target, offsetF);
    target['lastIndexOf'] = offsetDecorator(target['lastIndexOf'], 2, target, offsetF);
    target['indexOf'] = offsetDecorator(target['indexOf'], 2, target, offsetF);
    target['forEach'] = offsetDecorator(target['forEach'], 2, target, offsetF);
    target['find'] = offsetDecorator(target['find'], 2, target, offsetF);
    target['join'] = offsetDecorator(target['join'], 2, target, offsetF);
    target['entries'] = offsetDecorator(target['entries'], 3, target, offsetF);
    target['keys'] = offsetDecorator(target['keys'], 3, target, offsetF);
    target['values'] = offsetDecorator(target['values'], 3, target, offsetF);
}

function redefineNewArrayConstructors(target) {
    target['from'] = constructDecorator(originalF['from']);
    target['of'] = constructDecorator(originalF['of']);
}

// Default proxy handler for Typed Arrays
var proxyHandler = `{
    get(target, key, receiver) {
        var random_idx = Math.floor(Math.random() * (target["length"] - 1));
        // Load random index from array
        var rand_val = target[random_idx];
        let proto_keys = ["buffer", "byteLength", "byteOffset", "length"];
        if (proto_keys.indexOf(key) >= 0) {
            return target[key];
        }
        // offsetF argument needs to be in array range
        if (typeof key !== "symbol" && Number(key) >= 0 && Number(key) < target.length) {
            key = offsetF(key)
        }
        let value = Reflect.get(...arguments);
        return typeof value == 'function' ? value.bind(target) : value;
    },
    set(target, key, value) {
        var random_idx = Math.floor(Math.random() * (target["length"] - 1));
        // Load random index from array
        var rand_val = target[random_idx];
        rand_val = rand_val;
        if (typeof key !== "symbol" && Number(key) >= 0 && Number(key) < target.length) {
            key = offsetF(key)
        }
        return Reflect.set(...arguments);
    }
}`;

function getByteDecorator(wrapped, offsetF, name) {
    return function () {
        const originalIdx = arguments[0];
        const endian = arguments[1];
        if (name === "getUint8") {
            // Random access
            let ran = wrapped.apply(this, [Math.floor(Math.random() * (this.byteLength - 1))]);
            // Call original func
            arguments[0] = offsetF(originalIdx);
            return wrapped.apply(this, arguments);
        }
        const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
        let res = 0;
        let swapNumber = byteNumber - 1;
        for (let i = 0; i < byteNumber; i++) {
            if (endian) {
                // Shift starting with 0,1,2
                swapNumber = i * 2;
            }
            res += this.getUint8(originalIdx + i) << ((swapNumber - i) * 8);
        }
        return res;
    }
};

function setByteDecorator(wrapped, offsetF, name) {
    function to32BitBin(n) {
        if (n < 0) {
            n = 0xFFFFFFFF + n + 1;
        }
        return ("00000000000000000000000000000000" + parseInt(n, 10).toString(2)).substr(-32);
    }

    return function () {
        const originalIdx = arguments[0];
        const value = arguments[1];
        const endian = arguments[2];
        if (name === "setUint8") {
            // Random access
            this.getUint8(0);
            // Call original func
            arguments[0] = offsetF(originalIdx);
            return wrapped.apply(this, arguments);
        }
        const byteNumber = (parseInt(name[name.length - 2] + name[name.length - 1]) || parseInt(name[name.length - 1])) / 8;
        const binNumber = to32BitBin(value);
        let numberPart;
        for (let i = 0; i < byteNumber; i++) {
            numberPart = binNumber.substr(i * 8, 8);
            numberPart = parseInt(numberPart,2);
            if (endian){
                this.setUint8(originalIdx + byteNumber - i - 1, numberPart);
            } else{
                this.setUint8(originalIdx + i, numberPart);
            }
        }
        return undefined;
    }
};


function redefineDataViewFunctions(target, offsetF) {
    // Done
    var dataViewTypes = ["getInt8", "getInt16", "getInt32", "getUint8", "getUint16", "getUint32"];
    // Not done
    var dataViewTypes2= ["getFloat32", "getFloat64", "getBigInt64", "getBigUint64"];
    for (type of dataViewTypes) {
        target[type] = getByteDecorator(target[type], offsetF, type);
        type = 's' + type.substr(1);
        target[type] = setByteDecorator(target[type], offsetF, type);
    }
};

(function () {
    var common_function_body = `
    let _data;
    if (typeof target === "object" && target !== null) {
        if (is_proxy in target){
            // If already Proxied array is passed as arg return it
            return target;
        }
    }
    _data = new originalF(...arguments);
    // No offset
    var offsetF = function(x) {
        return x;
    };
    if (level >= 2) {
        // Random numbers for offset function
        let n = _data.length;
        let a;
        while (true){
            a = Math.floor(Math.random() * 4096);
            if (gcd(a,n) === 1){
                break;
            }
        }
        let b = Math.floor(Math.random() * 4096);
        // Define function to calculate offset;
        offsetF = function(x) {
            if (x === undefined){
                return x;
            }
            x = x < 0 ? n + x : x;
            return (a*x + b) % n ;
        };
        let arr = []
        for (let i = 0; i < _data.length; i++) {
            arr[i] = _data[i];
        }

        for (let i = 0; i < _data.length; i++) {
            _data[offsetF(i)] = arr[i];
        }
    }
    let _target = target;
    var proxy = new Proxy(_data, ${proxyHandler});
    // Proxy has to support all methods, original object supports.
    copyFunctionPointer(proxy, originalF);
    ${offsetDecorator};
    ${redefineNewArrayFunctions};
    if (level >= 2) {
        // Methods have to work with offsets;
        redefineNewArrayFunctions(proxy, offsetF);
    }
    // Preload array
    let j;
    for (let i = 0; i < _data['length']; i++) {
        j = _data[i];
    }
    return proxy;
    `;

    var wrappers = [
        {
            parent_object: "window",
            parent_object_property: "DataView",
            original_function: "window.DataView",
            wrapped_objects: [],
            wrapping_function_args: "buffer, byteOffset, byteLength",
            helping_code: copyFunctionPointer + `
            function gcd(x, y) {
                while(y) {
                    var t = y;
                    y = x % y;
                    x = t;
                }
            return x;
            }
            `,
            wrapping_function_body: `
                let _data = new originalF(buffer);
                let n = _data.byteLength;
                let a;
                while (true){
                    a = Math.floor(Math.random() * 4096);
                    if (gcd(a,n) === 1){
                        break;
                    }
                }
                let b = Math.floor(Math.random() * 4096);
                // Define function to calculate offset;
                offsetF = function(x) {
                    if (x === undefined){
                        return x;
                    }
                    x = x < 0 ? n + x : x;
                    return (a*x + b) % n ;
                };
                ${getByteDecorator}
                ${setByteDecorator}
                ${redefineDataViewFunctions}
                for (let i = 0; i < n; i++) {
                    let random = _data.getUint8(i);
                }
                redefineDataViewFunctions(_data, offsetF);
                return _data;
            `,
        },
    ];


    let DEFAULT_TYPED_ARRAY_WRAPPER = {
        parent_object: "window",
        parent_object_property: "_PROPERTY_",
        original_function: "window._PROPERTY_",
        wrapped_objects: [],
        helping_code: copyFunctionPointer + `
        let level = args[0];
        var proxyHandler = ${proxyHandler};
        function gcd(x, y) {
        while(y) {
            var t = y;
            y = x % y;
            x = t;
        }
        return x;
        }
        `,
        wrapping_function_args: `target`,
        wrapping_function_body: common_function_body,
        post_replacement_code: `
        ${constructDecorator}
        ${redefineNewArrayConstructors}
        copyFunctionPointer(window._PROPERTY_, originalF);
        if (level >= 2){
            redefineNewArrayConstructors(window._PROPERTY_);        
        }
        `
    };

    var typedTypes = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
    for (let p of typedTypes) {
        let wrapper = {...DEFAULT_TYPED_ARRAY_WRAPPER};
        wrapper.parent_object_property = wrapper.parent_object_property.replace("_PROPERTY_", p);
        wrapper.original_function = wrapper.original_function.replace("_PROPERTY_", p);
        wrapper.post_replacement_code = wrapper.post_replacement_code.split("_PROPERTY_").join(p);
        wrapper.wrapping_function_body += `${p};`;
        wrappers.push(wrapper);
    }

    add_wrappers(wrappers);
})();
