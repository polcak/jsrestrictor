# The configuration of the extension

## Network Boundary Shield (NBS)

NBS is active independently on the levels defined below. If necessary, you can whitelist websites for which the NBS should be turned off. Generally, you want NBS to be active, however, some pages can be broken, because they require interaction between public Internet and local network, for example, some Intranet information systems might be broken by the NBS.

## Levels controlling JS-object wrapping

### Level 0
* *All functionality is disabled OFF*

### Level 1

* **Manipulate the time precision provided by Date, performance, and Geolocation API --** *ON*
    * Round time to: *hundredths of a second (1.230 -- Date, 1230 -- performance, Geolocation API)*
* **Protect against canvas fingerprinting --** *OFF*
* **List of microphones and cameras: --** *original*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property, e.g.
			Firefox)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*
* **Protect against ArrayBuffer exploitation --** *OFF*
* **Protect against SharedArrayBuffer exploitation --** *OFF*
* **Protect against WebWorker exploitation --** *OFF*
* **Limit Geolocation API --** *Use accuracy of hundreds of meters*
* **Disable Battery status API --** *ON*
* **window.name --** *Clear with each page load*
* **navigator.sendBeacon --** *Do not send anything and return true*

### Level 2
* **Manipulate the time precision provided by Date, performance, and Geolocation API --** *ON*
    * Round time to: *tenths of a second (1.200 -- Date, 1200 -- performance, Geolocation API)*
* **Protect against canvas fingerprinting: --** *ON*
    * Reading from canvas returns white image.
* **List of microphones and cameras: --** *EMPTY*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*
* **Protect against ArrayBuffer exploitation --** *OFF*
* **Protect against SharedArrayBuffer exploitation --** *OFF*
* **Protect against WebWorker exploitation --** *OFF*
* **Limit Geolocation API --** *Use accuracy of kilometers*
* **Disable Battery status API --** *ON*
* **window.name --** *Clear with each page load*
* **navigator.sendBeacon --** *Do not send anything and return true*

### Level 3
* **Manipulate the time precision provided by Date, performance, and Geolocation API --** *ON*
    * Round time to: *full seconds (1.000 -- Date, 1000 -- performance)*
		* *Randomize time*
* **Protect against canvas fingerprinting: --** *ON*
    * Reading from canvas returns white image.
* **List of microphones and cameras: --** *EMPTY*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests: --** *confirm requests but do not block*
* **Protect against ArrayBuffer exploitation --** *ON*
    * *Use random mapping of array indexing to memory*
* **Protect against SharedArrayBuffer exploitation --** *ON*
    * *Block SharedArrayBuffer* -- SharedArrayBuffer provided by the browser is not available to page scripts at all.
* **Protect against WebWorker exploitation --** *ON*
    * *Remove real parallelism* -- Use Worker polyfill instead of the native Worker.
* **Limit Geolocation API --** *Disabled*
* **Disable Battery status API --** *ON*
* **window.name --** *Clear with each page load*
* **navigator.sendBeacon --** *Do not send anything and return true*

