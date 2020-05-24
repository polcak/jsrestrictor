param (
	[Parameter(Position=0)]
	[String]
	$makeCmd
)


function Firefox {
	Copy-Item "firefox_manifest\manifest.json" -Destination "." -Force
	$compressParams = @{
		Path = "img", "LICENSE", "manifest.json", "background.js", "document_start.js", "options.js", "options.css", "options.html", "popup.js", "popup.css", "popup.html"
		DestinationPath = "firefox_JSR.zip"
	}
	Compress-Archive @compressParams -Force
	Remove-Item "manifest.json" -Force
	Write-Output "Firefox zip extension exported -> firefox_JSR.zip"
}


function FirefoxUnzip {
	Expand-Archive -Path "firefox_JSR.zip" -destinationpath "firefox_JSR" -Force
	Write-Output "Firefox dir extension exported -> Firefox_JSR/"
}


function Chrome {
	Copy-Item "chrome_manifest\manifest.json" -Destination "." -Force
	$compressParams = @{
		Path = "img", "LICENSE", "manifest.json", "background.js", "document_start.js", "options.js", "options.css", "options.html", "popup.js", "popup.css", "popup.html"
		DestinationPath = "chrome_JSR.zip"
	}
	Compress-Archive @compressParams -Force
	Remove-Item "manifest.json" -Force
	Write-Output "Chrome zip extension exported  -> chrome_JSR.zip"
}


function ChromeUnzip {
	Expand-Archive -Path "chrome_JSR.zip" -destinationpath "chrome_JSR" -Force
	Write-Output "Chrome dir extension exported  -> chrome_JSR/"
}


function Clean {
	Remove-Item "firefox_JSR.zip" -Recurse -Force -ErrorAction Ignore
	Remove-Item "firefox_JSR" -Recurse -Force -ErrorAction Ignore
	Remove-Item "chrome_JSR.zip" -Recurse -Force -ErrorAction Ignore
	Remove-Item "chrome_JSR" -Recurse -Force -ErrorAction Ignore
}


if ($makeCmd -eq "clean") {
	Clean
}
else {
	Firefox
	Chrome
	FirefoxUnzip
	ChromeUnzip
}