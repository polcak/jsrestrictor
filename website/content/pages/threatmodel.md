Title: Threat model

JShelter focuses on threats that affect mainstream population. Our adversary creates
attacks/derive information in a way that works in mainstream browsers. The attacker focuses on these
browsers and attacks that are light on performance. For example, the adversary is interested in
identifying the user for targeted advertisement. So they need to identify the user quickly so that
they can display an advertisement. It does not make sense for such an attacker to deploy scripts that
take minutes to compute a fingerprint.

Our adversary might try to apply low-performance counterattacks. For example, previous literature
identified extensions that modify calls in a wrong position in the JavaScript prototype chain. It is
straigthforward for an adversary to use `Performance.prototype.now()` instead of `performance.now()`
so we apply code that modifies the original method, `Performance.prototype.now()` in the example.
Another example is an adversary running canvas fingerprinting several times. If the adversary
receives different results, they can compute an average value (or a minimal or maximal value) and
use this information to derive the correct fingerprint. As these modifications to fingerprinting are
not performance heavy, we consider them in the threat model.

We do not have resources to create a bullet-proof solution that eliminates all side-channels. For
example, we expect that an adversary will be able to detect that something strange is happening in
the browser. For example, an adversary might fill a canvas with a content controlled by the
adversary and detect modifications after reading back the content. Or, the adversary might time the length
of each/some operation(s). We modify the time readings and the countermeasures take some time. Hence, we
expect that an adversary will be able to detect that the user have modified JavaScript environment with a
patch or an extension. Our goal is to create a bigger anonymity set into which the user
belongs. So we try to eliminate the possibility of an attacker to uniquely identify the user but we
accept the fact that in the worst case, the attacker will be able to detect a JShelter user. To do
so reliably, the attacker should need to keep track with the changes in the code base.

Nevertheless, we do not want give the attacker the possibility to easily identify JShelter users. We
are not aware of any isolated side-effect that reveals JShelter. For example, some similar
webextensions do not modify `Function.prototype.toString`. A page script could detect such a webextension as each
webextension modifying the same API call by the same technique will likely use a different code.
Our goal is to offer a protection indistinguishable from another privacy-improving tool for
each modified API. Nevertheless, a focused observer will very likely be always able to learn that a
user is using JShelter if they aggregate the observable inconsistencies of all APIs produced by
JShelter. We are aware and do not hide that users of JShelter are vulnerable to focused
attacks.

JShelter goal is to make targeted attacks harder but we do not believe that we are
in a position to prevent them completely. For users concerned with targeted attacks, we suggest
using Tor Browser or a similar privacy enhancing tool.

It is well-known that some extensions modify the environment of the browser or the web page. For
example, password managers add buttons to automatically fill-in passwords. Page tweakers add
additional buttons to web pages to simplify common tasks or add information likely wanted by a user.
JShelter expects such users and tries to help such users from being identifiable. For example, a
dumb fingerpinter can combine all fingerprintable data to create a single number. Such fingerprinter
would unitentionally create a unique fingerprint of the users with a unique set of extensions. With
JShelter, such a dumb fingeprinter would not link different visits of the user. JShelter should
confuse a more advanced fingerpriner if they identify a single or multiple users.

We also want to provide an option that will limit the information that is readable from the computer
even if such a behaviour generally results into better fingerprintability. For example, a user
might want to disable canvas operations for pages that should not use canvas (from the user stand
point). As the webpage is in a better position to deploy countermeasures for JShelter
anti-fingerprinting techniques, the user might want the page to always read an empty, white, or random
canvas. That would limit the information available for the web page at the cost of giving the page
an easy way to determine that some counter-measures are in place. Our aim is to explain
the consequences of taking such an option but letting the user to decide for them-selves.

A previous literature identified that it is easy for an adversary to detect inconsistencies in API
calls. For example, a fingerprinter can learn the operating system from HTTP headers,
`navigator.oscpu`, installed fonts, results of mathematical operations, and other techniques. We do
not want to replace such techniques as we do not have resources to create a consistent environment.


