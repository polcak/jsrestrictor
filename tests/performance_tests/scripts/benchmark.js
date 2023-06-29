/** \file
 * \brief Webextension benchmarking script using Google Lighthouse
 *
 *  \author Copyright (C) 2023  Martin Zmitko
 * 
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { median } from 'mathjs';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import * as config from './config.js';
import { execSync } from 'child_process';
import yargs from 'yargs'
import path from 'path';

let runCount = config.runCount;
let outFile = null;
let urls = config.urls;

function conditionalLog(condition, ...args) {
    if (condition) {
        console.log(...args);
    }
}

const helpString = 'Defining extensions:\n\
At least 1 path to a directory with manifest.js is required. The path can be relative to performance_tests or absolute. \
There are 2 keywords with special behaviour you can use instead of a path: "none" to benchmark with no extension and \
"this" to build and benchmark JShelter in this repository. You can explicitly define names of extensions by prepending\
the desired name to the path or keyword with a colon, example: "optimized:extensions/jshelter".\n\n\
Building extensions:\n\
If you want to automatically build an extension before benchmarking, you can prepend ! to the definition, example: \
!name:path. In this case, the path must lead to a directory with a Makefile where "make" will be executed. \
The build output is expected to be in build/chrome by default and can be set.';

function checkFileExists(dir, file) {
    if (!fs.existsSync(path.join(dir, file))) {
        console.error(`Error: ${file} in ${dir} not found`);
        process.exit(1);
    }
}

function buildExtension(dir) {
    try {
        execSync('make', {cwd: dir, timeout: 60000});
    } catch (e) {
        console.error('Error: Extension build failed');
        process.exit(1);
    }
}

function parseArgs() {
    const argv = yargs(process.argv.slice(2))
        .usage('Usage: npm run test -- [options] [!][name:]extension1 extension2 ...')
        .options({
            'runs': {
                description: 'Runs of each benchmark',
                alias: 'r',
                type: 'number',
            },
            'out-file': {
                description: 'Output JSON name',
                type: 'string',
            },
            'new': {
                description: 'Rewrites the output file',
                type: 'boolean',
                default: false,
            },
            'build-dir': {
                description: 'Directory relative to Makefile with build output',
                type: 'string',
                default: 'build/chrome',
            },
            'stdout': {
                description: 'Prints output JSON to stdout',
                type: 'boolean',
                default: config.stdout,
            },
            'csv': {
                description: 'Input CSV file with URLs with format "num, url"',
                type: 'string',
            },
            'url-count': {
                description: 'Number of URLs to benchmark',
                type: 'number',
            },
        })
        .implies('out-file', 'new')
        .demandCommand(1)
        .epilogue(helpString)
        .hide('version')
        .hide('help')
        .argv;

    if (argv.runs) {
        if (!argv.runs > 0) {
            console.error('Error: --runs value must be a positive integer, is', argv.runs);
            process.exit(1);
        }
        runCount = argv.runs;
    }

    if (argv.outFile) {
        outFile = argv.outFile;
    }

    if (argv.csv) {
        const cfg = argv.urlCount ? {to: argv.urlCount} : {};
        urls = parse(fs.readFileSync(argv.csv), cfg).map(url => url[1]);
    }

    //if (argv.numUrls) {
    //    urls = urls.slice(0, argv.urlCount);
   // }

    const chromeInstances = {};
    for (let arg of argv._) {
        let build = false;
        if (arg.startsWith('!')) {
            build = true;
            arg = arg.slice(1);
        }
        let name = arg;
        const match = arg.match(/^(\w+):(.+)/);
        if (match) {
            name = match[1];
            arg = match[2];
        }

        let dir = null;
        if (arg === 'none') {
            build = false;
        }
        else if (arg === 'this') {
            dir = path.resolve('../..');
            build = true;
        }
        else {
            dir = path.resolve(arg);
        }
        
        if (build) {
            console.error(`Building ${name}` + (name !== dir ? ` at ${dir}` : ''));
            checkFileExists(dir, 'Makefile');
            buildExtension(dir);
            dir = path.join(dir, argv['build-dir']);
            console.error('Using build output at', dir, '\n');
        }
        if (dir) {
            checkFileExists(dir, 'manifest.json');
            chromeInstances[name] = config.flags.getExtensionFlags(dir);
        }
        else {
            chromeInstances[name] = config.flags.defaultFlags;
        }
    }

    return {chromeInstances, argv};
}

const benchmarkCollector = {
    extensionResults: {performance: []},
    pageResults: {},
    // Run a single benchmark and append the results to the extensionResults object
    async loadBenchmark(url, port) {
        let failFlag = false;
        const result = (await lighthouse(url, {port}, config.lighthouse)).lhr;
        config.audits.forEach(audit => {
            this.extensionResults[audit] = this.extensionResults[audit] || [];
            const value = result.audits[audit].numericValue;
            if (typeof value === 'number') {
                this.extensionResults[audit].push(value);
            } else {
                failFlag = true;
            }
        });
        const score = result.categories.performance.score;
        if (typeof score === 'number') {
            this.extensionResults.performance.push(result.categories.performance.score);
        } else {
            failFlag = true;
        }
        
        return failFlag;
    },
    // Process the extensionResults object after an extension has been benchmarked for current URL
    // and append the run's median values to the pageResults object, reset for next extension
    processExtension(extension) {
        console.log(JSON.stringify(this.extensionResults, null, 2));
        let result = null;
        result = Object.fromEntries(Object.entries(this.extensionResults).map(([key, value]) => [key, value.length ? median(value) : null]));
        this.extensionResults = {performance: []};
        this.pageResults[extension] = result;
    },
    // Collect the pageResults object after a URL is finished benchmarking and reset it for the next one
    collectURL() {
        const result = this.pageResults;
        this.pageResults = {};
        return result;
    },
};

async function runBenchmarks(chromeInstances, argv) {
    let results = {};
    if (outFile && fs.existsSync(outFile)) {
        results = JSON.parse(fs.readFileSync(outFile));
    }

    let onUrl = 0;
    const urlCount = urls.length;
    const extensionCount = Object.keys(chromeInstances).length;
    const totalRuns = extensionCount * urlCount * runCount;
    console.error(`Running page load benchmarks for ${extensionCount} webextensions on ${urlCount}` +
                  ` URLs, ${runCount} runs each for a total of ${totalRuns} benchmarks to do.`);
    
    conditionalLog(argv.stdout, '{');
    for (const url of urls) {
        console.error(`[${++onUrl}/${urlCount}] Benchmarking ${url}`);
        if (url in results && !argv.new) {
            console.error(`Skipping ${url}, already in ${outFile}`);
            continue;
        }
        
        console.log(`"${url}":`);
        for (const [extension, chromeFlags] of Object.entries(chromeInstances)) {
            process.stderr.write(`Benchmarking with ${extension}`);
            for (let i = 0; i < runCount; i++) {
                let chrome, failFlag;
                try {
                    chrome = await chromeLauncher.launch({chromeFlags, ignoreDefaultFlags: true});
                    failFlag = await benchmarkCollector.loadBenchmark(url, chrome.port);
                } catch (e) {
                    process.stderr.write('X');
                    if (chrome) {
                        await chrome.kill();
                    }
                    continue;
                }
                process.stderr.write(failFlag ? '?' : '✓');
                if (chrome) {
                    await chrome.kill();
                }
            }
            process.stderr.write(' done\n');
            benchmarkCollector.processExtension(extension);
        }
        results[url] = benchmarkCollector.collectURL();
        conditionalLog(argv.stdout, JSON.stringify(results[url], null, 4) + ',');

        if (outFile) {
            fs.writeFileSync(outFile, JSON.stringify(results, null, 4));
        }
    }
    conditionalLog(argv.stdout, '}');
}

async function main() {
    const {chromeInstances, argv} = parseArgs();
    if (argv.new) {
        fs.writeFileSync(outFile, '{}');
    }
    await runBenchmarks(chromeInstances, argv.stdout);
}

await main();
