Title: Threat model

JShelter focuses on threats that target mainstream internet users. Attackers
derive information and create attacks aimed at mainstream browsers, using
approaches that minimize the performance requirements for such attacks.  For
example, we can consider an adversary interested in identifying the user for
targeted advertisement purposes. So, they will need to identify the user
quickly to display an advertisement; it does not make sense for such an
attacker to deploy scripts that take minutes to compute a fingerprint.

## Fingerprinting countermeasures

Our adversary might try to apply low-performance counterattacks. For example, previous literature
identified extensions that modify calls in a wrong position in the JavaScript prototype chain. It is
straightforward for an adversary to use `Performance.prototype.now()` instead of `performance.now()`
so we apply code that modifies the original method, `Performance.prototype.now()`, in the example.
Another example is an adversary running canvas fingerprinting several times. If the adversary
receives different results, they can compute an average value (or a minimal or maximal value) and
use this information to derive the correct fingerprint. As these modifications to fingerprinting are
not performance-heavy, we consider them in the JShelter threat model.

It is well-known that some extensions modify the environment of the browser or
the web page. For example, password managers add buttons to fill in passwords
automatically. Page tweakers add additional buttons to web pages to simplify
common tasks or add information likely wanted by a user.  JShelter expects such
users and tries to help such users from being identifiable. For example, a dumb
fingerprinter can combine all fingerprintable data to create a single number.
Such a fingerprinter would unintentionally create a unique fingerprint of the
users with a unique set of extensions. Such a dumb fingerprinter would not link
different visits of the user with Jshelter. JShelter should confuse a more
advanced fingerprinter if they identify single or multiple users.

We also want to provide an option that will limit the information that is
readable from the computer, even if such behaviour generally results in better
fingerprintability. For example, a user might want to disable canvas operations
for pages that should not use canvas (from the user's standpoint). As the
webpage is in a better position to deploy countermeasures for JShelter
anti-fingerprinting techniques, the user might want the page to always read an
empty, white, or random canvas. That would limit the information available for
the web page at the cost of giving the page an easy way to determine that some
countermeasures are in place. Our aim is to explain the consequences of taking
such an option but letting the user decide for themselves.

Previous literature identified that it is easy for an adversary to detect inconsistencies in API
calls. For example, a fingerprinter can learn the operating system from HTTP headers,
`navigator.oscpu`, installed fonts, results of mathematical operations, and other techniques. We do
not want to replace such techniques as we do not have the resources to create a consistent environment.

Besides fingerprinting, JShelter also focuses on other threats appearing on the web. For example,
JShelter prevents web pages from turning the browser into a proxy to the local
[network](/localportscanning/). The user should be able to decouple anti-fingerprinting
countermeasures and other countermeasures.

## Limitations and mitigation methods

We do not have the resources to create a bullet-proof solution that eliminates all side channels. For
example, we expect that an adversary will be able to detect that something strange is happening in
the browser. For example, an adversary might fill a canvas with content controlled by the
adversary and detect modifications after reading back the content. Or, the adversary might time the length
of each/some operation(s). We modify the time readings, and the countermeasures take some time. Hence, we
expect that an adversary will be able to detect that the user has modified the JavaScript environment with a
patch or an extension. Our goal is to create a bigger anonymity set into which the user
belongs. Hence, we try to eliminate the possibility of an attacker identifying the user uniquely. Still, we
accept that the attacker can detect a JShelter user in the worst case. To do
so reliably, the attacker should need to keep track of the code base changes.

JShelter's countermeasures also depend on properties of the browser and on
the environment in which JShelter runs. To deliver the per-site
configuration to the code that modifies the visited page's JavaScript
environment, JShelter creates a communication channel that passes through
the page's own environment. This channel is not cryptographically
authenticated; it is protected by the browser's guarantee that code
registered at document start executes before any script of the visited
page, and by answering the initial handshake only once, before any page
script can run. Consequently, we consider the correct behavior of the
browser to be a part of the assumptions behind our countermeasures: a
browser bug that lets page scripts execute before or in place of
extension-injected code would give the page access to unwrapped APIs, which
is a problem beyond the scope of JShelter. Similarly, other installed
extensions can inject their own code into the visited page, potentially
earlier than JShelter. Such an extension can observe or interfere with
JShelter's initialization, learn the per-session configuration (including
the seed of the noise applied to the modified APIs), or prevent JShelter's
wrappers from being applied at all. Users should be aware that installing
multiple extensions that modify the JavaScript environment of visited pages
can weaken the guarantees of each of them; we cannot protect users against
other extensions running in the page.

We want to avoid allowing the attacker to identify JShelter users
easily. We are not aware of any isolated side-effect that reveals JShelter. For
example, some similar webextensions do not modify
`Function.prototype.toString`. A page script could detect such a webextension
as each webextension modifying the same API call by the same technique will
likely use a different code.  Our goal is to offer protection indistinguishable
from another privacy-improving tool for each modified API. Nevertheless, a
focused observer will very likely be always able to learn that a user is using
JShelter if they aggregate the observable inconsistencies of all APIs produced
by JShelter. We are aware and do not hide that users of JShelter are vulnerable
to focused attacks.

JShelter's goal is to make targeted attacks harder. Still, we do not believe
that we are in a position to prevent them completely. We suggest using [Tor
Browser](https://www.torproject.org/download/) or a similar privacy-enhancing
tool for users concerned with targeted attacks.

