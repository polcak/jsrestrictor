Title: Permissions

JShelter requires these permissions:

 * **storage**: for storing extension configuration and user options
 * **tabs**: for updating the extension's icon badge on tab change
 * **webRequest, webRequestBlocking, all_urls**: for modifying JavaScript objects and APIs on all pages, and for capturing and blocking malicious HTTP requests
 * **dns**: for resolving DNS queries in Firefox version of HTTP request shield
 * **notifications**: for notifying users on blocked HTTP requests/hosts
 * **browsingData**: Fingerprint Detector needs to remove data from any storage that can save the
	 fingerprint
 * **webNavigation**: for deploying wrappers as early as possible to avoid page scripts accessing
	 unwrapped objects. NSCL use a different approch for this purpose in Chromium-based browsers. All
	 brosers need the permission to apply `window.name` protection

jShelter stores all configuration data in the browser or in the user account. It does not upload any data to our servers.
