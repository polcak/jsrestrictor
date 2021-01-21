#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import nltk
from nltk.corpus import stopwords
import string


# Function to clean string for "Cosine similarity" method:
#   Remove punctuations from a given string.
#   Lowercase the string.
#   Remove stopwords
def clean_string(text):
    english_stopwords = stopwords.words('english')
    text = ''.join([word for word in text if word not in string.punctuation])
    text = text.lower()
    text = ' '.join([word for word in text.split() if word not in english_stopwords])
    return text


# Calculate the similarity for two given vectors.
# Similarity is cosinus of angle between two given vectors.
# Return value is in interval <0,1>
# 0 == maximum similarity (vectors are the same)
# 1 == no similarity (vectors are completely different)
def cosine_sim_vectors(vec1, vec2):
    # cosine_similarity() expects 2D arrays, and the input vectors are 1D arrays by default,
    # so it is needed to reshape them.
    vec1 = vec1.reshape(1, -1)
    vec2 = vec2.reshape(1, -1)
    return cosine_similarity(vec1, vec2)[0][0]


## Check if log was added by JSR. Check with Cosine similarity method.
def was_log_added(log, logs_without_jsr):
    for log_without_jsr in logs_without_jsr:
        if log_without_jsr['level'] == log['level']:
            if log_without_jsr['source'] == log['source']:
                # When logs have the same level and the same source, let's check if they have similar message too.
                # This check is based on Cosine Similarity.
                # It tells cosine of angle between two strings represented as vectors.
                vectorizer = CountVectorizer().fit_transform([clean_string(log_without_jsr['message']), clean_string(log['message'])])
                vectors = vectorizer.toarray()
                # Cosine similarity calculated from two vectors.
                csim = cosine_sim_vectors(vectors[0], vectors[1])
                if csim >= 0.6:
                    # If similarity of logs is too high, tested log was not added by JSR.
                    # It is issue already existing in page even without JSR.
                    return False
    return True
