# jShelter website

This site runs on [Pelican](https://getpelican.com).

## Editing content

Before starting, it's important to keep in mind that:

- Wrapper pages (all content inside `content/wrappers`) are automatically
  generated from the source code comments, so these shouldn't be edited
  directly -- edit the original source instead (inside the `common/`
  project directory)
- Other pages are copied from the project's `docs/` dir, so be sure to edit
  those instead of the files inside `content/pages`.

## Adding new pages

## Translating content

Translated content goes into the `translations/` directory, which mirrors
the `content/` structure for each language.

For instance, if you want to add a Spanish translation for the `pages/build.md`
file, just create the `translations/es/pages/build.md` file, which will be
picked up by Pelican when generating the site.

## Generating the site

In case you want to make a local copy of the web site, follow these steps:

- install the dependencies with `make install`
- generate the site with `make html`
- serve it with `make serve` and go to `http://localhost:8000` in your browser
