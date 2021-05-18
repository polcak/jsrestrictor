function getUserAgent(){
  var userAgent = navigator.userAgent;
  var appVersion = navigator.appVersion;
  var vendor = navigator.vendor;
  var doNotTrack = navigator.doNotTrack? "True": "False";
  document.getElementById('userAgent').innerHTML += userAgent;
  document.getElementById('appVersion').innerHTML += appVersion ;
  document.getElementById('browserVendor').innerHTML += vendor ;
  document.getElementById('doNotTrack').innerHTML += doNotTrack;

}

function getPlugins(){
  var plugins = navigator.plugins;
  var mimeTypes = navigator.mimeTypes;
  var ul = document.getElementById('pluginList');
  for(var i = 0; i<plugins.length;i++){
    var plugin = plugins[i];
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(plugin.name+" "+plugin.filename+" "+plugin.description));
    ul.appendChild(li);
  }
  var ul = document.getElementById('mimeTypeList');
  for(var i = 0; i<mimeTypes.length;i++){
    var mime = mimeTypes[i];
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(mime.type+" "+mime.suffixes+" "+mime.description));
    ul.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getUserAgent();
  setTimeout(function() {
    getPlugins();
  }, 100);
});
