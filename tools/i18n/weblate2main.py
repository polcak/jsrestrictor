#!/usr/bin/env python3
# A script that propagates translations from Weblate to the main repository
# See https://lists.nongnu.org/archive/html/js-shield/2023-09/msg00001.html
# for the motivation why this script was created
# Note that the scripts manipulates with the working tree and git content,
# use with caution and double check its results
#
# Copyright (C) 2023 Libor Polčák
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

import json
import os
import sys
import subprocess
import tempfile

from weblatelib import LOCALES_PATH, base_branch, get_current_locale_dirs, load_locales_from_json,PLACEHOLDERS_DELIMITER, EXAMPLE_DELIMITER

base_locales = {}
weblate_locales = {}
new_locales = []

if __name__ == "__main__":
    sys.stdout.write("I suppose that you have a branch weblate mirroring https://hosted.weblate.org/git/jshelter/webextension/. Make sure that your working tree is clear. Use git stash or similar commands if necessary.\n\n")

    # Learn base branch (current branch)
    sp = subprocess.run(["git", "branch", "--show-current"], capture_output=True)
    base_branch = sp.stdout.decode("utf-8").strip()
    # Let the user decide if they want to interrupt the script
    print("Locales in current branch", base_branch)
    base_locale_names = get_current_locale_dirs()
    print(" ".join(base_locale_names))
    input("Press Enter to continue or exit with SIGINT (Ctrl+C)\n")

    # Load base locales
    load_locales_from_json(base_locale_names, base_locales)

    # Got to the weblate branch and import that translations
    subprocess.run(["git", "checkout", "weblate"])
    weblate_locale_names = get_current_locale_dirs()
    for locale in weblate_locale_names:
        if locale not in base_locales:
            reply = input("Write YES if you want to import locale %s ... " % locale)
            if reply == "YES":
                new_locales.append(locale)
    load_locales_from_json(base_locale_names + new_locales, weblate_locales)

    # Save Weblate commit id
    sp = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True)
    WEBLATE_COMMIT_ID = sp.stdout.decode("utf-8").strip()

    # Go back to base branch
    subprocess.run(["git", "checkout", base_branch])

    # Revert changes to placeholders (see main2weblate.py)
    for locale in weblate_locales.keys():
        db = weblate_locales[locale]
        for key in list(db.keys()):
            obj = db[key]
            if PLACEHOLDERS_DELIMITER in key:
                origkey, phkey = key.split(PLACEHOLDERS_DELIMITER)
                try:
                    placeholders = db[origkey].get("placeholders", {})
                except KeyError:
                    # There is a translated placeholder but the main string is not translated.
                    # Do not add the partial translation until the main string is translated.
                    del weblate_locales[locale][key]
                    continue
                d = {"content": obj["message"]}
                if "description" in obj:
                    _, rest = obj["description"].split(" ### ")
                    if EXAMPLE_DELIMITER in rest:
                        descr, example = rest.split(" ###EXAMPLE### ")
                        if descr:
                            d["description"] = descr
                        if example:
                            d["example"] = example
                    else:
                        d["description"] = rest
                placeholders[phkey] = d
                db[origkey]["placeholders"] = placeholders
                del db[key]

    # Update translations, NOTE that the script just propagetes changed translations
    # from Weblate. If the string somehow gets removed from Weblate, such change is
    # never propagated from weblate to the base branch
    updated_locales = {}
    for locale in base_locale_names:
        bl = base_locales[locale] # Base language json
        wl = weblate_locales[locale] # Weblate language json
        for key in wl.keys():
            if bl[key] == wl[key]:
                continue # Skip strings that are the same in Weblate and base branch
            # Check if the only difference is a missing empty description
            if bl[key]["message"] == wl[key]["message"] and \
                bl[key]["description"] == "" and "description" not in wl[key] and \
                (("placeholders" not in bl[key] and "placeholders" not in wl[key]) or \
                (["placeholders"] in bl[key] and "placeholders" in wl[key] and \
                bl[key]["placeholders"] == wl[key]["placeholders"])):
                    continue # Skip such strings
            bl[key] = wl[key]
            updated_locales[locale] = updated_locales.get(locale, 0) + 1

    # Write back changed JSON
    if updated_locales:
        commit_msg = tempfile.NamedTemporaryFile(mode="w", prefix="jshelter_weblate_commitmsg_", delete=False)
        commit_msg.write("Propagating changes from Weblate\n\nSynced with commit id %s\n\n" % WEBLATE_COMMIT_ID)
        for locale in updated_locales.keys():
            commit_msg.write("Locale %s, changed strings: %d\n" % (locale, updated_locales[locale]))
            tmp = tempfile.NamedTemporaryFile(mode="w", suffix = ".json", prefix = "jshelter_%s_" % locale, delete=False)
            json_object = json.dumps(base_locales[locale], indent = "\t", ensure_ascii=False)
            tmp.write(json_object)
            tmp.write("\n")
            tmp.close()
            git_translation_filename = "%s/%s/messages.json" % (LOCALES_PATH, locale)
            sp = subprocess.run(["diff", "-Naur", "--ignore-all-space", "--ignore-blank-lines",
                                 tmp.name, git_translation_filename],
                                 capture_output=True)
            patch_tmp = tempfile.NamedTemporaryFile(mode="w", suffix = ".patch", prefix = "jshelter_%s_" % locale, delete=False)
            patch_tmp.write(sp.stdout.decode("utf-8"))
            patch_tmp.close()
            os.remove(tmp.name)
            subprocess.run(["patch", "-R", git_translation_filename, patch_tmp.name])
            os.remove(patch_tmp.name)
            subprocess.run(["git", "add", git_translation_filename])
        # Create a commit
        commit_msg.close()
        subprocess.run(["git", "commit", "-F", commit_msg.name, "--author", "Propagated from Weblate <jshelter@gnu.org>"])
        os.remove(commit_msg.name)


    # Create new translations
    for locale in new_locales:
        commit_msg = tempfile.NamedTemporaryFile(mode="w", prefix="jshelter_weblate_commitmsg_", delete=False)
        commit_msg.write("Creating new translation file %s from Weblate\n\nSynced with commit id %s\n\n" % (locale, WEBLATE_COMMIT_ID))
        commit_msg.close()
        json_object = json.dumps(weblate_locales[locale], indent = "\t", ensure_ascii=False)
        git_translation_filename = "%s/%s/messages.json" % (LOCALES_PATH, locale)
        os.makedirs("%s/%s" % (LOCALES_PATH, locale))
        with open(git_translation_filename, "w") as f:
            f.write(json_object)
            f.write("\n")
        subprocess.run(["git", "add", git_translation_filename])
        subprocess.run(["git", "commit", "-F", commit_msg.name, "--author", "Propagated from Weblate <jshelter@gnu.org>"])
        os.remove(commit_msg.name)
