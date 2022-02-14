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

import Levenshtein

## Check if log was added by JShelter. Check with Levenshtein distance method.
def was_log_added(log, logs_without_jsr):
    for log_without_jsr in logs_without_jsr:
        if log_without_jsr['level'] == log['level']:
            if log_without_jsr['source'] == log['source']:
                # When logs have the same level and the same source, let's check if they have similar message too.
                # This check is based on Levenshtein distance.
                # It tells how many characters is needed to change to convert first string to second one.
                levenshtein_dst = Levenshtein.distance(log_without_jsr['message'], log['message'])
                # Get length of longer message because of calculating percentage similarity.
                message_length = max(len(log_without_jsr['message']), len(log['message']))
                # How many percent of strings are similar
                percentage_similarity = (message_length - levenshtein_dst) / message_length
                if percentage_similarity > 0.6:
                    # If similarity of logs is too high, tested log was not added by JShelter.
                    # It is issue already existing in page even without JShelter.
                    return False
    return True
