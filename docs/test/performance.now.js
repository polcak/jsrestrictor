function updatePerformanceLabel() {
  var curPerValue = window.performance.now();
  document.getElementById("current-performance").innerHTML = curPerValue;
}

function updatePerformanceLabelEvery(intervalDuration) {
  var myInterval = setInterval(function(){ updatePerformanceLabel(); }, intervalDuration);
}
