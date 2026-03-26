/** @licstart  The following is the entire license notice for the
 *  JavaScript code in this page
 *
 *   Copyright (C) 2021 Manufactura Independente
 *
 *   The JavaScript code in this page is free software: you can
 *   redistribute it and/or modify it under the terms of the GNU
 *   General Public License (GNU GPL) as published by the Free Software
 *   Foundation, either version 3 of the License, or (at your option)
 *   any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or FITNESS
 *   FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *   As additional permission under GNU GPL version 3 section 7, you
 *   may distribute non-source (e.g., minimized or compacted) forms of
 *   that code without the copy of the GNU GPL normally required by
 *   section 4, provided you include this license notice and a URL
 *   through which recipients can access the Corresponding Source.
 *
 *  @licend  The above is the entire license notice
 *  for the JavaScript code in this page.
 */

const browser = window.bowser.getParser(window.navigator.userAgent);
const browserName = browser.getBrowserName();
const buttons = {
  firefox: document.querySelector('#download-firefox'),
  chrome: document.querySelector('#download-chrome'),
  opera: document.querySelector('#download-opera'),
}
if (browserName == 'Firefox') {
  buttons.chrome.remove();
  buttons.opera.remove();
} else if (browserName.startsWith('Chrom')) {
  buttons.firefox.remove();
  buttons.opera.remove();
} else if (browserName.startsWith('Opera')) {
  buttons.firefox.remove();
  buttons.chrome.remove();
}
