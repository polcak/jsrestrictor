import pytest

from web_browser_shared import get_shared_browser
import values_expected


## This module is automatically called by pytest before start executing tests.
#
#  It contains setup method that are called before tests executing.
#  Here is defined variables browser and expected that are given to tests as a parameter.


## Setup method. browser provide shared browser to all tests.
@pytest.fixture(scope="session", autouse=True)
def browser():
    return get_shared_browser()

## Setup method: expected provide expected values to all tests.
#
#  expected values are selected based on testing jsr_level.
@pytest.fixture(scope="session", autouse=True)
def expected():
    if get_shared_browser().jsr_level == 0:
        return values_expected.level0
    elif get_shared_browser().jsr_level == 1:
        return values_expected.level1
    elif get_shared_browser().jsr_level == 2:
        return values_expected.level2
    elif get_shared_browser().jsr_level == 3:
        return values_expected.level3
