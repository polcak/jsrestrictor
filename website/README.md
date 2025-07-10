# jShelter website

This site runs on [Pelican](https://getpelican.com).

## Editing content

Before starting, it's important to keep in mind that:

- Wrapper pages (all content inside `content/wrappers`) are automatically
  generated from the source code comments, so these shouldn't be edited
  directly -- edit the original source comments instead (inside the `common/`
  project directory)

## Generating the site

To make a local copy of the web site, follow these steps:

1. Install the dependencies with `make install`
2. Generate the site with `make build`
3. Run the local webserver with `make serve` and go to `http://localhost:8000`
   in your browser

## Adding new pages

To create a new page and link to it, you just need to create a new text file with the `.md` (Markdown) extension inside the `website/content/pages` directory. For blog posts, place it in the `website/content/posts` directory.

For pages, the only metadata required is the title. This should be placed in the first line of the file, with the syntax `Title: <page title>`.

For blog posts, the `Date:` field is also required, using the syntax `Date: yyyy-mm-dd hh:mm`. Blog posts can also be grouped into series, which will display the other posts in the same series on the post page. For this, use the `Series:` metadata tag along with the `series_index` value to define the post position in the series list. Here's a complete example:

```
Title: JShelter can be translated into different languages
Date: 2023-09-08 14:00
Series: i18n
series_index: 1
```

To link to a page or blog post, use its slug (which is the same as its file name), e.g. `/pagename/`.

## Options for generating the website

The included Makefile makes it easier to take care of the website generation tasks. These are the essential directives for working on the website:

* `make install`: Install all dependencies in a local virtualenv. Necessary for development.
* `make build`: Generate the full website after extracting the wrapper comments and generating the Doxygen docs.
* `make serve`: Run a local webserver at `127.0.0.1:8000` for previewing the generated site.
* `make translate-pull`: Download the latest translation files from Weblate.
* `make translate-extract`: Generates the source .po files that can be uploaded to Weblate to serve as a base for translations. Necessary when content files are changed or added.
* `make translate`
* `make clean`

These are directives that are called by the main directives above; useful for debugging or carrying out specific operations:

* `make translate`: Apply the translations from the downloaded Weblate files and generate localised content directories. Called on `make build`.
* `make doxygen`: Generates a Doxygen website in  the `output/doxygen/`. This is used for the "view technical documentation" links in the wrapper pages.
* `make html`: Only generates the Pelican site.
* `make extract`: Creates the wrapper pages from the comments in the wrapper source files. Called when generating the site with `make html`.
* `make deploy`: For copying over the website to the live server. It's of little use outside the admin team, unless you want to adjust the addresses to upload it to your own web space.
