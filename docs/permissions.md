# Permissions

*Javascript Restrictor* requires these permissions:
 * **storage --** *used for storing extension configuration and user options*
 * **tabs --** *used for updating icon badge of the extension on tab change*
 * **webRequest, webRequestBlocking, and all_urls --** *needed for modyfing JavaScript objects and APIs on all pages and also used for capturing and blocking malicious HTTP requests*
 * **dns --** *used for resoluting DNS queries in Firefox version of HTTP request shield*
 * **notifications--** *used for notifying user on blocked HTTP requests/hosts*
 * **contextMenus --** *used for creation of a context menu allowing the user to lock/unlock a certain form* 
 * **browsingData --** *used for removal of data stored during the lock of a form*
 * **webNavigation --** *allows form locking code to inject code*

*JavaScript Resctictor* does **not** collect any data about users.

