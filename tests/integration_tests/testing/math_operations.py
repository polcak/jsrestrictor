## Check if number is in given accuracy and return True/False.
#
#  Function expects two number (int/float) or string(s) containing valid number(s).
#  Checking if number is rounded minimally to the position as accuracy.
#  Function check only whole part of number (int), not decimal part (float). Float is converted to int.
#  E.g.: is_in_accuracy(1654800, 100) => True
#  E.g.: is_in_accuracy(1654800, 10) => True
#  E.g.: is_in_accuracy(1654800, 1000) => False
def is_in_accuracy(number, accuracy):
    number_str = str(int(number))[::-1]
    accuracy_str = str(int(accuracy))[::-1]
    index = 0
    while accuracy_str[index] == '0':
        if index < len(number_str):
            if number_str[index] != '0':
                # number should have 0 in this position, but another digit was found
                return False
        index += 1
    return True
