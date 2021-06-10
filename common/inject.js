/** \file
 * \brief Inject code to page scripts
 *
 *  \author Copyright (C) 2019  Libor Polcak
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
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//


/**
 * Execute given script in the page's JavaScript context.
 *
 * This function is a modified version of the similar function from
 * Privacy Badger <https://www.eff.org/privacybadger>
 * https://github.com/EFForg/privacybadger/blob/master/src/js/utils.js
 * \copyright Copyright (C) 2014 Electronic Frontier Foundation
 *
 * Derived from Adblock Plus
 * \copyright Copyright (C) 2006-2013 Eyeo GmbH
 *
 * Privacy Badger is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * @param {String} text The content of the script to insert.
 */
window.injectScript = function (text) {
  var parent = document.documentElement;
  var script = document.createElement('script');

  script.text = text;
  script.async = false;

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
};

