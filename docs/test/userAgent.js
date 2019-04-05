function getUserAgent() {
	// why sometimes values are not spoofed? need to refresh values again? cached values?
		var txt = "";
		txt += "<p>User-agent header: " + window.navigator.userAgent + "</p>";
		txt += "<p>Browser Version: " + window.navigator.appVersion + "</p>";
		txt += "<p>Platform: " + window.navigator.platform + "</p>";
		txt += "<p>Vendor: " + window.navigator.vendor + "</p>";
		txt += "<p>Browser Language: " + window.navigator.language + "</p>";
		txt += "<p>Browser Languages: " + window.navigator.languages + "</p>";
		txt += "<p>Cookies Enabled: " + window.navigator.cookieEnabled + "</p>";
		txt += "<p>DoNotTrack status: " + window.navigator.doNotTrack + "</p>";
		document.getElementById("user-agent").innerHTML = txt;
	// if not setTimeout, navigator sometimes return real info because wrapping script is not fast enough or what ???
	// setTimeout(function(){ 
	// 	var txt = "";
	// 	txt += "<p>User-agent header: " + window.navigator.userAgent + "</p>";
	// 	txt += "<p>Browser Version: " + window.navigator.appVersion + "</p>";
	// 	txt += "<p>Platform: " + window.navigator.platform + "</p>";
	// 	txt += "<p>Browser Language: " + window.navigator.language + "</p>";
	// 	txt += "<p>Browser Languages: " + window.navigator.languages + "</p>";
	// 	txt += "<p>Cookies Enabled: " + window.navigator.cookieEnabled + "</p>";
	// 	txt += "<p>DoNotTrack status: " + window.navigator.doNotTrack + "</p>";
	// 	document.getElementById("user-agent").innerHTML = txt;
	// }, 100);
}

