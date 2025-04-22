Title: JavaScript Shield

JavaScript Shield modifies the behaviour of the JavaScript environment availble for the visited webpage. JShelter provides fake information to confuse fingerprinters or make webpage triggered attacks impossible or harder.

JavaScript Shield internally consists of wrappers, small pieces of code that modify the original behaviour of a JavaScript API (a function or a property) defined by standards. The behaviour of the most of the wrappers can be divided into several categories:

* **Precision reduction**: The original value is too precise and it is not necessary for most use cases. JavaScript Shield modifies the values so that typical and benign use cases are not affected.

* **Provide fake information**: Some wrappers provide fake information mostly to confuse fingerprinters. For example, canvas wrappers modify the image so that the same instructions produce different result in each session and for each domain.

* **Hide information**: Some APIs provide information that is not generally needed and can be hidden from most of the pages. Depending on the API, JavaScript Shield might return an error, an empty value, or block the API completely.

See our blog posts for more information on [browser fingerprinting counter-measures](/fingerprinting/) and [farbling](/farbling/).

## Protection levels

JShelter supports the following protection levels:

* **Turn JavaScript Shield off**: Use for pages that you trust and you want to give them access to full APIs supported by the browser.
* **Turn fingerprinting protection off**: Apply security counter-measures that are likely not to break web pages but do not defend against fingerprinting. Disable APIs that are not commonly used. Use this level if Fingerprint Detector reports low likelihood of fingerprinting, you trust the visited service, and/or you think that the protection makes the page slow or broken and your temptation to use the service is so high that you do not want to be protected.
* **Recommended**: Make the browser appear differently to distinct fingerprinters. Apply security counter-measures that are likely not to break web pages. Slightly modify the results of API calls in different way on different domains so that the cross-site fingerprint is not stable. The generated fingerprint values also differ with each browser restart. If you need a different fingerprint for the same website without restart, use incognito mode. Keep in mind that even if you log out from a site, clear your cookies, change your IP address, the modified APIs will provide a way to compute the same fingerprint. Restart your browser if you want to change your fingerprint. If in doubt, use this level.
* **Strict**: Enable all non-experimental protection. The wrapped APIs return fake values. Some APIs are blocked completely, others provide meaningful but rare values. Some return values are meaningless. This level will make you fingerprintable because the results of API calls are generally modified in the same way on all webistes and in each session. Use this level if you want to limit the information provided by your browser. If you are worried about fingerprinters, make sure the Fingerprint Detector is activated.
