/** \file
 * \brief Code that handles NBS options specific to Firefox
 *
 *  \author Copyright (C) 2023  Libor Polcak
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

var fragment = document.createRange().createContextualFragment(`
		<p class="nbs_description">If you are using an HTTP proxy, NBS would protect the local network of the proxy instead of your network as the proxy perfroms the HTTP requests to the destinations. To prevent DNS leaks of your queries initiated from this computer, Network Boundary Shield does not resolve the DNS domains to detect possible cross network boundaries requests. However, Network Boundary Shield protects the local network of the proxy for directly embedded IP addresses. Hence, Network Boundary Shield protects the local network of the proxy from accessing local network only partially.</p>
			 `);
var last_nbs_description = document.querySelector("#proxy-protection-config .nbs_description:last-of-type");
last_nbs_description.parentNode.insertBefore(fragment, last_nbs_description);
