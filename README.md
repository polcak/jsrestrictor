> **Disclaimer**: This is a research project under development, see the [issue page](https://pagure.io/JShelter/webextension/issues) and the [webextension home page](https://JShelter.org/) for more details about the current status.

## What is JShelter?

JShelter is a browser extension to give back control over what your browser is doing. A JavaScript-enabled web page can access much of the browser's functionality, with little control over this process available to the user: malicious websites can uniquely identify you through fingerprinting and use other tactics for tracking your activity. JShelter aims to improve the privacy and security of your web browsing.

## How does it work?

Like a firewall that controls network connections, JShelter controls the APIs provided by the browser, restricting the data that they gather and send out to websites. JShelter adds a safety layer that allows the user to choose if a certain action should be forbidden on a site, or if it should be allowed with restrictions, such as reducing the precision of geolocation to the city area. This layer can also aid as a countermeasure against attacks targeting the browser, operating system or hardware.


## How can I get started?

JShelter is a browser extension with support for multiple browsers: [Firefox](https://addons.mozilla.org/firefox/addon/javascript-restrictor/), [Google Chrome](https://chrome.google.com/webstore/detail/jshelter/ammoloihpcbognfddfjcljgembpibcmb), and [Opera](https://addons.opera.com/extensions/details/javascript-restrictor/). The extension also works with Brave, Microsoft Edge, and most likely any Chromium-based browser. [Let us know](https://pagure.io/JShelter/webextension/issues) if you want to add the extension to additional stores.

See our [website](https://JShelter.org/) for additional information and documentation. We recommend
reading [our paper](https://arxiv.org/abs/2204.01392) to get a better idea about the project.

## Contributing

If you have any questions or you have spotted a bug, please [let us know](https://pagure.io/JShelter/webextension/issues). If you found a security bug that you do not want to share publicly, please, send a report to [jshelter@gnu.org](mailto:jshelter@gnu.org).

If you would like to give us [feedback](https://pagure.io/JShelter/webextension/issues), we would really appreciate it.

If you want to add a new wrapper, please, follow the [guide](https://jshelter.org/new-wrapper/). If
you have an image/artwork that you want to push to the project, we suggest stripping exif data:

```shell
exiftool -all= -tagsfromfile @ -Orientation filename.png
```

If you want to translate JShelter to a new language or improve an existing translation, go to
[Weblate](https://hosted.weblate.org/projects/jshelter/webextension/).

## License Information

This program is free software: you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation, either [version
3](https://www.gnu.org/licenses/gpl-3.0) of the License, or (at your option) any later version.
