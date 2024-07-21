/** \file
 * \brief A cache for session and domain hashes, used for Farbling
 *
 *  \author Copyright (C) 2021  Matus Svancar
 *  \author Copyright (C) 2021  Giorgio Maone
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
 * Object for generating and caching domain/session hashes
 * getFor method used to get domain hashes from given url
 *
 * \note cached visited domains with related keys are only deleted after end of the session
 */

// depends on /nscl/common/CachedStorage.js

var Hashes = {
	async getFor(url){
		let site = getSiteForURL(url);
		let {sessionHash, visitedDomains} = await CachedStorage.init({
			sessionHash: null,
			visitedDomains: {}
		}, "Hashes");
		this.sessionHash = sessionHash ??= gen_random64().toString();
		let siteHashes = visitedDomains[site];
		if (!siteHashes) {
			let hmac = sha256.hmac.create(this.sessionHash);
			hmac.update(site);
			const domainHash = hmac.hex();
			const hash = sha256.create();
			hash.update(JSON.stringify(domainHash));
			// Redefine the domainHash for incognito context:
			// Compute the SHA256 hash of the original hash so that the incognito hash is:
			// * significantly different to the original domainHash,
			// * computationally difficult to revert,
			// * the same for all incognito windows (for the same domain).
			const incognitoHash = hash.hex();
			visitedDomains[site] = siteHashes = {domainHash, incognitoHash};
			await CachedStorage.save(this);
		}
		return siteHashes;
	}
};

