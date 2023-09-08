#!/usr/bin/env python3
# A script that propagates translations from the main repository to Weblate
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

from weblatelib import LOCALES_PATH, base_branch, get_current_locale_dirs, load_locales_from_json,PLACEHOLDERS_DELIMITER, EXAMPLE_DELIMITER

base_locales = {}
converted_locales = {}

if __name__ == "__main__":
    sys.stdout.write("I suppose that you have a branch weblate mirroring https://hosted.weblate.org/git/jshelter/webextension/. Make sure that your working tree is clear. Use git stash or similar commands if necessary.\n\nUSE weblate2main.py PRIOR TO RUNNING THIS SCRIPT. THIS SCRIPT WILL OVERRIDE Weblate translations!!!\n\n")

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
    # Convert placeholders to translatable strings. See https://jshelter.org/i18n/ for more details
    for locale in base_locale_names:
        db = base_locales[locale]
        conv = {}
        converted_locales[locale] = conv
        for key in db.keys():
            if "placeholders" in db[key]:
                placeholders = db[key]["placeholders"]
                del db[key]["placeholders"]
                for p in placeholders.keys():
                    msg = placeholders[p]["content"]
                    d = {"message": msg}
                    descr = placeholders[p].get("description", "")
                    example = placeholders[p].get("example", "")
                    if example:
                        example = EXAMPLE_DELIMITER + example
                    if len(msg) == 2 and msg[0] == "$":
                        d["description"] = "If in doubt, keep as is ### " + descr + example
                    elif descr or example:
                        d["description"] = "This string defines a substring of %s ### " % key + descr + example
                    conv["%s%s%s" % (key, PLACEHOLDERS_DELIMITER, p)] = d
            conv[key] = db[key]

    # Save base branch commit id
    sp = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True)
    BASE_COMMIT_ID = sp.stdout.decode("utf-8").strip()

    # Got to the weblate branch and export that translations
    subprocess.run(["git", "checkout", "weblate"])
    for locale in base_locale_names:
        json_object = json.dumps(converted_locales[locale], indent = "    ", ensure_ascii=False)
        git_translation_filename = "%s/%s/messages.json" % (LOCALES_PATH, locale)
        os.makedirs("%s/%s" % (LOCALES_PATH, locale), exist_ok=True)
        with open(git_translation_filename, "w") as f:
            f.write(json_object)
            f.write("\n")
        subprocess.run(["git", "add", git_translation_filename])
    subprocess.run(["git", "commit", "-m", "Propagate translations from %s branch (%s)" % (base_branch, BASE_COMMIT_ID), "--author", "main2Weblate <jshelter@gnu.org>"])


    reply = input("Write YES to merge branch %s to the weblate branch (keeping the weblate translations intact)? ... " % base_branch)
    if reply == "YES":
        subprocess.run(["git", "merge", "--strategy-option", "ours", base_branch])

    subprocess.run(["git", "checkout", base_branch])
