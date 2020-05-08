from values_getters import is_canvas_spoofed


## Test referrer - where the page was navigated from.
def test_canvas(browser, expected):
    if expected.canvas == 'REAL VALUE':
        assert not is_canvas_spoofed(browser.driver)
    else:
        # browser.real.canvas contains empty canvas
        assert is_canvas_spoofed(browser.driver)
