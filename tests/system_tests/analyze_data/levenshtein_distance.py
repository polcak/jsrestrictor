#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

import Levenshtein

## Check if log was added by JSR. Check with Levenshtein distance method.
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
                    # If similarity of logs is too high, tested log was not added by JSR.
                    # It is issue already existing in page even without JSR.
                    return False
    return True
