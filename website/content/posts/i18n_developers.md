Title: What should a JShelter developer know about internationalization?
Date: 2023-08-31 15:00
Series: i18n

We are working to improve the internationalization of JShelter. While the webextension API already contains [APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n) for internationalization, not everything works great. This post is written for webextension developers as well as JShelter developers working with strings presented to our users. Please see our [other post](/i18n/) if you are looking for ways to translate JShelter.

[TOC]

### Translating manifest, CSS files, and JS files

Let us start with the simple and easy items. Adding your translated strings to the
[manifest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#internationalizing_manifest.json)
and
[CSS](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#locale-dependent_css)
files is really simple and straightforward. For example, if you want to provide a translatable
description of your extension, you would change your `manifest.json` to contain a line like:

```JSON
{
    ...
    "description": "__MSG_extensionDescription__",
    ...
}
```

You add the description as `extensionDescription` to your `messages.json`:

```JSON
	"extensionDescription": {
		"message": "Extension for increasing security and privacy level of the user.",
		"description": "Description of the extension."
	},
```

Similarly, you can localize CSS files like:

```CSS
input:checked + .slider:before {
    ...
    content:"__MSG_ShieldOnSlider__";
    ...
}
```

Afterward, you define `ShieldOnSlider`, and you are done.

Translations in JavaScript files work a little bit differently, but it is easy to adapt your
JavaScript files. You just use the `browser.i18n.getMessage` [API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage). You provide the key in the `messages.json`. This time, you can add parameters that can be utilized inside the `messages.json` file. For example, you can pass a string that should appear inside the translated string:

```JS
browser.i18n.getMessage("defaultLevelSelection", default_level.level_text)
```

and the `message.json` can contain something like:

```JSON
	"defaultLevelSelection": {
		"message": "Default level ($levelName$)",
		"description": "This text is displayed as the default level in the popup",
		"placeholders": {
			"levelName": {
				"content": "$1",
				"description": "Translated name of the default level used by the user",
				"example": "Recommended, see the keys JSSL*Name like JSSL2Name"
			}
		}
	},
```

If you like the placeholders, for example, because you read in the best practices that placeholder substitutions help specify parts that you [do not want
translated](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#hardcoded_substitution).
You are out of luck if you want to add parameters to your manifest or CSS files. Luckily, JShelter
does not need parameters in manifest and CSS files, and such a need is rare.

### Translating HTML files

Webextensions contain HTML pages. For example, you can configure `options_ui` or `default_popup` in
`manifest.json`. Even so, the [internationalization page on MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization) is quiet about the internationalization of HTML files. Let us have a [look at what others do](https://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension).

In essence, others add some markup to the HTML file and later process that markup in JS files. For
example, in JShelter, we add `data-localize` attribute to each element we want to translate. The attribute
holds the key in the `message.json`. For example, JShelter defines:

```HTML
<label for="nbs-switch" data-localize="networkBoundaryShield">Network Boundary Shield</label>
```

We added a [translation file](https://pagure.io/JShelter/webextension/blob/bff8ce9c69ca28c1952898125983429c1f7f8a32/f/common/i18n_translate_dom.js)
`i18n_translate_dom.js` to all HTML pages with translatable elements. The script is
simple. It finds elements with the correct attributes and forwards the strings to the
`browser.i18n.getMessage`
[API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage).

Still, one needs to take care of special sections in the pages, like [templates](https://pagure.io/JShelter/webextension/blob/bff8ce9c69ca28c1952898125983429c1f7f8a32/f/common/i18n_translate_dom.js#_43).

The lack of a standard way to cope with HTML translations means that if you go to different
webextension, they will likely have a similar script, but the details would be different. That is not optimal.

### Language priorities

Webextension manifest file specifies `default_locale` as the default language. This language is used
as the last resort to pick untranslated strings. Each language can have variants like `en_US` and
`en_UK`. Translators can create `message.json` for variants and the base language (like `en`).
Browsers select translations based on [the algorithm documented on MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#localized_string_selection). First, they look for the variant, then for the base language, and if they are not successful, they go to the `default_locale`. The API returns an empty string if the default language does not contain the key.

Unfortunately, there is no way to tweak the algorithm. For example, some languages are similar.
Czech speakers mostly understand Slovaks and vice-versa. However, JShelter cannot tweak the
algorithm to look at the Czech translation if a Slovak translation is missing.

### Handling plurals

Plurals in English are simple for cardinal numbers. There is just the singular and plural version.
However, English has several forms for ordinal numbers, like 1st, 2nd, 3rd, 4th, or 21st. Other languages
behave
[differently](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html). In
essence, almost every language has a specific handling of plurals.

Although there is the `Intl.PluralRules()` [API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) in JavaScript that is available to webextensions, there is no direct support for plural messages in the `browser.i18n` API.

We considered creating several keys for the plural forms. For example, suppose that JShelter needs
to translate a string with `message.json` key `pluralExample`. We would create a code like:

```JS
let pluralCategory = (new Intl.PluralRules()).select(count);
let message = browser.i18n.getMessage("pluralExample" + pluralCategory, count);
```

At first sight, this is a straightforward solution. However, English defines only categories
"one" and "other." Imagine that the user uses a different locale with the category "few." If JShelter supports that language and that language
defines `pluralExamplefew`, great, everything works. But imagine the key `pluralExamplefew` is missing for that language. The [string selection algorithm](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#localized_string_selection) would search for `pluralExamplefew` in English `message.json`. However, that key would not be defined in English. So, the string selection algorithm would yield an empty string.

There are several solutions to the problem:

* Define all variants for the default locale language. We do not like that idea because it would be
  confusing for the translators — why is there `pluralExamplefew` and other categories if only `one`
  and `other` are used in English? They might attempt to remove the unused variants. Moreover, we would
  unnecessarily overload the translators as they would need to provide the default translation even
  if that is the same as "other." Finally, translators of other languages would likely be confused
      and add their translations that would overwhelm them as well.
* We could create code that handles the missing translations. For example, the program should check
  that `message` is not empty. If empty, it would get the plural category for the English locale
  and the English translation. We might opt for this path in the future.
* There are libraries like [webextension-plural](https://github.com/joelspadin/webextension-plural)
  that specialize in this task. However, `webextension-plural` has not been developed for several years.

As JShelter would benefit from plurals only in notifications of Network Boundary Shield that we
might be forced to remove in Manifest v3, we decided not to write complex code to handle all
exceptions and not to add additional dependencies. We decided to generate messages like "Blocked
messages: 5".

### Placeholders used in complex messages

[Developers should not make assumptions about the composition of the sentences](https://mozilla-l10n.github.io/documentation/localization/dev_best_practices.html#splitting-and-composing-sentences). However, some texts need special rules.

Consider the buttons for adding and removing exceptions for Network Boundary Shield and Fingerprint Detector. For example, the "Enable for the selected domains" button caption. We want to give the user a full and clear explanation; hence, the text is long. But we also want to emphasize the word "Enable." So the button caption uses HTML markup: `<strong>Enable</strong> for the selected domains`.

We decided to use placeholders to describe to translators how to handle the translation:

```JSON
	"ButtonEnableForSelectedDomains": {
		"message": "<strong>$ENABLE$</strong> $FORTHEDOMAIN$",
		"description": "A button caption that can be used generically by JShelter, e.g., in the options; if necessary, edit the structure of the message but make sure to emphasize the enablement. Translate the placeholders.",
		"placeholders": {
			"enable": {
				"content": "Enable",
				"description": "Please translate"
			},
			"forTheDomain": {
				"content": "for the selected domains",
				"description": "Please translate"
			}
		}
	},
```

This way, translators are free to change the structure of the message. For example, consider that the translator decides that an appropriate translation to Czech is "Vybrané domény
&lt;strong&gt;povol&lt;/strong&gt;". The word "enable" is translated as "povol". The translator can generate
text like:

```JSON
	"ButtonEnableForSelectedDomains": {
		"message": "$SELCTEDDOMAIN$ <strong>$ENABLE$</strong> ",
		"placeholders": {
			"enable": {
				"content": "povol"
			},
			"selectedDomains": {
				"content": "Vybrané domény"
			}
		}
	},
```

All perfect until we decided to use [Weblate](https://hosted.weblate.org/projects/jshelter/webextension/) to help with the translation, for example, to notify translators about new and changed strings that need translations. According to the [docs](https://docs.weblate.org/en/latest/formats/webextension.html), Weblate does support Webextension JSON. [Weblate manual](https://readthedocs.org/projects/weblate/downloads/pdf/weblate-3.9.1/) lists `placeholders as supported. The Weblate UI does not properly display placeholders. Translators [do not see the description](https://github.com/WeblateOrg/weblate/issues/3398) and example content of the placeholders. They cannot translate the content of the placeholder.

In this case, we could change the definition to something like:

```JSON
	"ButtonEnableForSelectedDomains": {
		"message": "<strong>Enable</strong> for the selected domains",
		"description": "A button caption that can be used generically by JShelter, e.g., in the options; if necessary, edit the structure of the message but make sure to emphasize the enablement."
	},
```

However, we have other complex cases where dividing the message into placeholders makes sense. For
example, we suggest different rules for translating a part of the message, like API names.
Hence, we created [scripts](https://pagure.io/JShelter/webextension/blob/main/f/tools/i18n) to help synchronize the strings between the repository and Weblate so that all strings can be translated in Weblate.
A developer needs to run the synchronization scripts manually. The expected order is to first
propagate changes from Grammarly to main (or other branch), and after that, propagate the changes from
that branch in the repository to Weblate.

### Additional reading

If you are a JShelter developer or are interested in helping JShelter's internationalization development, please read [localization best practices for developers](https://mozilla-l10n.github.io/documentation/localization/dev_best_practices.html), [MDN guide on webextension internationalization](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization), and the [i18n API documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n).
