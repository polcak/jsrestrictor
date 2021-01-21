//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later



/**
 * Execute given script in the page's JavaScript context.
 *
 * This function is a modified version of the similar function from
 * Privacy Badger <https://www.eff.org/privacybadger>
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

