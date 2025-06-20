/** \file
 * \brief JS code that retrieves all HTML files with data-localize attributes and localizes them
 *
 *  \author Copyright (C) 2022  TotalCaesar659
 *  \author Copyright (C) 2025  Libor Polčák
 *
 *  See https://github.com/polcak/jsrestrictor/pull/189 for the origins of the code.
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

function localizeHTMLelement(e) {
	const translateStringName = e.dataset.localize;
	if (translateStringName) {
		const translated = browser.i18n.getMessage(translateStringName);
		if (translated) {
			if (e.hasAttribute("htmltranslation")) {
				e.innerHTML = translated;
			}
			else {
				e.innerText = translated;
			}
		}
	}
}

const textElements = document.querySelectorAll('[data-localize]');
textElements.forEach(localizeHTMLelement);

function localizeIssue166Element(e) {
	let version = Number(navigator.userAgent.match(/(Chrome|Chromium)\/([0-9]+)/)?.[2]);
	let translated = "Untranslated";
	if (version >= 138) {
	  // Allow User Scripts toggle will be used.
		translated = browser.i18n.getMessage("MV3AllowUserScriptsRequired");
	} else {
	  // Developer mode toggle will be used.
		translated = browser.i18n.getMessage("MV3DevmodeRequired");
	}
	e.innerHTML = translated;
}

const issue166Elements = document.querySelectorAll('[issue166-localize]');
issue166Elements.forEach(localizeIssue166Element);

const templates = document.getElementsByTagName("template");
for (t of templates) {
	t.content.querySelectorAll('[data-localize]').forEach(localizeHTMLelement);
}
