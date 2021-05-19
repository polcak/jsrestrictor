//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2021  Marek Saloň
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
 *
 * \brief This file is part of Fingerprinting Detection (FPD) and represents proxy between page script and background script.
 * This content script is injected into all frames to be able clear them all.
 * Only top level content script recieves logging messages from page script.
 *
 * \ingroup FPD
 */

/**
 * Event listener subscribed to window that recieves page script messages.
 *
 * \param type Type of event to listen.
 * \param callback Function that checks recieved message and proxies it to background script.
 */
window.addEventListener("message", function (event) { 
    if (event.data && event.data.enabled && event.data.purpose == "fp-detection") {
        // catch out of context messages when extension is reloaded
        try {
            browser.runtime.sendMessage(event.data);
        }
        catch {}
    }
});

/**
 * Event listener that listens for background script messages.
 *
 * \param callback Function that clears localStorage and sessionStorage.
 */
browser.runtime.onMessage.addListener(function (message) {
    if (message.cleanStorage) { 
        localStorage.clear();
        sessionStorage.clear();
    }
});