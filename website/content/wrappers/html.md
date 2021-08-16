Title: HTML window name
Filename: ../common/wrappingS-HTML.js


`window.name` prvides a simple cross-origin tracking method of the same tab:

```js
window.name = "8pdRoEaQCpsjtC8w07dOy7xwXjXrHDyxxmPWBUxQKrh7xfJ4SYFH8QClp6U9T+Ypa8IEa5AwFw3x"
```

Go to completely different web site and window.name stays the same.

\see https://2019.www.torproject.org/projects/torbrowser/design/ provides a library build on
top of `window.name`: https://www.thomasfrank.se/sessionvars.html.

\see https://html.spec.whatwg.org/#history-traversal; this feature should not be ncessary
for Firefox 86 or newer https://bugzilla.mozilla.org/show_bug.cgi?id=444222.

