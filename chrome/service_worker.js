/** \file
 * \brief Stub service worker including all the background scripts
 *
 *  \author Copyright (C) 2019  Libor Polcak
 *  \author Copyright (C) 2019  Martin Timko
 *  \author Copyright (C) 2023  Martin Zmitko
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
importScripts(
  "nscl/lib/browser-polyfill.js",
  "lib/sha256.js",
  "nscl/common/CachedStorage.js",
  "nscl/common/log.js",
  "nscl/common/uuid.js",
  // "nscl/common/SyncMessage.js",
  "nscl/common/tld.js",
  "nscl/service/DocStartInjection.js",
  "nscl/service/TabCache.js",
  "nscl/service/NavCache.js",
  "helpers.js",
  "session_hash.js",
  "update.js",
  "url.js",
  "settings_tweaks.js",
  "levels.js",
  "fp_levels.js",
  "fp_detect_background.js",
  "background.js",
  "level_cache.js",
  //"http_shield_chrome.js",
  //"http_shield_common.js"
);
