/** \file
 * \brief WebExtension benchmarking configuration
 *
 *  \author Copyright (C) 2023  Martin Zmitko
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

import chromeLauncher from 'chrome-launcher';

// Urls to benchmark
const urls = [
    'https://google.com',
    'https://facebook.com',
    'https://youtube.com',
    'https://microsoft.com',
    'https://twitter.com',
    'https://baidu.com',
    'https://cloudflare.com',
    'https://instagram.com',
    'https://netflix.com',
    'https://apple.com',
    'https://linkedin.com',
    'https://amazon.com',
    'https://bilibili.com',
    'https://wikipedia.org',
    'https://qq.com',
    'https://live.com',
    'https://yahoo.com',
    'https://bing.com',
    'https://office.com',
    'https://github.com',
    'https://reddit.com',
    'https://pinterest.com',
    'https://wordpress.org',
    'https://whatsapp.com',
    'https://pg.com',
    'https://mail.ru',
    'https://zoom.us',
    'https://adobe.com',
    'https://yandex.ru',
    'https://vimeo.com',
    'https://openai.com',
    'https://gandi.net',
    'https://taobao.com',
    'https://bit.ly',
    'https://vk.com',
    'https://intuit.com',
    'https://tiktok.com',
    'https://msn.com',
    'https://mozilla.org',
    'https://weibo.com',
    'https://blogspot.com',
    'https://spotify.com',
    'https://icloud.com',
    'https://paypal.com',
    'https://tumblr.com',
    'https://nih.gov',
    'https://jd.com',
    'https://health.mil',
    'https://skype.com',
    'https://canva.com',
];

// Number of times to benchmark each URL with every extension
const runCount = 7;

// Lighthouse audits to run (minimal spec for performance metric)
const audits = [
    'first-meaningful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
];

// Lighthouse configuration
const lighthouse = {
    extends: 'lighthouse:default',
    settings: {
        onlyAudits: audits,
        disableFullPageScreenshot: true,
        throttlingMethod: 'provided', // No throttling
        cpuSlowdownMultiplier: 1, // No throttling
        formFactor: 'desktop',
        screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false,
        },
    },
};

// Print output JSON to console by default
const stdout = true;

// Chrome configuration flags helper for launching Chrome with extensions
const flags = {
    // Chrome is launched with restricted features by default, remove disable-extensions flag
    defaultFlags: chromeLauncher.Launcher.defaultFlags().filter(flag => flag !== '--disable-extensions'),
    // Get flags for loading an extension from a directory
    getExtensionFlags(extensionPath) {
        return this.defaultFlags.concat(`--load-extension=${extensionPath}`);
    },
};

export {urls, audits, lighthouse, runCount, flags, stdout};
