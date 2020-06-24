import time
import random

from math_operations import is_in_accuracy


## Test performance.
def test_performance(browser, expected):
	is_performance_rounded = True
	# Make 3 measurement.
	for _ in range(3):
		# Wait a while to value of performance will be changed.
		time.sleep(random.randint(1, 3))
		performance = browser.driver.execute_script("return window.performance.now()")
		if expected.performance['accuracy'] == 'EXACTLY':
			if int(performance/10)*10 != performance:
				# Performance was not rounded. At least one of three measurement has to say value was not rounded.
				is_performance_rounded = False
		else:
			assert is_in_accuracy(performance, expected.performance['accuracy'])

	if expected.performance['accuracy'] == 'EXACTLY':
		# At least one of three measurement has to say value was not rounded.
		# is_performance_rounded should be false if EXACTLY value is required.
		assert not is_performance_rounded
