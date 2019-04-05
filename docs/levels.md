# Levels
### Level 0
* **Spoof user agent (inspired by Tor browser) --** *OFF*
* **Empty Referer HTTP webRequest & JS document.referrer --** *OFF*
* **Spoof browser language to: English only --** *OFF*
* **Set Do-Not-Track setting (navigator.doNotTrack) --** *OFF*
* **Reduce the time accuracy of "Date" object --** *OFF*
* **Reduce the "performance.now()" accuracy --** *OFF*
* **Protect against canvas fingerprinting: --** *OFF*
* **Reduce accuracy of geolocation data --** *OFF*
* **Spoof hardware information to the most popular HW --** *OFF* 
* **Set navigator.cookieEnabled value (experimental only) --** *OFF*
* **Filter XMLHttpRequest requests: (experimental only) --** *OFF*

### Level 1
* **Spoof user agent (inspired by Tor browser) --** *OFF*
* **Empty Referer HTTP webRequest & JS document.referrer --** *OFF*
* **Spoof browser language to: English only --** *OFF*
* **Set Do-Not-Track setting (navigator.doNotTrack) --** *ON*
    * Always: *yes*
* **Reduce the time accuracy of "Date" object --** *ON*
    * Round time to: *hundredths of a second (1.230)*
* **Reduce the "performance.now()" accuracy --** *ON*
    * Round "performance.now()" value to: *tens (1230)*
* **Protect against canvas fingerprinting: --** *OFF*
* **Reduce accuracy of geolocation data --** *ON*
    * Round location data to:
    * Latitude value in decimal degrees: *round to 2 decimals (12.34000)*
    * Longitude value in decimal degrees: *round to 2 decimals (12.34000)*
    * Altitude value in meters: *round to tens (1230)*
    * Latitude and longitude accuracy in meters: *round to tens (1230)*
    * Altitude accuracy in meters: *round to tens (1230)*
    * Heading (direction of device) in degrees: *round to tens (1230)*
    * Velocity of the device in meters per second: *round to tens (1230)*
* **Spoof hardware information to the most popular HW --** *ON* 
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2*
* **Set navigator.cookieEnabled value (experimental only) --** *OFF*
* **Filter XMLHttpRequest requests: (experimental only) --** *OFF*

### Level 2
* **Spoof user agent (inspired by Tor browser) --** *ON*
    * "User-Agent" HTTP web request & JS navigator.userAgent: *based on actual browser*
        * Firefox: *Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/66.0*
        * Chrome, Opera: *Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36*
    * JS navigator.vendor: *based on actual browser*
        * Firefox: *empty string*
        * Chrome, Opera: *Google Inc.*
    * JS navigator.platform: *Win32*
    * JS navigator.appVersion: *5.0 (Windows)*
    * JS navigator.oscpu: *undefined*
* **Empty Referer HTTP webRequest & JS document.referrer --** *ON*
    * "Referrer" HTTP web request & JS document.referrer: *empty string (make websites think we always go to them directly rather than being referred)*
* **Spoof browser language to: English only --** *OFF*
* **Set Do-Not-Track setting (navigator.doNotTrack) --** *ON*
    * Always: *yes*
* **Reduce the time accuracy of "Date" object --** *ON*
    * Round time to: *tenths of a second (1.200)*
* **Reduce the "performance.now()" accuracy --** *ON*
    * Round "performance.now()" value to: *hundreds (1200)*
* **Protect against canvas fingerprinting: --** *ON*
    * Canvas return white image data by modifiing canvas.toDataURL() function
* **Reduce accuracy of geolocation data --** *ON*
    * Round location data to:
    * Latitude value in decimal degrees: *round to 1 decimal place (12.30000)*
    * Longitude value in decimal degrees: *round to 1 decimal place (12.30000)*
    * Altitude value in meters: *round to hundreds (1200)*
    * Latitude and longitude accuracy in meters: *round to hundreds (1200)*
    * Altitude accuracy in meters: *round to hundreds (1200)*
    * Heading (direction of device) in degrees: *round to hundreds (1200)*
    * Velocity of the device in meters per second: *round to hundreds (1200)*
* **Spoof hardware information to the most popular HW --** *ON* 
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2* 
* **Set navigator.cookieEnabled value (experimental only) --** *OFF*
* **Filter XMLHttpRequest requests: (experimental only) --** *OFF*

### Level 3
* **Spoof user agent (inspired by Tor browser) --** *ON*
    * "User-Agent" HTTP web request & JS navigator.userAgent: *Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36*
    * JS navigator.vendor: *Google Inc.*
    * JS navigator.platform: *Win32*
    * JS navigator.appVersion: *5.0 (Windows)*
    * JS navigator.oscpu: *undefined*
* **Empty Referer HTTP webRequest & JS document.referrer --** *ON*
    * "Referrer" HTTP web request & JS document.referrer: *empty string (make websites think we always go to them directly rather than being referred)*
* **Spoof browser language to: English only --** *ON*
    * "Accept-Language" HTTP web request & JS navigator.language, navigator.languages: *en-US, en*
* **Set Do-Not-Track setting (navigator.doNotTrack) --** *ON*
    * Always: *yes*
* **Reduce the time accuracy of "Date" object --** *ON*
    * Round time to: *full seconds (1.000)*
* **Reduce the "performance.now()" accuracy --** *ON*
    * Round "performance.now()" value to: *thousands (1000)*
* **Protect against canvas fingerprinting: --** *ON*
    * Canvas return white image data by modifiing canvas.toDataURL() function
* **Reduce accuracy of geolocation data --** *ON*
    * Null all location data (all set to zero):
    * Latitude value in decimal degrees: *0*
    * Longitude value in decimal degrees: *0*
    * Altitude value in meters: *0*
    * Latitude and longitude accuracy in meters: *0*
    * Altitude accuracy in meters: *0*
    * Heading (direction of device) in degrees: *0*
    * Velocity of the device in meters per second: *0*
* **Spoof hardware information to the most popular HW --** *ON* 
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2* 
* **Set navigator.cookieEnabled value (experimental only) --** *OFF*
* **Filter XMLHttpRequest requests: (experimental only) --** *OFF*

### Custom level
* **Spoof user agent (inspired by Tor browser) --** *custom setting*
* **Empty Referer HTTP webRequest & JS document.referrer --** *custom setting*
* **Spoof browser language to: English only --** *custom setting*
* **Set Do-Not-Track setting (navigator.doNotTrack) --** *custom setting*
* **Reduce the time accuracy of "Date" object --** *custom setting*
* **Reduce the "performance.now()" accuracy --** *custom setting*
* **Protect against canvas fingerprinting: --** *custom setting*
* **Reduce accuracy of geolocation data --** *custom setting*
* **Spoof hardware information to the most popular HW --** *custom setting* 
* **Set navigator.cookieEnabled value (experimental only) --** *custom setting*
* **Filter XMLHttpRequest requests: (experimental only) --** *custom setting*

