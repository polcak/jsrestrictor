import pytest

from values_getters import is_canvas_spoofed


## Test canvas - if canvas is spoofed: Reading from canvas returns white image.
## Expected failure - look at: Issue #23.
@pytest.mark.xfail
def test_canvas(browser, expected):
    if expected.protect_canvas:
        assert is_canvas_spoofed(browser.driver)
    else:
        assert not is_canvas_spoofed(browser.driver)
