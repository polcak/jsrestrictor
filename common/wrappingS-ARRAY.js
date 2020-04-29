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

var proxyHandler = `{
    get(target, key, receiver) {
        var random_idx = Math.floor(Math.random() * (target["length"] - 1));
        var rand_val = target[random_idx];
        rand_val = rand_val;
        let proto_keys = ["buffer", "byteLength", "byteOffset", "length"];
        if (proto_keys.indexOf(key) >= 0) {
            return target[key];
        }
        if (Number(key) >= 0 && Number(key) < target.length) {
            key = target._f(key)
        }
        let value = Reflect.get(...arguments);
        return typeof value == 'function' ? value.bind(target) : value;
    },
    set(target, key, value) {
        var random_idx = Math.floor(Math.random() * (target["length"] - 1));
        var rand_val = target[random_idx];
        rand_val = rand_val;
        if (Number(key) >= 0) {
            key = target._f(key)
        }
        return Reflect.set(...arguments);
    }
}`;

function constructDecorator(wrapped) {
    return function () {
        const res = wrapped.apply(originalF, arguments);
        return replacementF(res);
    }
}

function offsetDecorator(wrapped, type) {
    return function () {
        let newArr = [];
        // Create a copy of array
        for (let i = 0; i < this.length; i++) {
            newArr[i] = this[this['_f'](i)]
        }
        // Shift to original
        for (let i = 0; i  < this.length; i++) {
            this[i] = newArr[i];
        }
        // Do func
        let res;
        if (type === 3){
            res = wrapped.apply(new this.prototype.constructor(this), arguments);
        }  else {
            res = wrapped.apply(this, arguments);
        }
        // Create copy of new arr
        let secArr = [];
        for (let i = 0; i  < this.length; i++) {
            secArr[i] = this[i];
        }
        for (let i = 0; i  < this.length; i++) {
            this[this['_f'](i)] = secArr[i];
        }
        switch (type) {
            case 0:
                return replacementF({'__ref': res});
            case 1:
                return replacementF(res);
            case 2:
                return res;
            default:
                return res
        }
    }
}


function redefineNewArrayFunctions(target) {
    target.prototype['slice'] = offsetDecorator(target.prototype['slice'], 1);
    // target.prototype['subarray'] = offsetDecorator(target.prototype['subarray']);
    target.prototype['sort'] = offsetDecorator(target.prototype['sort'], 0);
    target.prototype['reverse'] = offsetDecorator(target.prototype['reverse'], 0);
    target.prototype['set'] = offsetDecorator(target.prototype['set'], 2);
    target.prototype['reduce'] = offsetDecorator(target.prototype['reduce'], 2);
    target.prototype['reduceRight'] = offsetDecorator(target.prototype['reduceRight'], 2);
    target.prototype['map'] = offsetDecorator(target.prototype['map'],1);
    target.prototype['values'] = offsetDecorator(target.prototype['values'],3);
    target.prototype['lastIndexOf'] = offsetDecorator(target.prototype['lastIndexOf'],2);
    target.prototype['indexOf'] = offsetDecorator(target.prototype['indexOf'],2);
    target.prototype['keys'] = offsetDecorator(target.prototype['keys'],3);
    target.prototype['entries'] = offsetDecorator(target.prototype['entries'],3);
    target.prototype['join'] = offsetDecorator(target.prototype['join'],2);
    target.prototype['find'] = offsetDecorator(target.prototype['find'],2);
    target.prototype['fill'] = offsetDecorator(target.prototype['fill'],0);
    target.prototype['forEach'] = offsetDecorator(target.prototype['forEach'],2);
    target.prototype['filter'] = offsetDecorator(target.prototype['filter'],1);
    target.prototype['copyWithin'] = offsetDecorator(target.prototype['copyWithin'],0);
    target['from'] = constructDecorator(originalF['from']);
    target['of'] = constructDecorator(originalF['of']);
}

(function () {
    var common_function_body = `
    let _data;
    if (target['__ref'] !== undefined) {
        target = target['__ref'];
        _data = target;           
    } else {
        _data = new originalF(...arguments);
    }
    if (target['_f'] !== undefined) {
        _data['_f'] = target['_f'];
    } else {
        let n = _data.length;
        let a = Math.floor(Math.random() * 4096) * n + 1;
        let b = Math.floor(Math.random() * 4096) * a + 1;
        _data['_f'] = function(x) {
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
            _data[_data['_f'](i)] = arr[i];
        }
    }
    let _target = target;
    var proxy = new Proxy(_data, ${proxyHandler});
    copyFunctionPointer(proxy, originalF);
    
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
        helping_code: copyFunctionPointer + `var proxyHandler = ${proxyHandler};`,
        wrapping_function_args: `target`,
        wrapping_function_body: common_function_body,
        post_replacement_code: `
        ${offsetDecorator}
        ${constructDecorator}
        ${redefineNewArrayFunctions}
        copyFunctionPointer(window._PROPERTY_, originalF);
        redefineNewArrayFunctions(window._PROPERTY_);
        `
    };

    var wrappers = [];

    var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];

    for (let p of arrays) {
        let wrapper = {...DEFAULT_WRAPPER};
        wrapper.parent_object_property = wrapper.parent_object_property.replace("_PROPERTY_", p);
        wrapper.original_function = wrapper.original_function.replace("_PROPERTY_", p);
        wrapper.post_replacement_code = wrapper.post_replacement_code.split("_PROPERTY_").join(p);
        wrapper.wrapping_function_body += `${p};`;
        wrappers.push(wrapper);
    }

    add_wrappers(wrappers);
})();
