#
#  JavaScript Restrictor is a browser extension which increases level
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


from math import radians, sin, cos, sqrt, atan2


## Check if number is in given accuracy and return True/False.
#
#  Function expects two number (int/float) or string(s) containing valid number(s).
#  Checking if number is rounded minimally to the position as accuracy.
#  Function check only whole part of number (int), not decimal part (float). Float is converted to int.
#  E.g.: is_in_accuracy(1654800, 100) => True
#  E.g.: is_in_accuracy(1654800, 10) => True
#  E.g.: is_in_accuracy(1654800, 1000) => False
def is_in_accuracy(number, accuracy):
    number_str = str(int(float(number)))[::-1]
    accuracy_str = str(int(accuracy))[::-1]
    index = 0
    while accuracy_str[index] == '0':
        if index < len(number_str):
            if number_str[index] != '0':
                # number should have 0 in this position, but another digit was found
                return False
        index += 1
    return True


## Calculate distance between two GEO coordinates (latitude and longitude) in meters.
#
#  Function expects two pairs of GEO coordinates. Coordinates have to be float or int type (not string).
#  {lat1, lon1} is the first position.
#  {lat2, lon2} is the second position.
#  Function returns distance between two position on Earth in meters.
#  The function takes into account the curved surface of the Earth.
def calc_distance(lat1, lon1, lat2, lon2):
    # approximate radius of earth in km
    R = 6371.0
	
	# difference between longitude converted from degrees to radians
    dlon = radians(lon2 - lon1)
	# difference between latitude converted from degrees to radians
    dlat = radians(lat2 - lat1)
	
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance_km = R * c
    distance_m = distance_km * 1000
    
    return distance_m
