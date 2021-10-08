Title: Geolocation
Filename: ../common/wrappingS-GEO.js


The goal is to prevent leaks of user current position. The Geolocation API also provides access
to high precision timestamps which can be used to various web attacks (see for example,
http://www.jucs.org/jucs_21_9/clock_skew_based_computer,
https://lirias.kuleuven.be/retrieve/389086).

Although it is true that the user needs to specificaly approve access to location facilities,
these wrappers aim on improving the control of the precision of the geolocation.

The wrappers support the following controls:

* Accurate data: the extension provides precise geolocation position but modifies the time
  precision in conformance with the Date and Performance wrappers.
* Modified position: the extension modifies the time precision of the time stamps in
  conformance with the Date and Performance wrappers, and additionally,  allows to limit the
  precision of the current position to hundered of meters, kilometers, tens, or hundereds of
  kilometers.

When modifying position:

* Repeated calls of navigator.geolocation.getCurrentPosition() return the same position
without page load and typically return another position after page reload.
* navigator.geolocation.watchPosition() does not change position.
