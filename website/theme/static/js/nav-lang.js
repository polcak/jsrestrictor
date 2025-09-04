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


// mobile navigation
var navBurger = document.getElementsByClassName('navbar-burger')[0];
var sidebarNav = document.getElementsByClassName('sidebar')[0];
var sidebarOverlay = document.getElementsByClassName('sidebar-overlay')[0];

navBurger.onclick = function() {
  navBurger.classList.toggle('is-active');
  sidebarNav.classList.toggle('is-shown');
  sidebarOverlay.classList.toggle('is-shown');
}

// language dropdown setup
function setSelectedValue(selectObj, valueToSet) {
  for (var i = 0; i < selectObj.options.length; i++) {
    if (selectObj.options[i].value == valueToSet) {
      selectObj.options[i].selected = true;
      return;
    }
  }
}
var selectDropdown = document.getElementById('language-selector');
// get active language from URL and make that the selected option
var pageLang = window.location.pathname.split('/').filter(n => n)[0];
if (pageLang && pageLang.length == 2) {
  setSelectedValue(selectDropdown, pageLang);
}
// redirect when another language is selected
selectDropdown.addEventListener('change', function (e) { 
  lang = selectDropdown.options[selectDropdown.selectedIndex].value;
  if (lang === "en") {
    window.location.href = '/';
  } else {
    window.location.href = '/' + lang + '/';
  }
});

