/** \file
 * \brief Mocks NSCL capabilities for testing environment
 *
 *  \author Copyright (C) 2026  Libor Polčák
 *  \author Copyright (C) 2020-2024 Giorgio Maone <https://maone.net>
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
 * Mock NSCL CachedStorage
 *
 * This is an in-memory implementation based on the original implementation in NSCL.
 */
global.CachedStorage = {
	async init(properties = null,
		         nameSpace = "",
		         scope = globalThis,
		         storageType = "session") {
		Object.assign(scope, properties);
		return scope;
	},

	async save(scope = globalThis, defer = false) {
		return Promise.resolve(true);
	}
};
