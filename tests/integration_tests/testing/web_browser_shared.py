from web_browser_type import BrowserType
from web_browser import Browser


## During testing multiple levels of JSR are tested.
#  Variable _shared_browser is for testing all levels of JSR in one browser.
#  If _shared_browser would not exists, a new browser for every tests set has to be created.
#  Shared browser can save time of creating new browser because one browser is reused for more tested JST levels.
#  Use getter and setter. Do not acces directly private variable _shared_browser.
_shared_browser = None


## Setter for _shared_browser.
def set_shared_browser(browser):
    global _shared_browser
    _shared_browser = browser


## Getter for _shared_browser.
def get_shared_browser():
    global _shared_browser
    return _shared_browser
