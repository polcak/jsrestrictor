//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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


/*
 * The following code was originaly part of Privacy Badger <https://www.eff.org/privacybadger>
 * https://github.com/EFForg/privacybadger/blob/master/src/js/utils.js
 * Copyright (C) 2014 Electronic Frontier Foundation
 *
 * Derived from Adblock Plus
 * Copyright (C) 2006-2013 Eyeo GmbH
 *
 * Privacy Badger is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Privacy Badger is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Privacy Badger.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Executes a script in the page's JavaScript context.
 *
 * This code is copied from EFF PrivacyBadger under GPL3.
 *
 * @param {String} text The content of the script to insert.
 * @param {Object} data Data attributes to set on the inserted script tag.
 */
window.injectScript = function (text, data) {
  var parent = document.documentElement,
    script = document.createElement('script');

  script.text = text;
  script.async = false;

  for (var key in data) {
    script.setAttribute('data-' + key.replace(/_/g, '-'), data[key]);
  }

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
};
