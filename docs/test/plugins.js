// SPDX-FileCopyrightText: 2021 Matúš Švancár
//
// SPDX-License-Identifier: GPL-3.0-or-later

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
  setTimeout(function() {
    getPlugins();
  }, 100);
});
