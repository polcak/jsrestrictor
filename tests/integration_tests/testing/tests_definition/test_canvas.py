import pytest

from values_getters import is_canvas_spoofed


## Test canvas - if canvas is spoofed: Reading from canvas returns white image.
#  Expected failure - known issue - repaired in next release - Related to: Issue #23.
#  Blank canvas is represented by array of zeros (value 0). But when JSR try to spoof canvas, it returns
#  array full of value 255. It means that canvas spoofed by JSR does not contains original values (that is right),
#  but it is not blank because it contains only 255 instead of 0 (that is bad).
#  Spoofed canvas should be blank canvas so this behavior is wrong.
#  When the user's canvas contains only 255, it is such a unique value that the user is really well traceable
#  by his/her canvas fingerprint.
@pytest.mark.xfail
def test_canvas(browser, expected):
    if expected.protect_canvas:
        assert is_canvas_spoofed(browser.driver)
    else:
        assert not is_canvas_spoofed(browser.driver)
