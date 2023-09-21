/** \file
 * \brief Simple functions that can be used by the extension
 *
 *  \author Copyright (C) 2020  Libor Polcak
 *  \author Copyright (C) 2021  Matus Svancar
 * 	\author Copyright (C) 2022  Marek Salon
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

function escape(str) {
	var map =	{
		'"': '&quot;',
		"'": '&#039;',
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};
	return str.replace(/["'&<>]/g, (c) =>  map[c]);
}

/**
 * Get a property of an object, create it if it does not exist
 */
function get_or_create(parent, child, default_value) {
	let obj = parent[child] || default_value;
	parent[child] = obj;
	return obj;
}

/**
 * Transform byte to Hex value
 */
function byteToHex(byte) {
  return ('0' + byte.toString(16)).slice(-2);
}

/**
 * Generate random 32-bit number.
 */
function gen_random32() {
	var array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0];
}

/**
 * Generate random 64-bit number.
 */
function gen_random64() {
  var array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  return BigInt("" + array[0] + array[1]);
}

/**
 * Generate random hash - default length is 32 bytes.
 */
function generateId(len = 32) {
  var arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, byteToHex).join("");
}

/**
 * Parses given URL and converts it to a string that can be used to obtain JShelter settings for the
 * page. For example, removes "www." at the beginning of the given hostname.
 *
 * www.fit.vutbr.cz -> fit.vutbr.cz
 * merlin.fit.vutbr.cz -> merlin.fit.vutbr.cz
 * example.co.uk -> example.co.uk
 */
function getEffectiveDomain(url) {
	let u = new URL(url);
	if (u.protocol === "file:") {
		return u.protocol;
	}
	return String(u.hostname).replace(/^www\./,'');
}

/**
 * Parses given URL and converts to eTLD+1.
 * page.
 *
 * www.fit.vutbr.cz -> vutbr.cz
 * example.co.uk -> example.co.uk
 */
function getSiteForURL(url) {
	try {
		let u = new URL(url);
		if (u.hostname) {
			return tld.getDomain(u.hostname);
		}
		else if (u.protocol) {
			return u.protocol;
		}
	} catch (e) {
		// intentionally empty
	}
	return "";
}

/**
 * \brief shifts number bits to pick new number
 * \param v BigInt number to shift
 */
function lfsr_next(v) {
	return BigInt.asUintN(64, ((v >> 1n) | (((v << 62n) ^ (v << 61n)) & (~(~0n << 63n) << 62n))));
}
/**
 * \brief generates pseudorandom string based on domain key
 * \param length Number length of generated string
 * \param charSetEnum Number enum choosing charset
 */
function randomString(length, charSetEnum, prng) {
	var ret = "";
	var charSets = ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ ", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"];
	var charSet = charSets[charSetEnum];
	for ( var i = 0; i < length; i++ ) {
			ret += charSet.charAt(Math.floor(prng() * charSet.length));
	}
	return ret;
}
/** \brief shuffle given array according to domain key
 * \param array input array
 *
 * Fisher–Yates shuffle algorithm - Richard Durstenfeld's version
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(prng() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
	}
}
/**
 * \brief makes number from substring of given string - should work as reinterpret_cast
 * \param str String
 * \param length Number specifying substring length
 */
function strToUint(str, length){
	var sub = str.substring(0,length);
	var ret = "";
	for (var i = sub.length-1; i >= 0; i--) {
			ret += ((sub[i].charCodeAt(0)).toString(2).padStart(8, "0"));
	}
	return "0b"+ret;
};

/**
 * \brief Asynchronously sleep for given number of milliseconds
 * \param ms Number of milliseconds to sleep
 */
async function async_sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}


/**
 * \brief Observable desing patter implementation.
 *
 *  All observers notified with each change.
 */
function Observable() {
	Object.defineProperty(this, "observers", {
		value: [],
		writable: true,
		configurable: true,
		enumerable: false});
};
Observable.prototype = {
	/**
	 * \brief Notifies all observers
	 *
	 * \param notification An object passed to each observer.
	 */
	update: function(...args) {
		for (o of this.observers) {
			o.notify(...args);
		}
	},
	/**
	 * Adds an observer.
	 *
	 * \param observer An object implementing notify();
	 */
	add_observer: function(observer) {
		this.observers.push(observer);
	},
	remove_observer: function(observer) {
		const index = this.observers.indexOf(observer);
		if (index > -1) {
			array.splice(index, 1);
		}
	}
};

/**
 * Return beginning sentences from a long description
 *
 * \param text The original text
 * \param limit The suggested maximal length of the returned text
 *
 * \return A sentence or more sentences from the begining of the text
 *
 * Do not return information in parentheses. Always return at least one sentense. Return as much
 * sentences as possible upto the LIMIT.
 */
function create_short_text(text, LIMIT) {
	if (text.length > LIMIT) {
		let remove_parentheses = / \([^)]*\)/;;
		text = text.replace(remove_parentheses, "");
		let sentences = text.split(".");
		sentences = sentences.map(s => s + ".");
		let done = false;
		text = sentences.reduce(function (acc, current) {
			if (!done) {
				if ((acc.length + current.length) <= LIMIT) {
					return acc + current;
				}
				else {
					done = true;
				}
			}
			return acc;
		});
	}
	return text;
}

/**
 * Helper function that modifies settings after manual removal of optional permissions.
 *
 * \param permissions Array of removed permissions.
 * \param settings Object of current module settings.
 * \param definition Object of module settings definition.
 */
function correctSettingsForRemovedPermissions(permissions, settings, definition) {
	for (let [name, value] of Object.entries(settings)) {
		if (definition[name]) {
			let option = definition[name].params[value];
			while (value >= 0) {
				if (!option.permissions || !option.permissions.filter(value => permissions.includes(value)).length) {
					settings[name] = value;
					break;
				}
				value -= 1;
			}
		}
	}
}

/**
 * The function for reading a locally stored file.
 *
 * \param _path String with a fully-qualified URL. E.g.: moz-extension://2c127fa4-62c7-7e4f-90e5-472b45eecfdc/beasts/frog.dat
 *
 * \returns promise for returning content of the file as a string.
 */
 let readFile = (_path) => {
	return new Promise((resolve, reject) => {
		//Fetching locally stored file in same-origin mode
		fetch(_path, {mode:'same-origin'})
			.then(function(_res) {
				//Return data as a blob
				return _res.blob();
			})
			.then(function(_blob) {
				var reader = new FileReader();
				//Wait until the whole file is read
				reader.addEventListener("loadend", function() {
					resolve(this.result);
				});
				//Read blob data as text
				reader.readAsText(_blob);
			})
			.catch(error => {
				reject(error);
			});
	});
};
