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

## Translating

The JShelter website uses [Weblate](https://hosted.weblate.org) to manage translations. The `website/i18n/` directory contains a set of scripts to automate translation management, and the website build process (`make html`) runs these to synchronise the most recent updates to the translations on Weblate. Translators shouldn't need to worry about the internals as the build process should take care of everything; for more involved operations such as adding languages, updating the source files and others, here is a rundown of the translation pipeline.

### Adding a new language

To add a new language to the website, 
- pelicanconf
- base files on weblate branch

### Applying translations

### Updating the Weblate string list

When there are updates to the site content, Weblate needs to be updated to provide the new strings for translation.

First, run the `i18n/build_po_files.sh` script, which will generate PO files inside the `i18n/en/` directory. This process uses the `md2po` command from the [mdpo](https://mondeja.github.io/mdpo/latest/) Markdown parsing package.

The resulting files can be uploaded to Weblate to update the string list. Right now this upload needs to be done manually on a per-component basis, but the following links will take you directly to each component's page so you can upload the appropriate PO file: [Website](https://hosted.weblate.org/projects/jshelter/website/en/#upload) (pages.po), [Blog Posts](https://hosted.weblate.org/projects/jshelter/website-posts/en/#upload) (posts.po) or [Wrappers](https://hosted.weblate.org/projects/jshelter/website-posts/en/#upload) (wrappers.po).

### 2. Download the latest translations

The `download.sh` script takes care of pulling the latest version of each available translation. The resulting `.po` files are placed inside the `website/i18n/<lang>/` directory, where `<lang>` is the language 2-letter code.

### 3. Generate translated files

The `translate_content.sh` script uses the `po2md` command from the [mdpo](https://mondeja.github.io/mdpo/latest/) package to generate translated Markdown files from the `.po` translation sources obtained in the previous step. The resulting files can be found inside the content directory: it creates a directory with the language code inside each section dir (`website/content/pages`, `website/content/posts` and `website/content/wrappers`).

### 4. Post-process translated files

The conversion process mangles the YAML frontmatter (there is an [open issue](https://github.com/mondeja/mdpo/issues/228) about this), so we perform some simple post-process to restore the proper formatting using the `postprocess.py` script.

Currently the script runs on a single file outputting the result to stdout. The full set of files can be processed as in the website build `Makefile`:

```bash
for f in `ls ../content/{pages,posts,wrappers}/*.md`
  do ./postprocess.py $f
done
```


