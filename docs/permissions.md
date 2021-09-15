# Permissions

*Javascript Restrictor* requires these permissions:
 * **storage --** *used for storing extension configuration and user options*
 * **tabs --** *used for updating icon badge of the extension on tab change*
 * **webRequest, webRequestBlocking, and all_urls --** *needed for modyfing JavaScript objects and APIs on all pages and also used for capturing and blocking malicious HTTP requests (Network Boundary Shield)*
 * **dns --** *used by Network Boundary Shield to determine if a domain belongs to local network or
	 not*
 * **notifications--** *used for notifying user on blocked HTTP requests/hosts*

*JavaScript Resctictor* stores all configuration data in the browser or in the user account. It does
not upload any data to our servers.

