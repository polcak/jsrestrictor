#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
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

import os
import json


## Delete file given by path if exists.
def delete_file_if_exists(path):
    if os.path.exists(path):
        os.remove(path)


## Test if given name belongs to directory. Return True or False.
def is_dir(folder_name):
    path_prefix = "../data/screenshots"
    folder_path = os.path.join(path_prefix, folder_name)
    if os.path.isdir(folder_path):
        return True


## Read and loads JSON file. Return dictionary with loaded data.
def get_json_file_content(path):
    data = []
    try:
        f = open(path, 'r', newline='')
        data = json.loads(f.read())
        f.close()
    except:
        print("File " + path + " not exists or it is not accessible for reading. If you are trying analyze logs, you have to generate them first.")
    finally:
        return data


## Write string content to file given by path.
def write_file(path, content):
    with open(path, 'w', newline='') as f:
        f.write(content)
