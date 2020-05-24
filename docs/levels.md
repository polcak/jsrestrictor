# Levels
### Level 0
* *All functionality is disabled OFF*

### Level 1
* **Protect against canvas fingerprinting: --** *OFF*
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *hundredths of a second (1.230 -- Date, 1230 -- performance)*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*

### Level 2
* **Protect against canvas fingerprinting: --** *ON*
    * Reading from canvas returns white image.
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *tenths of a second (1.200 -- Date, 1200 -- performance)*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests --** *OFF*

### Level 3
* **Protect against canvas fingerprinting: --** *ON*
    * Reading from canvas returns white image.
* **Reduce the time accuracy of "Date" object and performance API --** *ON*
    * Round time to: *full seconds (1.000 -- Date, 1000 -- performance)*
* **Spoof hardware information to the most popular HW --** *ON*
    * JS navigator.deviceMemory: *4* (not applied if the browser does not support the property)
    * JS navigator.hardwareConcurrency: *2*
* **Filter XMLHttpRequest requests: --** *confirm request but do not block*

