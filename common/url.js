//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2019  Martin Timko
//  Copyright (C) 2018  Zbynek Cervinka
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
 *
 * @returns List of strings representing all subdomains, TLD excluded. The
 * list starts with the most generic domain and continues with the more and
 * more specific domains. For example, www.fit.vutbr.cz -> [ "vutbr.cz",
 * "fit.vutbr.cz", "www.fit.vutbr.cz" ] 
 */
function extractSubDomains(thisDomain) {
    var splitArr = thisDomain.split('.');
    var arrLen = splitArr.length;
    //extracting the root domain here
    //if there is a subdomain
    if (arrLen > 2) {
        thisDomain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (e.g. ".co.uk")
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            //this is using a ccTLD
            splitArr[arrLen - 2] += '.' + splitArr[arrLen - 1];
            splitArr.pop();
            arrLen -= 1
        }
        let domains = [];
        let subDomain = splitArr[arrLen - 1];
        for (let i = arrLen - 2; i >= 0; i--) {
            subDomain = splitArr[i] + '.' + subDomain;
            domains.push(subDomain);
        }
        return domains;
    }
    return [thisDomain];
}
