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

TODO

## Translating

The JShelter website uses [Weblate](https://hosted.weblate.org) to manage translations. The `website/i18n/` directory contains a set of scripts to automate translation management, and the website build process (`make html`) runs these to synchronise the most recent updates to the translations on Weblate. Translators shouldn't need to worry about the internals as the build process should take care of everything; for more involved operations such as adding languages, updating the source files and others, here is a rundown of the translation pipeline.

### 1. Generate the translation source files

The `build_po_files.sh` script scans the Markdown content files and groups all the strings into `.po` files. The files are placed inside the `website/i18n/en/` directory. This process uses the `md2po` command from the [mdpo](https://mondeja.github.io/mdpo/latest/) Markdown parsing package.

This step is necessary when there are changes to the source content (e.g. updating a post or page) to make sure the new strings will show up on the Weblate interface.

NOTE/TODO: Uploading the `.po` files to Weblate needs to be done manually through the Weblate web UI. We intend to automate this part but there are a couple of bugs to deal with to make this feasible.

### 2. Download the latest translations

The `download.sh` script takes care of pulling the latest version of each available translation. The resulting `.po` files are placed inside the `website/i18n/<lang>/` directory, where `<lang>` is the language 2-letter code.

### 3. Generate translated files

The `translate_content.sh` script uses the `po2md` command from the [mdpo](https://mondeja.github.io/mdpo/latest/) package to generate translated Markdown files from the `.po` translation sources obtained in the previous step. The resulting files can be found inside the content directory: it creates a directory with the language code inside each section dir (`website/content/pages`, `website/content/posts` and `website/content/wrappers`).

### 4. Post-process translated files

The conversion process mangles the YAML frontmatter (there is an [open issue](https://github.com/mondeja/mdpo/issues/228) about this), so we perform some simple post-process to restore the proper formatting using the `postprocess.py` script.

Currently the script runs on a single file outputting the result to stdout. The full set of files can be processed as in the website build `Makefile`:

```bash
for f in `ls ../content/pages/*.md`
  do ./postprocess.py $f
done
```

Note that this example only processes the `pages` section; just repeat it on the `posts` and `wrappers` dir to post-process the full set of translated files.

