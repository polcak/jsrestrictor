// SPDX-FileCopyrightText: 2019 Martin Timko
//
// SPDX-License-Identifier: GPL-3.0-or-later

function updatePerformanceLabel() {
  // getHW();
  // getUserAgent();
  var curPerValue = window.performance.now();
  document.getElementById("current-performance").innerHTML = curPerValue;
}

function updatePerformanceLabelEvery(intervalDuration) {
  var myInterval = setInterval(function(){ updatePerformanceLabel(); }, intervalDuration);
}
