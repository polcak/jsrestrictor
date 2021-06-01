//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Matus Svancar
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

var Hashes = {
  sessionHash: gen_random64().toString(),
  visitedDomains: {},
  getFor(url) {
    if (!url.origin) url = new URL(url);
	  let {origin} = url;
    let domainHash = this.visitedDomains[origin];
	  if (!domainHash) {
		  domainHash = this.visitedDomains[origin] = generateId();
	  }
    return {
      sessionHash: this.sessionHash,
      domainHash,
    };
  }
};
