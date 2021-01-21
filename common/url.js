//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: Copyright (C) 2018  Zbynek Cervinka
// SPDX-FileCopyrightText: Copyright (C) 2019  Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-FileCopyrightText: Copyright (C) 2019  Martin Timko
// SPDX-License-Identifier: GPL-3.0-or-later


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
