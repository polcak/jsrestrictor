# Levels
### Level 0
* **Reduce the time accuracy of "Date" object and performance API --** *OFF*
* **Protect against canvas fingerprinting --** *OFF*
* **Spoof hardware information to the most popular HW --** *OFF*
* **Filter XMLHttpRequest requests --** *OFF*

### Level 1
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *hundredths of a second (1.230 -- Date, 1230 -- performance)*
* **Protect against canvas fingerprinting: --** *OFF*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*

### Level 2
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *tenths of a second (1.200 -- Date, 1200 -- performance)*
* **Protect against canvas fingerprinting: --** *ON*
    * Canvas return white image data by modifiing CanvasRenderingContext2D.prototype.getImageData(), HTMLCanvasElement.prototype.toBlob(), and HTMLCanvasElement.prototype.toDataURL()
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*

### Level 3
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *full seconds (1.000 -- Date, 1000 -- performance)*
* **Protect against canvas fingerprinting: --** *ON*
    * Canvas return white image data by modifiing CanvasRenderingContext2D.prototype.getImageData(), HTMLCanvasElement.prototype.toBlob(), and HTMLCanvasElement.prototype.toDataURL()
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4*
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests: --** *confirm request but do not block*

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

