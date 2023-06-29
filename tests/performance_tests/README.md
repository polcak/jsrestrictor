# JShelter performance tests
Tests for JShelter's impact on page load performance. The metrics are collected by Google Lighthouse.
Input can be saved in a JSON file, by default it synchronizes the results and and benchmarks only those URLs
that are not yet in the file. 

## Prerequisites
* NodeJS 16 LTS (16.x) or later
* Google Chrome or Chromium

Initialize node modules:
```
npm install
```

## Usage
```
npm run test -- [options] [!][name]:extension1 extension2 ...

Options:
  -r, --runs       Runs of each benchmark                               [number]
      --out-file   Output JSON name                                     [string]
      --new        Rewrites the output file                             [boolean]   [default: false]
      --build-dir  Directory relative to Makefile with build output     [string]    [default: "build/chrome"]
      --stdout     Prints output JSON to stdout                         [boolean]   [default: true]

Defining extensions:
At least 1 path to a directory with manifest.js is required. The path can be relative to performance_tests or
absolute. There are 2 keywords with special behaviour you can use instead of a path: "none" to benchmark with
no extension and "this" to build and benchmark JShelter in this repository. You can explicitly define names of
extensions by prepending the desired name to the path or keyword witha colon, example: "optimized:extensions/jshelter".

Building extensions:
If you want to automatically build an extension before benchmarking, you can prepend ! to the definition, example:
!name:path. In this case, the path must lead to a directory with a Makefile where "make" will be executed.
The build output is expected to be in build/chrome by default and can be set.
```
The following example will build and benchmark JShelter in this repository with the name optimized,
an already built extension in a directory named jshelter in this directory with the name slow and
a benchmark with no extension with the name none. The results will be saved in benchmark.json.
```
npm run test -- !optimized:this slow:jshelter none --out-file benchmark.json
```
