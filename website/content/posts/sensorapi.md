Title: Protection against fingerprinting with Generic Sensor API
Date: 2022-05-06 15:34
Series: Browser fingerprinting

Today devices contain [various sensors](https://www.researchgate.net/publication/224170986_A_survey_of_mobile_phone_sensing_IEEE_Commun_Mag) for reading information about the device's position, state, and environment. Such equipment is typical for mobile devices like cellphones, tablets, or laptops that often include sensors for obtaining geolocation or device orientation data. Another example is a smartwatch that could monitor the heartbeat rate of the wearer, or a car with a tire pressure sensor, etc. While the benefits of having sensors are undisputed, allowing websites to access their readings represents a considerable danger.

This post contains:

[TOC]

### Generic Sensor API

JavaScript's [Generic sensor API](https://www.w3.org/TR/generic-sensor/) provides a unified way for accessing these sensors and reading data. The physical (hardware) sensor instances are called **device sensors**, while **platform sensors** represent interfaces over which the user agent can interact with the device sensors and read data. JavaScript represents sensors by a class hierarchy. The base class `Sensor` cannot be used directly but provides essential properties, event handlers, and methods for its subclasses. These represent concrete sensors like Accelerometer, Magnetometer, or Gyroscope.

#### Browser Support

 The API is currently implemented, or partially implemented, in Chrome, Edge, and Opera browsers. For Android devices, the support exists in Chrome for Android, Opera for Android, and various Chromium-based browsers like Samsung Mobile or Kiwi Browser. The concrete support for individual classes depends on the browser type and version. Some features are considered experimental and, for now, only work when browser flags like `#enable-experimental-web-platform-features` or `#enable-generic-sensor-extra-classes` are enabled.

#### Sensor Types

Some sensors are characterized by their implementation, e.g. a `Gyroscope` or `Magnetometer`. Those are called **low-level** sensors. Sensors that are named after their readings, not their implementation, are called **high-level** sensors. For instance, the `GeolocationSensor` may read data from the GPS chip, Wifi networks, cellular network triangulation, or their combination. Using a combination of low-level sensor readings is called **sensor fusion**. An example is the `AbsoluteOrientaionSensor` that uses data from the Accelerometer, Gyroscope, and Magnetometer low-level sensors.

#### Threats

The risk of using Generic Sensor API calls for device fingerprinting is
mentioned within the [W3C Candidate Recommendation Draft, 29 July 2021]((https://www.w3.org/TR/2021/CRD-generic-sensor-20210729/#device-fingerprinting)).
Documented threats include manufacturing imperfections and differences
that are unique to the concrete model of the device and can be used
for fingerprinting. Concrete examples are discussed in the following sections dedicated
to individual sensor classes.


### Timestamps

We discovered a loophole in the `Sensor.timestamp` attribute. The value
contains the time when the last `Sensor.onreading` event occurred, in millisecond precision.
We observed that the time is not relative to the time of page context creation (like `performance.now`)
but the last boot time of the device. Exposing such information is dangerous
as it allows to fingerprint the user easily. Not many
devices boot at the same time. The longer a device is running, the less likely that another device booted at the same time, and both are still running.

The behaviour was with the Magnetometer sensor on the following devices:

* Samsung Galaxy S21 Ultra; Android 11, kernel 5.4.6-215566388-abG99BXXU3AUE1, Build/RP1A.200720.012.G998BXXU3AUE1, Chrome 94.0.4606.71 and Kiwi (Chromium) 94.0.4606.56
* Xiaomi Redmi Note 5; Android 9, kernel 4.4.156-perf+, Build/9 PKQ1.180901.001, Chrome 94.0.4606.71

Our wrapper thus protects the device by changing the time origin to the page context
creation time, the timestamp should still uniquely identify the reading, i.e. two readings by the same page have a different timestamp.


### Global Orientation Settings

Many sensor classes need access to the device's orientation to calculate its values
accordingly. Readings from different sensors are thus not independent of
each other, and relations between the sensor classes exist. We wanted even the faked
readings to look real and believable, and therefore JShelter uses a model of
the orientation that is shared between the individual wrappers.

Let us consider a cell phone as a use case device. For all devices we examined:

* The `x` axis is oriented from the user's left to the right.
* The `y` axis from the bottom side of the display towards the top side.
* The `z` axis is perpendicular to the display; it leads from the phone's display towards the user's face.

Similar to [Aircaft principal axes](https://www.grc.nasa.gov/www/k-12/airplane/rotations.html), the rotation
of the device is defined by three values: `yaw`, `pitch`, and `roll`:

* `Yaw` defines rotation around the `z` axis. Assume a phone lying display up on a flat surface - a table, for instance. If you rotate the phone without taking any part up from the surface, only the yaw changes.
* `Pitch` defines rotation around the `x` axis. Assume you want to have better visibility of the display. You may put something under the top (camera) part of the phone to lift it up a bit. This is where the pitch changes. For the phone, the surface is not horizontal anymore.
* `Roll` defines rotation around the `y` axis. This is done by rotating the phone to the left and right. Assume you are holding the phone in your hand, looking at the display. If you decide to look at the buttons on the side instead, you rotate the phone, which applies the roll.

As we observed, the yaw, pitch, and roll define the rotation of the phone on the Earth
reference coordinate system:

* The `x` axis is oriented towards the **East**
* The `y` axis is oriented towards the (Earth's magnetic) **North**
* The `-z` axis is oriented toward the **centre of the Earth**


In our solution, the three values (`yaw`, `pitch`, and `roll`) are pseudorandomly drawn
using the [Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) PRNG
that is seeded with a value generated from the `domainHash` which ensures deterministic behaviour
for the given website, e.g. producing same values on different tabs.

Future
improvements could also introduce movements where JShelter would change the orientation over time.

A rotation matrix is calculated and stored within
the global `orient` variable from the values obtained. All our wrappers that need access to the device's orientation
load it from this variable.


### AmbientLightSensor

An ambient light sensor is a photodetector that senses the amount of ambient light present.
The motivation for integrating electronic devices is mostly to dim the screen accordingly
and protect users' eyes.
In the Generic Sensor API, the sensor is implemented using the
`AmbientLightSensor` class provides readings of the illuminance of the device's environment.
The unit of the illuminance values is `lux`.


#### Fingerprinting with AmbientLightSensor

While the light sensors in devices may protect users' eyes, they do not protect their privacy.
As the illuminance value describes the light conditions of the nearby physical surrounding of the device,
an observer can use the illuminance together with other sensors' readings to create a unique fingerprint.
Using readings from the `AmbientLightSensor`, it is possible to
[scan the nearby environment](https://blog.lukaszolejnik.com/additional-security-and-privacy-risks-of-light-sensors/).
For instance, [behavioral analysis](https://blog.lukaszolejnik.com/privacy-of-ambient-light-sensors/)
can reveal information about the time of day that the user usually works,
preferred lighting conditions, frequency of movement around different places, etc.
By applying the [inverse square law](http://hyperphysics.phy-astr.gsu.edu/hbase/Forces/isq.html),
one can also compute the distance between the device and another light-emitting object:
`d = sqrt(L / 4 * π * B)` where `L` is luminosity that is roughly constant for a light source, and
`B` is brightness obtained from the sensor readings.

It is also possible to detect the position of the user's fingers by analyzing the shadows
the cast.
An example that presents a serious danger is
[PIN Skimming](https://www.researchgate.net/publication/262380810_PIN_Skimming_Exploiting_the_Ambient-Light_Sensor_in_Mobile_Devices).
In this case, a malicious website or application exploits the sensor readings to
detect PINs for applications that make bank transactions, etc.
Spreitzer et al. Using a linear discriminant analysis with a training set of 15 PINs,
each repeated eight times, it was possible to classify more than 90 % of device PINs
correctly. The chance of correctly guessing the right PIN from the set of 15 is only 6.7 %.
If the user watches TV and a light sensor-equipped smartphone or smartwatch is nearby,
it can
[identify concrete TV channels and on-demand videos](https://www.sciencedirect.com/science/article/pii/S1574119216302085).

Multiple devices allow conducting [cross-device tracking](https://blog.lukaszolejnik.com/privacy-of-ambient-light-sensors/).
For instance, when someone uses a phone and a tablet in the same room, a website with access to their light sensors
can compare the values to distinguish whether the same person uses two separate devices.
The sensor can also be used for [cross-device communication](https://blog.lukaszolejnik.com/privacy-of-ambient-light-sensors/)
where one device emits light by displaying content on its screen and the other
reads the message through the sensor-measured illuminance values.


#### Wrapping the AmbientLightSensor readings

To eliminate possible exploitation of sensor readings, we decided
to generate fake readings instead of modifying existing ones.
On examined stationary devices inside an office, the illuminance measured
was between 500 and 900, depending on the concrete position's light conditions.
All measured values were rounded to the nearest 50 illuminance value.
The wrapper simulates the same behaviour under non-changing light conditions.
In the beginning, a pseudorandom illuminance
value is drawn using PRNG seeded with the domain hash - which should guarantee
to produce the same values on multiple browser tabs on the same domain.
As we simulate a stationary device under constant light conditions,
this value remains the same for all readings.
The faked value is returned using a wrapped `illuminance` getter
of the `AmbientLightSensor.prototype`.


### Accelerometer

Accelerometers provide information about the device's acceleration
- i.e., the rate of change of its velocity.
The Generic Sensor API provides access to the readings using three classes:
the `Accelerometer` sensor, the `LinearAccelerationSensor`, and the `GravitySensor`.
All use data from the underlying `accelerometer` device sensor.
The difference between them is whether and how the gravity acceleration is applied.
The `Accelerometer` sensor provides information about the total
acceleration that is applied to the device.
The remaining two isolate the sources. The `LinearAccelerationSensor` ignores the influence of gravity.
The `GravitySensor` returns just the gravity acceleration.

#### Fingerprinting with Accelerometer

Readings from the accelerometer sensor classes represent a potential risk and need to be protected.
A unique fingerprint [can be obtained by describing the device's vibrations](https://link.springer.com/chapter/10.1007/978-3-319-30806-7_7).
Using [trajectory inference](https://www.researchgate.net/publication/220990763_ACComplice_Location_inference_using_accelerometers_on_smartphones)
and matching the model to map data, one may
use the readings from the Accelerometer to determine the device's position

From the accelerometer readings, [it is possible to infer](https://www.mysk.blog/2021/10/24/accelerometer-ios/)
whether the device user is lying, sitting, walking, or cycling. For walking and running,
the data allow calculating steps.
Accelerometer readings can also be used to determine
[human walking patterns](https://www.researchgate.net/publication/322835708_Classifying_Human_Walking_Patterns_using_Accelerometer_Data_from_Smartphone).

Similar to `Gyroscope`, the `Accelerometer` sensor is also influenced by
vibrations from speech. Using the [Spearphone attack](https://arxiv.org/abs/1907.05972),
it is possible
to perform gender classification (with accuracy over 90%) and speaker identification
(with accuracy over 80%). Speech recognition and classification can also be done
from the reading of this sensor.


#### Wrapping the Accelerometer readings

Our wrapper replaces the acceleration getters of these sensors. The goal is to
simulate a stationary device, possibly rotated. A rotation matrix represents the orientation
of the device. Its values are drawn pseudorandomly
from the domain hash, and are shared between all sensor wrappers to simulate
the same behaviour.

The `GravitySensor` provides readings of gravity acceleration applied
to the device. This is represented by a vector made of `x`, `y`, `z` portions.
To get this faked gravity vector for the device, the reference vector
`[0, 0, 9.8]` is multiplied with the rotation matrix. Wrappers for the
GravitySensor's getters return the individual portions of the fake gravity vector.

Next, the `LinearAccelerationSensor` should return acceleration values without
the contribution of gravity. For a stationary device, it should be all zeroes.
Yet, vibrations may change values a little bit, e.g.,
spin around `-0.1` to `+0.1`, as seen on the examined devices. Such vibrations usually do
not happen with every reading but only in intervals of seconds. And thus,
JShelter pseudorandomly changes these values after a few seconds.

Finally, the `Accelerometer` sensor combines the previous two. Our wrappers thus
return the values from the LinearAccelerationSensor with the fake gravity
vector portions added.

For all three classes, we return the faked orientation values
using the wrapped  `x`, `y`, `z` component getters
of the `Accelerometer.prototype`. Based on the constructor name
the wrapper detects which concrete class is used and thus
what behaviour to simulate.


### Gyroscope

The Gyroscope sensor provides readings of the angular velocity of the device along the `x`, `y`, `z` axes.
The class uses the underlying `gyroscope` device sensor.
Physically, classic gyroscopes used a spinning wheel or a disc with free axes of rotation.
In modern electronic devices,
gyroscopes use piezoelectric or silicon transducers and [various mechanical structures](https://www5.epsondevice.com/en/information/technical_info/gyro/).

#### Fingerprinting with Gyroscope

Gyroscope readings can be used for [speech recognition](https://crypto.stanford.edu/gyrophone/)
and various fingerprinting operations.
For stationary devices, the resonance of the unique internal or
external sounds affect angular velocities affect the Gyroscope, and [allow to create a fingerprint](https://www.researchgate.net/publication/356678825_Mobile_Device_Fingerprint_Identification_Using_Gyroscope_Resonance).
For moving devices, one of the options is using the Gyroscope to analyze [human walking patterns](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7071017/).

#### Wrapping the Gyroscope Readings

All velocities should be zero in an ideal state for a stationary device. As we observed on the
examined devices, various device sensor imperfections and tiny vibrations cause the values
oscillate between `-0.002` and `0.002` on the examined devices. Our wrapper thus simulates the same behaviour.

The changes are applied in pseudorandom intervals between `500 ms` to `2 s`. These boundaries
were chosen with respect to our observations from the examined devices' real sensors.
The actual values of change are also calculated pseudorandomly from the domain hash
to ensure deterministic and consistent behaviour within a given domain.
The faked values are then returned using wrapped `x`, `y`, `z` getters of the `Gyroscope.prototype`.


### Magnetometer

A magnetometer measures the strength and direction of the magnetic
field around the device. The interface offers sensor readings using three properties:
`x`, `y`, and `z`. Each returns a number that describes the magnetic field
around the particular axis. The numbers have a double precision and can be positive or negative,
depending on the orientation of the field.
The total strength of the magnetic field (`M`) can be calculated as `M = sqrt(x^2 + z^2 + y^2)`.
The unit is in microtesla (&micro;T).

#### Fingerprinting with Magnetometer

The Earth's magnetic field [ranges](https://doi.org/10.1111%2Fj.1365-246X.2010.04804.x) between approximately 25 and 65 &micro;T.
Concrete values depend on location, altitude, weather, and other factors. Yet, there are characteristics of the field for different places on Earth. The common model used for their description is the
[International Geomagnetic Reference Field (IGRF)](https://www.ngdc.noaa.gov/IAGA/vmod/igrf.html).
While the magnetic field changes over time, the changes are slow: There is a decrease of 5% every 100 years. Therefore, for the given latitude, longitude, and altitude, the average strength of the field should be stable. Can one determine the device's location based on the data from the Magnetometer sensor? Not exactly. The measured values are influenced by the interference with other electrical devices, isolation (buildings, vehicles), the weather, and other factors. Moreover, the field is not unique - similar fields can be measured in different places on Earth.

What, however, can be determined is the orientation of the device. In the case of a stationary (non-moving) device, the measured values can serve as a fingerprint. As we experimentally examined, it is also possible to distinguish whether the device is moving or when its environment changes. When a person with a cellphone enters a car or an elevator, the metal barrier serves as isolation, and the strength of the field gets lower rapidly (e.g., from 60&micro;T outside to 27&micro;T inside). A cellphone lying on a case of a running computer can produce values over 100&micro;T, especially if it is near the power supply unit. Either way, for a single device at the same location in the same environment, the average strength of the magnetic field should be stable.

Magnetometer values can be used for fingerprinting. First, Magnetometer readings can tell the attacker whether the device is moving or not.
In the case of a stationary device, we can make a fingerprint from the device orientation.
Another fingerprintable value is the average total strength of the field, which
should remain stable if the device is at the same position and in the same environment.

Yet, even moving devices can be exploited. One can misuse the sensor readings
to make a [calibration fingerprint attack](https://www.ieee-security.org/TC/SP2019/papers/405.pdf)
that infers per device factory calibration data. The researchers showed the attack to be usable and efficient
on both Android and iOS devices. A device can be identified using Magnetometer reading
[through the analysis of the bias](https://seclab.bu.edu/papers/magnetometer-wisec2019.pdf).
Moreover, the device itself also produces electromagnetic emissions and can thus be identified
using the [physical proximity attack](https://seclab.bu.edu/papers/magnetometer-wisec2019.pdf)
is also possible to use an external device.
As the underlying device sensor is also disturbed by the device's CPU activity,
Magnetometer measurements can also be [used to identify running applications or web pages](https://arxiv.org/pdf/1906.11117.pdf).


#### Wrapping of Magnetometer readings

JShelter wraps the `x`, `y`, `z` getters of the `Magnetometer.prototype` object to protect the device.
Instead of using the original data, JShelter returns artificially generated values that look like actual sensor readings.

At every moment, our wrapper stores information about the previous reading. Each rewrapped getter first checks the
`timestamp` value of the sensor object. If there is no difference of the prior reading's timestamp,
the wrapper returns the last measured value. Otherwise, it provides a new fake reading.

We designed our fake field generator to fulfil the following properties:

* The randomness of the generator should be high enough to prevent attackers from deducing the sensor values.
* Multiple scripts from the same website that access readings with the same timestamp must get the same results. And thus:
* The readings are deterministic - e.g., for a given website and time, we must be able to say what values to return.

For every "random" toss-up, we use the [Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) PRNG
that is seeded with a value generated from the `domainHash`, which ensures deterministic
behaviour for the given website.
First, we choose the desired total strength `M` of the magnetic field at our simulated location.
This is a pseudorandom number from `25` to `60` &micro;T, like on the Earth.

First, we need to set the initial orientation of the axes. Our wrappers support
two methods:

* The original implementation where the orientation of axes is drawn pseudorandomly.
* An improved version where we use the faked device rotation shared by other wrappers.
In this case, we start with the reference magnetic field vector that is oriented towards
the Earth's magnetic North and towards the centre of the Earth.
The vector is then multiplied with the shared faked rotation matrix. The elements
of the resulting vector then represents the axes orientation.

For both methods, the orientation is defined by a number from -1 to 1 for each axis:
JShelter simulates a stationary device with a pseudorandomly drawn orientation in the current implementation.
Therefore, we choose the orientation of the device by generating a number from `-1` to `1` for each axis.
Those values we call `baseX`, `baseY`, and `baseZ`.
By modifying the above-shown formula, we calculate the `multiplier` that needs to be
applied to the base values to get the desired field.
The calculation is done as follows: `mult = (M * sqrt(baseX^2 + baseY^2 + baseZ^2) / (baseX^2 + baseY^2 + baseZ^2))`
For axis `x`, the value should fluctuate around `baseX * mult`, etc.

How much the field changes over time is specified by the **fluctuation factor**
from `(0;1]` that can also be configured. For instance, `0.2` means that the
magnetic field on the axis may change from the base value by `20%` in both positive
and negative ways.

The fluctuation is simulated by using a series of **sine** functions for each axis.
Each sine has a unique amplitude, phase shift, and period.
The number of sines per axis is chosen pseudorandomly based on the wrapper settings.
For initial experiments, we used around `20` to `30` sines for each axis.
The optimal configuration is in question.
More sines give less predictable results but also increase the computing complexity
that could have a negative impact on the browser's performance.

For the given timestamp `t`, we make the sum of all sine values at the point `x=t`.
The result is then shifted over the y-axis by adding `base[X|Y|Z] * multiplier` to the sum.
The initial configuration of the fake field generator was chosen intuitively to resemble the
results of the real measurements. Currently, the generator uses **at least one** sine
with the period around `100` &micro;s (with `10%` tolerance), which seems to be the minimum sampling rate
obtainable using the API on mobile devices. Then, at least one sine around `1 s`,
around `10 s`, `1 minute` and `1 hour`. When more than `5` sines are used, the cycle repeats using
`modulo 5` and creates a new sine with the period around `100` &micro;s, but this time the tolerance is `20%`.
The same follows for seconds, tens of seconds, minutes, and hours. The tolerance grows every five sines.
For 11+ sines, the tolerance is `30%` up to the maximum (currently `50%`).
The amplitude of each sine is chosen pseudorandomly based on the **fluctuation factor** described above.
The phase shift of each sine is also a pseudorandom number from [0;2&#960;).


Based on the results, this heuristic returns believable values that look like actual sensor readings.
Nevertheless, the generator uses a series of constants whose optimal values
should be a subject of future research and improvements. Perhaps, a correlation analysis
with real measurements could help in the future. Figures below show the values of `x`, `y`, `z`, and
the total strength `M` measured within 10 minutes on a: 1) Stationary device, 2) Moving device, and
3) Device with the fake wrapped magnetometer.

![Stationary device]({attach}/images/device_stationary.svg)
![Moving device]({attach}/images/device_moving.svg)
![Device with fake magnetometer]({attach}/images/device_artificial.svg)


### Device Orientation Sensors

This group includes two sensor classes: `AbsoluteOrientationSensor` and `RelativeOrientationSensor`.
Both describe the physical orientation of the device, and both require access
to the `accelerometer` and `gyroscope` device sensors.
The difference between the two classes is what they consider as a reference coordinate system
- i.e., what is the real orientation of a non-rotated device.
For this purpose, the `AbsoluteOrientationSensor` uses the Earth's reference coordinate
system. And thus, it also requires access to the `magnetometer` device sensor, simply
to know where the North is.
The `RelativeOrientationSensor` does not require this information as the cardinal directions
are not used. Yet, the sensor still needs to some coordinate system to calculate with -
i.e., physical orientation of the device that is considered as reference.
For this purpose, it may use the orientation from the moment the sensor instance is created.
When the sensor is initialized, it creates a new coordinate system, and the device can be
considered non-rotated. Any rotations from this point are done in relation to this newly created
coordinate system.
Readings are represented by the `OrientationSensor.quaternion` made of `x`, `y`, `z`, and `w`
components that describe the orientation of the device.

#### Fingerprinting with Device Orientation Sensors

Device orientation sensors can be easily used for fingerprinting. As it highly
unlikely that two devices visiting the same site will be oriented exactly
the same, the orientation itself can serve as a fingerprint.

As the device orientation sensor use data from both the `accelerometer` and the `gyroscope`
device sensors, determining the location using [trajectory inference](https://www.researchgate.net/publication/220990763_ACComplice_Location_inference_using_accelerometers_on_smartphones)
or determining [human walking patterns](https://www.researchgate.net/publication/322835708_Classifying_Human_Walking_Patterns_using_Accelerometer_Data_from_Smartphone).
could be even easier than with bare `Accelerometer` class.


#### Wrapping of Device Orientation Readings

The `AbsoluteOrientationSensor` returns a quaternion describing the physical
orientation of the device in relation to the Earth's reference coordinate
system. As discussed above, the faked orientation of the device is drawn pseudorandomly using
domain hash as a seed and sored inside a global variable called `orient`
that is accessible to all wrappers.
With each reading, it loads the "orient"  's contents,
converts the rotation matrix to a quaternion that is returned by the wrapped
getter.
This design makes the outputs realistic and in accordance with other sensors'
reading. The implemenation also supports possible changes of orientation.

The `RelativeOrientationSensor` also describes the orientation, but without
regard to the Earth's reference coordinate system. We suppose the coordinate
system is chosen at the beginning of the sensor instance creation.
As we observed, no matter how the device is oriented, there is always a slight
difference from the AbsoluteOrientationSensor's in at least one axis.
When the device moves, both sensors' readings change. But their difference
should always be constant. And thus, we pseudorandomly generate rotation deviations
from the Earth's reference coordinate system. The deviations are between
`0` and `π/2`. For each reading, we
take the values from the fake AbsoluteOrientationSensor and modify them
by the constant deviation.

For both sensor classes, we return the faked orientation values
using the wrapped  `x`, `y`, `z`, and `w` quaternion component getters
of the `OrientationSensor.prototype`. Based on the constructor name
the wrapper detects whether it should simulate the absolute or
relative orientation sensor's behaviour.

