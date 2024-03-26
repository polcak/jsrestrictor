Title: Instructions on how to run unit tests

#### on Linux

1. Install [NodeJS](https://nodejs.org).
2. Install `jq` and another necessary tools (e.g. `sed`).
3. Open Terminal.
4. Run `npm install`.
5. Run `npm test`.

#### on Windows

1. Install Windows Subsystem for Linux (WSL): https://docs.microsoft.com/en-us/windows/wsl/install-win10.
2. Convert EOL in the script *./start_unit_tests.sh* from Windows (CR LF) to Unix (LF) - you can use the tool `dos2unix` in WSL to convert CR LF to LF.
3. Follow the instructions for Linux. Install NodeJS and run the following commands in WSL.

### Developer documentation

#### The framework

The test cases are based on top of Jasmine framework. `start_unit_tests.sh` preprocesses the files
using shell commands. Use `bash` if in doubt. Patches for other shells might be accepted but will
probably not be supported by the core team.

#### Structure

The test cases are stored in the `tests` directory. The file names typically mirror the tested files
in the `common` webextension directory with the suffix `_tests.js`. Each file and its requirements
needs to be registered in `config/global.json` file.

The configuration file stores for each test:

```js
		{
			"name": "file_name",
			"remove_custom_namespace": true/false,
			"let_to_var": true/false,
			"src_script_requirements": [
				{
					"type": "const",
					"requirements": [
						{
							"import": "sinon-chrome",
							"as": "browser"
						},
						{
							"import": "navigator",
							"as": "navigator"
						},
						{
							"import": "window",
							"as": "window"
						},
						{
							"from": "./url.js",
							"objects": [
								"extractSubDomains"
							]
						},
						{
							"from": "./helpers.js",
							"objects": [
								"getEffectiveDomain"
							]
						}
					]
				}
			],
			"test_script_requirements": [
				{
					"type": "const",
					"requirements": [
						{
							"from": "./helpers.js",
							"objects": [
								"escape",
								"gen_random32"
							]
						}
					]
				}
			]
			"extra_exports": [
				"setArgs",
				"wrappers"
			],
			"replace_in_src": [
				{
					"origin": "spoofPos(previouslyReturnedCoords);",
					"new": "return spoofPos(previouslyReturnedCoords);"
				}
			],
			"inject_code_to_src":
			{
				"begin": "function gen_random32() { return 0.2 * 4294967295; } function successCallback(arg) { return arg; } WrapHelper = { XRAY: false, shared: {}, forPage: function(param) {return param}, isForPage: obj => pageReady.has(obj), defineProperty: Object.defineProperty, defineProperties: Object.defineProperties, create: Object.create, OriginalProxy: Proxy, Proxy: Proxy };"
			}
		}
```

* `name` represents the tested file name (no `_tests.js` suffix)
* `remove_custom_namespace` modifies the source file to remove the IIFE to make its internals
	global. This is typically necessary to test wrappers that commonly create IIFE.
* `let_to_var` allows transforming all let variables to var variables. This might be necessary to
	transform inner variables but might modify the behaviour. Set to `false` unless you have good
	reason for the modification.
* `src_script_requirements` allows specifying dependencies of the file under test (the file used by
	the webextension).
* `test_script_requirements` allows specifying dependencies of the file with test cases (the file
	with the `_tests.js` suffix).
* `extra_exports` appends export line to the file under test and imports these objects to the file
	with the test cases.
* `replace_in_src` allows replacing lines in the file under test with a different code, use with
	caution as this modifies the behaviour.
* `inject_code_to_src` allows injecting additional code to the file under test. Currently only
	inserting to `begin` (first line) and `end` (last line) are supported.

Note that the preprocessor (`start_unit_tests.sh`) modifies the files under test and the file with
test cases according to the instuctions in `global.json`. The files are temporarily stored in the
`tmp` directory.

#### Add new unit tests if a test set already exists

If a test set already exists for the target modul (e.g. a test set *background_tests.js* for the *background.js* file),
you can add your own tests to the test script (e.g. to the *background_tests.js* file).

You may need to update the requirements in the global configuration (*./config/global.json* file).
Open the global configuration file for editing and find the configuration of the target script (according to the `name` property).
Add the necessary requirements to the `src_script_requirements` and `test_script_requirements` sections.

#### Add new unit tests if a test set does not already exists

If a test set does not already exists for the target modul (e.g. a test set *background_tests.js* for the *background.js* file),
create new file (e.g. *background_tests.js* file) in the *./tests* directory.
It is recommended to create a new test script by copying any existing test script, deleting its tests, and creating new ones.

When a new test script is created, add a new entry to the global configuration (*./config/global.json* file).
The new entry must be created according to the example (*./config/global-example.json* file) and schema (*./config/global-schema.json* file).
