#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
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
