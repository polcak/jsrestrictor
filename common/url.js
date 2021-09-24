/** \file
 * \brief Functions that handles working with URLs
 *
 *  \author Copyright (C) 2018  Zbynek Cervinka
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
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


/**
 * Get all sub domains for a domain.
 *
 * @param thisDomain Domain name string, e.g. www.fit.vutbr.cz
 *                   IPv4 address, e.g. 147.229.9.23
 *                   IPv6 address, e.g. 2001:67c:1220:809::93e5:917
 *
 * @returns List of strings representing all subdomains, including TLD. The
 * list starts with the most generic domain and continues with the more and
 * more specific domains. For example, www.fit.vutbr.cz -> [ "cz", "vutbr.cz",
 * "fit.vutbr.cz", "www.fit.vutbr.cz" ] 
 */
function extractSubDomains(thisDomain) {
	var splitArr = thisDomain.split('.');
	var arrLen = splitArr.length;
	// Check if the string is an IPv4 address
	if (arrLen == 4) {
		let correct = true; // initial value
		try {
			for (num of splitArr) {
				let octet = Number(num);
				if (octet !== octet /* NaN */ || octet < 0 || octet > 255) {
					correct = false;
				}
			}
		}
		catch (error) {
			correct = false;
		}
		if (correct === true) {
			return [thisDomain]; // It is an IPv4 address
		}
	}
	// Ignore the trailing "."
	if (splitArr[arrLen - 1] === "") {
		splitArr.pop();
		arrLen -= 1;
	}
	if (arrLen === 0) {
		return [""];
	}
	// Create the list of subdomains
	let domains = [];
	let subDomain = splitArr[arrLen - 1];
	domains.push(subDomain);
	for (let i = arrLen - 2; i >= 0; i--) {
		subDomain = splitArr[i] + '.' + subDomain;
		domains.push(subDomain);
	}
	return domains;
}
