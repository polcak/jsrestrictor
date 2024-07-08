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
2. Generate the site with `make html`
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

