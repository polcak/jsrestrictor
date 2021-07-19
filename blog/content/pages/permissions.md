Title: Permissions
Date: 2021-01-01 12:00
Slug: permissions
Authors: Libor Polčák
Summary: Necessary system permissions

Rescriptor requires these permissions:

 * **storage**: used for storing extension configuration and user options
 * **tabs**: used for updating icon badge of the extension on tab change
 * **webRequest, webRequestBlocking, and all_urls**: needed for modyfing JavaScript objects and APIs on all pages and also used for capturing and blocking malicious HTTP requests
 * **dns**: used for resolving DNS queries in Firefox version of HTTP request shield
 * **notifications**: used for notifying user on blocked HTTP requests/hosts

Rescriptor stores all configuration data in the browser or in the user account.
It does not upload any data to our servers.
