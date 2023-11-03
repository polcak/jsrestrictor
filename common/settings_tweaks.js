/** \file
 * \brief Fine-tuning of the JShelter settings, for example, based on domains
 *
 *  \author Copyright (C) 2023  Libor Polcak
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

/// Tweaks for specific domains that are built-in for all users
var tweak_domains_builtin = {
	"docs.google.com": {
		"explanation": "https://pagure.io/JShelter/webextension/issue/122",
		"level_id": ["1", "2"],
		"tweaks": {
			"webworker": 2
		}
	},
	"app.mediafire.com": {
		"explanation": "https://github.com/polcak/jsrestrictor/issues/207",
		"level_id": ["1", "2"],
		"tweaks": {
			"webworker": 2
		}
	},
};

// TODO: implement the possibility of community-currated lists of exceptions
// See https://pagure.io/JShelter/webextension/issue/20

// Merge built-in and community-currated exceptions
/// All domain tweaks that are not created by the local user. Usually, you should
/// work with tweak_domains outside of this file and not the partial content like
/// tweak_domains_builtin.
var tweak_domains = tweak_domains_builtin;
