from values_tested import TestedValues
import values_getters


## Init and return real values.
#
#  Get values from browser without JSR installed.
#  Object of class TestedValues is created and returned.
#  Returned object contains real values that are compared during testing with values from browser with JSR installed.
def init(driver):
    position = values_getters.get_position(driver)
    navigator = values_getters.get_navigator(driver)
    device = values_getters.get_device(driver)
    return TestedValues(
        user_agent=navigator['userAgent'],
        app_version=navigator['appVersion'],
        platform=navigator['platform'],
        vendor=navigator['vendor'],
        language=navigator['language'],
        languages=navigator['languages'],
        cookie_enabled=navigator['cookieEnabled'],
        do_not_track=navigator['doNotTrack'],
        oscpu=navigator['oscpu'],
        gps_accuracy=position['accuracy'],
        altitude=position['altitude'],
        altitude_accurac=position['altitudeaccurac'],
        heading=position['heading'],
        latitude=position['latitude'],
        longitude=position['longitude'],
        speed=position['speed'],
        timestamp=None,
        device_memory=device['deviceMemory'],
        hardware_concurrency=device['hardwareConcurrency'],
        referrer=values_getters.get_referrer(driver),
        time=None,
        performance=None,
        protect_canvas=None
    )
