function load_config_to_text() {
	browser.storage.sync.get(null).then(function (item) {
		document.getElementById("levels-storage-text").value = JSON.stringify(item, null, '\t');
	});
}

window.addEventListener("DOMContentLoaded", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-load").addEventListener("click", function() {
	load_config_to_text();
});

document.getElementById("levels-storage-save").addEventListener("click", function() {
	checkAndSaveConfig(JSON.parse(document.getElementById("levels-storage-text").value));
	load_config_to_text();
});
