Title: Translating the JShelter website 
Date: 2024-07-08 15:00 
Series: i18n 
series_index: 3 

The JShelter website has a dedicated translation pipeline, described in this post.

## Translating the website content

The simplest way to contribute to the site translation is on Weblate. Just head
over to the [JShelter website
section](https://hosted.weblate.org/projects/jshelter/website/), select the
language you want to work on, and start translating. Project maintainers will
review and integrate new translations periodically.

### Translating locally without Weblate

If you're comfortable with editing PO files, that's also possible. For this, just
do the following steps:

1. Work on the **weblate** branch with `git checkout weblate`
1. Edit the relevant files inside the `website/i18n/` directory, which has
subdirectories for each language
1. Commit and push your changes back to the repository once you're done, or file
a pull request

In case you run into any problem, feel free to create an issue in our issue
tracker and we'll do our best to guide you through the process.

## Updating the translation source files

### 1. Updating the Weblate string list

When there are updates to the site content, Weblate needs to be manually updated
to provide the new strings for translation.

First, run the command `make translate-extract`, which will generate PO files
inside the `i18n/en/` directory. This process uses the `md2po` command from the
[mdpo](https://mondeja.github.io/mdpo/latest/) Markdown parsing package to read
all the website strings and generate source PO translation files.

The resulting files can be uploaded to Weblate to update the string list. Right
now this upload needs to be done manually on a per-component basis, but the
following links will take you directly to each component's page so you can
upload the appropriate PO file:
[Website](https://hosted.weblate.org/projects/jshelter/website/en/#upload)
(pages.po), [Blog
Posts](https://hosted.weblate.org/projects/jshelter/website-posts/en/#upload)
(posts.po) or
[Wrappers](https://hosted.weblate.org/projects/jshelter/website-wrappers/en/#upload)
(wrappers.po).

### 2. Download the latest translations and apply them

The command `make translate` will download the latest version of each available
translation. The resulting `.po` files are placed inside the
`website/i18n/<lang>/` directory, where `<lang>` is the language 2-letter code.
It will also generate translated Markdown files from the `.po` translation
sources obtained in the previous step.

The resulting files can be found inside the `website/content/` directory: it
creates a directory with the language code inside each section dir
(`website/content/pages`, `website/content/posts` and
`website/content/wrappers`).

If everything looks okay, you can commit the new translated files so that they're
integrated into the website.

## Adding a new language

There are many languages available on Weblate, but only some of them are
integrated in the website. This is for quality control reasons, to ensure that a
translation is stable enough before pushing it into the live site.

At the moment, only Portuguese (`pt_PT`) is included.

To add a new language, first edit `website/pelicanconf.py` and find the lines:

```python
I18N_SUBSITES = {
    "pt": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION": "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
    }
}
```

Add your new language here, here using Czech as an example:

```python
I18N_SUBSITES = {
    "pt": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION": "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
    },
    "cz": {
        "DESCRIPTION": "A extensão para navegar em segurança",
        "LONGDESCRIPTION": "Uma extensão anti-malware para o teu navegador web que vai pôr sob controlo ameaças de JavaScript, incluindo a recolha de impressões digitais, rastreamento e recolha de dados",
    }
}
```

Now, when you build the website with `make html`, the new language should be
present in the generated website.
