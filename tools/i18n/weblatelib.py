# A library that contains common functions used in scripts that process Weblate translations
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

LOCALES_PATH="common/_locales"
base_branch = "main"
PLACEHOLDERS_DELIMITER = "###placeholders###"
EXAMPLE_DELIMITER = " ###EXAMPLE### "

import json
import os

def get_current_locale_dirs():
    return os.listdir(LOCALES_PATH)

def load_locales_from_json(locale_names, db):
    for locale in locale_names:
        f = open("%s/%s/messages.json" % (LOCALES_PATH, locale))
        db[locale] = json.load(f)
