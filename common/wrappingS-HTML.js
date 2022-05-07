/** \file
 * \brief This file contains wrapper that clears the window.name property
 *
 * \see https://developer.mozilla.org/en-US/docs/Web/API/Window/name
 *
 *  \author Copyright (C) 2020  Martin Bednar, Libor Polcak
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

/** \file
 * \ingroup wrappers
 *
 * `window.name` provides a simple cross-origin tracking method of the same tab:
 *
 * ```js
 * window.name = "8pdRoEaQCpsjtC8w07dOy7xwXjXrHDyxxmPWBUxQKrh7xfJ4SYFH8QClp6U9T+Ypa8IEa5AwFw3x"
 * ```
 *
 * Go to completely different web site and window.name stays the same.
 *
 * \see https://2019.www.torproject.org/projects/torbrowser/design/ provides a library build on
 * top of `window.name`: https://www.thomasfrank.se/sessionvars.html.
 *
 * \see https://html.spec.whatwg.org/#history-traversal; this feature should not be ncessary
 * for Firefox 86 or newer https://bugzilla.mozilla.org/show_bug.cgi?id=444222.
 */

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "window",
			parent_object_property: "name",
			wrapped_objects: [],
			helping_code: "/* window.name = ''; */", // we actually do this  in level_cache.js on eTLD+1 domain changes
		},
	]
	add_wrappers(wrappers);
})()
