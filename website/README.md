# jShelter website

This site runs on [Pelican](https://getpelican.com).

## Editing content

Before starting, it's important to keep in mind that:

- Wrapper pages (all content inside `content/wrappers`) are automatically
  generated from the source code comments, so these shouldn't be edited
  directly -- edit the original source comments instead (inside the `common/`
  project directory)

## Adding new pages

## Translating content

Translated content goes inside the subfolders of the `content/` directory using
the language code. For instance, pages translated to Spanish should be placed
inside `content/pages/es/`, taking care to keep the file names and the metadata
names (e.g. `Title:`) intact. The site generator will gather the files and put
them in their place inside the site structure.

## Generating the site

To make a local copy of the web site, follow these steps:

1. Install the dependencies with `make install`
2. Generate the site with `make html`
3. Run the local webserver with `make serve` and go to `http://localhost:8000`
   in your browser
