/** \file
 * \brief Code that handles initialization in the options pages
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

// Make sure that updateLevels() is called while fp_levels_initialised is set to true
// Note that the options pages do not initialize real FPD. This is needed to call
// callbacks directly
fp_levels_initialised = true;
browser.storage.sync.get(null).then(updateLevels);
