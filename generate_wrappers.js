#!/usr/bin/env node
/** \file
 *  \author Copyright (C) 2026  Dzianis Pilipenka
 *  \author Copyright (C) 2019-2026  Libor Polcak
 *  \author Copyright (C) 2021  Giorgio Maone
 *  \author Copyright (C) 2022  Marek Salon
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 *
 * generate_wrappers.js — converts JShelter's string-based wrapper
 * definitions into real JS functions for use as a MAIN-world content
 * script under Manifest V3. Removes the need for the Allow user scripts
 * toggle (Developer Mode in Chrome < 138).
 *
 * Based on build_code() from pre-NSCL code_builders.js (commit 379163db),
 * which is closer to Chromium MAIN world than the post-NSCL version
 * (no exportFunction/WrapHelper bridges). Compatibility shims for
 * exportFunction and WrapHelper are emitted so post-NSCL wrappers
 * still work.
 *
 * Flow:
 *   1. Sandbox provides globals (add_wrappers, string helpers, browser
 *      API stubs) expected by wrapping.js and the descriptor files.
 *   2. Evaluate wrapping.js + helpers.js/crc16.js/alea.js +
 *      wrappingS-*.js / wrappingL-*.js; each descriptor file calls
 *      add_wrappers(), which populates build_wrapping_code.
 *   3. Read fp_config/wrappers-lvl_*.json and build a per-resource map
 *      of FPD-monitored APIs (union across all levels).
 *   4. For each JSS wrapper emit a real function body matching
 *      build_code(); for FPD-only resources emit synthetic wrappers
 *      into a separate FPD_WRAPPERS table.
 *   5. Wrap everything in an IIFE with init() and a Port that
 *      negotiates with the ISOLATED-world content script via CustomEvent.
 *
 * The converter is invoked by the Chromium build target in Makefile;
 * its output wrappers_generated.js is placed into build/chrome/ before
 * the extension is packaged. 
 *
 * Generator functions are pure and exported via module.exports for tests.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ============================================================
// Sandbox environment for loading wrapper source files
// ============================================================

const build_wrapping_code = {};
let fpdReportArgsSet = new Set();

/**
 * Create a sandboxed JS context that mimics the globals
 * expected by wrapping.js and wrappingS-*.js files.
 */
const sandbox = {
  build_wrapping_code,

  // wrapping.js defines this; we provide our own to capture wrappers
  add_wrappers(wrappers) {
    for (const wrapper of wrappers) {
      const key =
        wrapper.parent_object + "." + wrapper.parent_object_property;
      build_wrapping_code[key] = wrapper;
    }
  },

  // String globals from wrapping.js (used via template literals in wrappers)
  rounding_function: `function rounding_function(numberToRound, precision) {
    return numberToRound - (numberToRound % precision);
  }`,

  noise_function: `let lastValue = 0;
  function noise_function(numberToChange, precision) {
    const noise = Math.floor(Math.random() * precision);
    var value = numberToChange + noise;
    if (lastValue < value) {
      lastValue = value;
    }
    return lastValue;
  }`,

  // Browser API stubs (needed so helpers.js and wrappers can load)
  browser: {
    runtime: { sendMessage() {}, onMessage: { addListener() {} }, getURL(x) { return x; } },
    storage: { local: { get() {}, set() {} }, sync: { get() {}, set() {} } },
    i18n: { getMessage(x) { return x; } },
    permissions: { contains() {} },
  },
  chrome: {
    runtime: { sendMessage() {}, onMessage: { addListener() {} }, getURL(x) { return x; } },
    storage: { local: { get() {}, set() {} } },
  },
  window: {},
  document: { addEventListener() {}, createElement() { return {}; } },
  navigator: {},
  URL: globalThis.URL,
  setTimeout: globalThis.setTimeout,
  setInterval: globalThis.setInterval,

  console,
};

vm.createContext(sandbox);

// ============================================================
// Code generators — pure functions that translate a wrapper
// descriptor into a string of JS code. Each covers one step of
// build_code() from code_builders.js. Exported below for tests.
// ============================================================

/**
 * Step 1: Check that the parent object exists.
 * Original: try {if (parent === undefined) {return;}} catch(e) {return;}
 */
function genExistenceCheck(wrapper) {
  return (
    `    try {\n` +
    `      if (${wrapper.parent_object} === undefined) return;\n` +
    `    } catch(e) { return; }\n`
  );
}

/**
 * Step 2: Save references to original functions/objects.
 * Handles both wrapped_name (direct ref) and callable_name
 * (was WrapHelper.pageAPI in Firefox — identity in Chromium MAIN world).
 */
function genWrappedObjects(wrapper) {
  let code = "";
  for (const wo of wrapper.wrapped_objects || []) {
    const varName = wo.wrapped_name || wo.callable_name;
    if (!varName) continue;
    code += `    var ${varName} = ${wo.original_name};\n`;
    code += `    if (${varName} === undefined) return;\n`;
  }
  return code;
}

/**
 * Step 3: Emit helping_code.
 * In the original, this is a string that gets concatenated.
 * Here it becomes real code inside the function body.
 */
function genHelpingCode(wrapper) {
  if (!wrapper.helping_code) return "";
  return `    ${wrapper.helping_code}\n`;
}

/**
 * FPD telemetry hook: emits code that reports an API access via the port.
 * Mirrors create_counter_call() from code_builders.js. Gated by fp_enabled
 * so JSS-only builds pay zero cost.
 */
function genCounterCall(resource, type) {
  const args = fpdReportArgsSet.has(resource)
    ? "args.map(x => JSON.stringify(x))"
    : "[]";
  return `
        if (fp_enabled && fp_${type}_count < 1000) {
          var stack = undefined;
          if (fpdTrackCallers) {
            try { throw new Error("FPDCallerTracker"); }
            catch (e) { stack = e.stack.toString(); }
          }
          updateCount(${JSON.stringify(resource)}, "${type}", ${args}, stack);
          fp_${type}_count += 1;
        }`;
}

/**
 * Step 4: Generate function replacement.
 * Mirrors define_page_context_function() from commit 379163db.
 */
function genFunctionReplacement(wrapper) {
  if (!wrapper.wrapping_function_body) return "";

  const originalF =
    wrapper.original_function ||
    `${wrapper.parent_object}.${wrapper.parent_object_property}`;

  let parentObj = wrapper.parent_object;
  let parentProp = wrapper.parent_object_property;

  // Handle replace_original_function (redirects assignment target)
  if (wrapper.replace_original_function && wrapper.original_function) {
    const lastDot = wrapper.original_function.lastIndexOf(".");
    parentObj = wrapper.original_function.substring(0, lastDot);
    parentProp = wrapper.original_function.substring(lastDot + 1);
  }

  let code = "";

  // Named function wrapper (used by some wrappers for reuse)
  if (wrapper.wrapping_code_function_name) {
    code += `    function ${wrapper.wrapping_code_function_name}(${wrapper.wrapping_code_function_params || ""}) {\n`;
  }

  code += `    var originalF = ${originalF};\n`;
  code += `    var fp_call_count = 0;\n`;
  code += `    var replacementF = function(${wrapper.wrapping_function_args || ""}) {\n`;

  // FPD telemetry hook (gated by fp_enabled, zero cost when off)
  const counterResource = `${wrapper.parent_object}.${wrapper.parent_object_property}`;
  code += `      try {${genCounterCall(counterResource, "call")}\n      } catch(e) {}\n`;

  // apply_if: conditional — call original if condition is false
  if (wrapper.apply_if !== undefined) {
    code += `      if (${wrapper.apply_if}) {\n`;
    code += `        ${wrapper.wrapping_function_body}\n`;
    code += `      } else {\n`;
    const fwdArgs = wrapper.wrapping_function_args
      ? ", " + wrapper.wrapping_function_args
      : "";
    code += `        return originalF.call(this${fwdArgs});\n`;
    code += `      }\n`;
  } else {
    code += `      ${wrapper.wrapping_function_body}\n`;
  }

  code += `    };\n`;

  // Use exportFunction shim (handles read-only properties via Object.defineProperty)
  code += `    exportFunction(replacementF, ${parentObj}, {defineAs: '${parentProp}'});\n`;
  code += `    if (originalF !== undefined && originalF !== null) {\n`;
  code += `      original_functions[replacementF.toString()] = originalF.toString();\n`;
  code += `    }\n`;

  if (wrapper.post_replacement_code) {
    code += `    ${wrapper.post_replacement_code}\n`;
  }

  // Close named function and invoke it
  if (wrapper.wrapping_code_function_name) {
    code += `    }\n`;
    code += `    ${wrapper.wrapping_code_function_name}(${wrapper.wrapping_code_function_call_window ? "window" : ""});\n`;
  }

  return code;
}

/**
 * Step 5a: delete_properties — remove API from the prototype/object.
 */
function genDeleteProperties(spec) {
  let code = "";
  for (const prop of spec.delete_properties || []) {
    code += `      if ("${prop}" in ${spec.parent_object}) {\n`;
    code += `        Object.defineProperty(${spec.parent_object}, "${prop}",\n`;
    code += `          {get: undefined, set: undefined, configurable: false, enumerable: false});\n`;
    code += `      }\n`;
  }
  return code;
}

/**
 * Step 5b: object_properties — redefine getters/setters via descriptor.
 */
function genObjectProperties(spec) {
  let code = "";
  code += `    if (!("${spec.parent_object_property}" in ${spec.parent_object})) return;\n`;

  // Save originals referenced by wrapped_properties
  for (const assign of spec.wrapped_objects || []) {
    code += `    var ${assign.wrapped_name} = ${assign.original_name};\n`;
  }

  code += `    var descriptor = Object.getOwnPropertyDescriptor(\n`;
  code += `      ${spec.parent_object}, "${spec.parent_object_property}");\n`;
  code += `    if (descriptor === undefined) {\n`;
  code += `      descriptor = {\n`;
  code += `        get: ${spec.parent_object}.${spec.parent_object_property},\n`;
  code += `        set: undefined, configurable: false, enumerable: true\n`;
  code += `      };\n`;
  code += `    }\n`;

  const counterResource = `${spec.parent_object}.${spec.parent_object_property}`;
  for (const wp of spec.wrapped_properties || []) {
    code += `    var originalPDF = descriptor["${wp.property_name}"];\n`;
    code += `    var fp_${wp.property_name}_count = 0;\n`;
    // Counting wrapper around the existing property_value (mirrors generate_object_properties from code_builders.js)
    code += `    var replacementPD = function(...args) {\n`;
    code += `      try {${genCounterCall(counterResource, wp.property_name)}\n      } catch(e) {}\n`;
    code += `      var pv = ${wp.property_value};\n`;
    code += `      if (typeof pv === 'function') return pv.bind(this)(...args);\n`;
    code += `      return pv;\n`;
    code += `    };\n`;
    code += `    descriptor["${wp.property_name}"] = replacementPD;\n`;
    code += `    if (replacementPD instanceof Function && originalPDF !== undefined) {\n`;
    code += `      original_functions[replacementPD.toString()] = originalPDF.toString();\n`;
    code += `    }\n`;
  }

  code += `    Object.defineProperty(${spec.parent_object},\n`;
  code += `      "${spec.parent_object_property}", descriptor);\n`;
  return code;
}

/**
 * Step 5c: assign — simple property assignment.
 */
function genAssignment(spec) {
  return `    ${spec.parent_object}.${spec.parent_object_property} = ${spec.value};\n`;
}

/**
 * Step 5d: function_export — assign a function to a property.
 */
function genFunctionExport(spec) {
  return `    exportFunction(${spec.export_function_name}, ${spec.parent_object}, {defineAs: '${spec.parent_object_property}'});\n`;
}

/**
 * Step 5: Process all post_wrapping_code entries.
 */
function genPostWrappingCode(wrapper) {
  if (!wrapper.post_wrapping_code) return "";

  const generators = {
    delete_properties: genDeleteProperties,
    object_properties: genObjectProperties,
    assign: genAssignment,
    function_export: genFunctionExport,
    function_define: (spec) => genFunctionReplacement(spec),
  };

  let code = "";
  for (const spec of wrapper.post_wrapping_code) {
    if (spec.apply_if !== undefined) {
      code += `    if (${spec.apply_if}) {\n`;
    }

    const gen = generators[spec.code_type];
    if (gen) {
      code += gen(spec);
    } else {
      code += `    // UNSUPPORTED code_type: ${spec.code_type}\n`;
    }

    if (spec.apply_if !== undefined) {
      code += `    }\n`;
    }
  }
  return code;
}

/**
 * Step 6: Freeze the wrapped property.
 */
function genFreeze(wrapper) {
  if (!wrapper.freeze) return "";
  const target = `${wrapper.parent_object}.${wrapper.parent_object_property}`;
  // Wrap in inner try/catch: accessing getter properties on prototypes
  // throws "Illegal invocation" (e.g. Event.prototype.timeStamp).
  return `    try { var _fp = ${target}; if (_fp) Object.freeze(_fp); } catch(_fe) {}\n`;
}

/**
 * Step 7 (optional): Set prototype chain.
 */
function genPrototype(wrapper) {
  if (!wrapper.wrapper_prototype) return "";
  const target = `${wrapper.parent_object}.${wrapper.parent_object_property}`;
  return (
    `    if (${target} && ${target}.prototype !== ${wrapper.wrapper_prototype}.prototype) {\n` +
    `      Object.setPrototypeOf(${target}, ${wrapper.wrapper_prototype});\n` +
    `    }\n`
  );
}

/**
 * Assemble complete function body for a single wrapper.
 * Mirrors build_code() from commit 379163db, but emits real code.
 */
function generateWrapperFunction(key, wrapper) {
  let body = "";
  body += genExistenceCheck(wrapper);        // Step 1
  body += genWrappedObjects(wrapper);        // Step 2
  body += genHelpingCode(wrapper);           // Step 3
  body += genFunctionReplacement(wrapper);   // Step 4

  // Step 5: post_wrapping_code
  // If wrapper has apply_if at the top level (and no wrapping_function_body
  // which handles apply_if itself), wrap post_wrapping_code in condition.
  if (wrapper.apply_if !== undefined && !wrapper.wrapping_function_body) {
    body += `    if (${wrapper.apply_if}) {\n`;
    body += genPostWrappingCode(wrapper);
    body += `    }\n`;
  } else {
    body += genPostWrappingCode(wrapper);
  }

  body += genPrototype(wrapper);             // Step 7
  body += genFreeze(wrapper);               // Step 6
  return body;
}

// ============================================================
// FPD descriptor builders — equivalents of fp_build_property_wrapper
// and fp_build_function_wrapper from fp_code_builders.js.
//
// Input mirrors fp_levels.page_wrappers[level] entries:
//   [resource, type, properties, sendArgs]
//   - type: 1 = property, 0 = function
//   - properties: Set<string> of "get"|"set"|"call"
//   - sendArgs: 1 if FPD wants arguments serialized
//
// Output: descriptor in the same shape as build_wrapping_code.
// ============================================================

function splitResource(text) {
  const i = text.lastIndexOf(".");
  return { path: text.slice(0, i), name: text.slice(i + 1) };
}

function fpBuildPropertyWrapper(wrapItem) {
  const wrapper = {};
  if (wrapItem[2].size === 0) return wrapper;

  const r = splitResource(wrapItem[0]);
  wrapper.parent_object = r.path;
  wrapper.parent_object_property = r.name;
  wrapper.wrapped_objects = [];
  wrapper.post_wrapping_code = [
    {
      code_type: "object_properties",
      parent_object: r.path,
      parent_object_property: r.name,
      wrapped_objects: [],
      wrapped_properties: [],
      report_args: wrapItem[3],
    },
  ];

  for (const type of wrapItem[2]) {
    wrapper.post_wrapping_code[0].wrapped_objects.push({
      original_name: `
        Object.getOwnPropertyDescriptor(${r.path}, "${r.name}") ?
        Object.getOwnPropertyDescriptor(${r.path}, "${r.name}")["${type}"] :
        ${type === "get" ? wrapItem[0] : "undefined"}
      `,
      wrapped_name: `originalD_${type}`,
    });
    wrapper.post_wrapping_code[0].wrapped_properties.push({
      property_name: type,
      property_value: `originalD_${type}`,
    });
  }
  return wrapper;
}

function fpBuildFunctionWrapper(wrapItem) {
  const r = splitResource(wrapItem[0]);
  return {
    parent_object: r.path,
    parent_object_property: r.name,
    wrapped_objects: [
      {
        original_name: `${r.path}.${r.name}`,
        wrapped_name: `originalF_${r.name}`,
      },
    ],
    wrapping_function_args: "...args",
    wrapping_function_body: `return originalF_${r.name}.call(this, ...args);`,
    report_args: wrapItem[3],
  };
}

// ============================================================
// FPD additional wrappers — copied from fp_code_builders.js.
// Cover HTMLElement.offsetHeight/offsetWidth as proxies for font
// fingerprinting detection. Emitted only as part of FPD generation.
// ============================================================

const fpdAdditionalWrappers = [
  {
    parent_object: "HTMLElement.prototype",
    parent_object_property: "offsetHeight",
    wrapped_objects: [],
    post_wrapping_code: [
      {
        code_type: "object_properties",
        parent_object: "HTMLElement.prototype",
        parent_object_property: "offsetHeight",
        wrapped_objects: [
          {
            original_name: `
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight") ?
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")["get"] :
              HTMLElement.prototype.offsetHeight
            `,
            wrapped_name: "originalD_get",
          },
        ],
        wrapped_properties: [
          {
            property_name: "get",
            property_value: `function() {
              let font = this.style.fontFamily;
              if (WrapHelper.shared["fpd_offsetHeight_set_cnt"] < 1000) {
                updateCount("CSSStyleDeclaration.prototype.fontFamily", "set", [font]);
                WrapHelper.shared["fpd_offsetHeight_set_cnt"] += 1;
              }
              return originalD_get.call(this);
            }`,
          },
        ],
      },
    ],
  },
  {
    parent_object: "HTMLElement.prototype",
    parent_object_property: "offsetWidth",
    wrapped_objects: [],
    post_wrapping_code: [
      {
        code_type: "object_properties",
        parent_object: "HTMLElement.prototype",
        parent_object_property: "offsetWidth",
        wrapped_objects: [
          {
            original_name: `
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth") ?
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")["get"] :
              HTMLElement.prototype.offsetWidth
            `,
            wrapped_name: "originalD_get",
          },
        ],
        wrapped_properties: [
          {
            property_name: "get",
            property_value: `function() {
              let font = this.style.fontFamily;
              if (WrapHelper.shared["fpd_offsetWidth_set_cnt"] < 1000) {
                updateCount("CSSStyleDeclaration.prototype.fontFamily", "set", [font]);
                WrapHelper.shared["fpd_offsetWidth_set_cnt"] += 1;
              }
              return originalD_get.call(this);
            }`,
          },
        ],
      },
    ],
  },
];

// ============================================================
// Convert fpdResourceMap → wrap_item format
// fp_build_*_wrapper expects [resource, type, props, sendArgs].
// ============================================================

function fpdResourceMapToWrapItems(resourceMap, reportArgsSet) {
  const items = [];
  for (const [resource, info] of resourceMap) {
    items.push([
      resource,
      info.type === "property" ? 1 : 0,
      info.props,                            // Set, not Array (fp_build_property_wrapper checks .size)
      reportArgsSet.has(resource) ? 1 : 0,
    ]);
  }
  return items;
}

// ============================================================
// CLI entry point — runs only when executed directly.
// When require()'d (e.g. from tests), only the exports are loaded.
// ============================================================
if (require.main === module) {
  const wrappersDir = process.argv[2];
  const outputFile =
    process.argv[3] || path.join(process.cwd(), "wrappers_generated.js");

  if (!wrappersDir) {
    console.error("Usage: node generate_wrappers.js <wrappersDir> [outputFile]");
    console.error("  wrappersDir — path to common/ with wrapping.js and wrappingS-*.js");
    process.exit(1);
  }

  // ----------------------------------------------------------
  // Load wrapper source files into the sandbox
  // ----------------------------------------------------------

  // wrapping.js defines add_wrappers() and string helper globals
  const wrappingJsPath = path.join(wrappersDir, "wrapping.js");
  if (fs.existsSync(wrappingJsPath)) {
    vm.runInContext(fs.readFileSync(wrappingJsPath, "utf8"), sandbox);
  }

  // Support files that define string helpers referenced by wrappers
  // (e.g. shuffleArray, randomString, crc16, alea)
  const supportFiles = ["helpers.js", "crc16.js", "alea.js"];
  for (const file of supportFiles) {
    const filePath = path.join(wrappersDir, file);
    if (fs.existsSync(filePath)) {
      try {
        vm.runInContext(fs.readFileSync(filePath, "utf8"), sandbox);
      } catch (e) {
        console.warn(`  ✗ ${file}: ${e.message}`);
      }
    }
  }

  // Load every wrapping descriptor file (wrappingS-*.js / wrappingL-*.js).
  // Each file calls add_wrappers(), which populates build_wrapping_code.
  const wrapperFiles = fs
    .readdirSync(wrappersDir)
    .filter((f) => /^wrapping[SL]-.*\.js$/.test(f))
    .sort();

  for (const file of wrapperFiles) {
    const filePath = path.join(wrappersDir, file);
    const source = fs.readFileSync(filePath, "utf8");
    try {
      vm.runInContext(source, sandbox);
    } catch (e) {
      console.warn(`  ✗ ${file}: ${e.message}`);
    }
  }

  // Read the populated descriptor map from the sandbox
  const finalWrappingCode = sandbox.build_wrapping_code;
  const keys = Object.keys(finalWrappingCode);

  // ----------------------------------------------------------
  // Load FPD (Fingerprint Detector) configuration
  //
  // Reads fp_config/wrappers-lvl_*.json. Builds:
  //   fpdResourceMap   — Map<resource, {type, props: Set<string>}>
  //                      union across all levels
  //   fpdReportArgsSet — Set<resource> for which sendArgs=1
  // ----------------------------------------------------------
  const fpConfigDir = path.join(wrappersDir, "fp_config");
  const fpdResourceMap = new Map();
  fpdReportArgsSet = new Set();

  if (fs.existsSync(fpConfigDir)) {
    const fpdFiles = fs
      .readdirSync(fpConfigDir)
      .filter((f) => /^wrappers-lvl_.+\.json$/.test(f))
      .sort();

    for (const file of fpdFiles) {
      const fpath = path.join(fpConfigDir, file);
      try {
        const config = JSON.parse(fs.readFileSync(fpath, "utf8"));

        for (const entry of config) {
          const resource = entry.resource;
          const type = entry.type;
          const groups = entry.groups || [];

          // Merge into resourceMap (union across levels/files)
          let acc = fpdResourceMap.get(resource);
          if (!acc) {
            acc = { type: type, props: new Set() };
            fpdResourceMap.set(resource, acc);
          }

          for (const g of groups) {
            const propName = g.property !== undefined ? g.property : "get";
            acc.props.add(propName);

            // sendArgs flag: any group with "arguments" => mark resource
            if ("arguments" in g) {
              fpdReportArgsSet.add(resource);
            }
          }
        }
      } catch (e) {
        console.warn(`  ✗ ${file}: ${e.message}`);
      }
    }
  }

  // ----------------------------------------------------------
  // Generate FPD_WRAPPERS table
  //
  // Two sources:
  //   1. FPD-only resources (in fpdResourceMap, not in build_wrapping_code)
  //      — built via fpBuild*Wrapper(), then generateWrapperFunction()
  //   2. fpdAdditionalWrappers (offsetHeight/Width) — already in
  //      descriptor form, run through generateWrapperFunction() directly
  //
  // Output is a separate FPD_WRAPPERS object; init() picks JSS or FPD
  // per-resource (Stage 2.5).
  // ----------------------------------------------------------
  let fpdGeneratedFunctions = ""; // accumulator for "key: function(args) {...}" entries
  let fpdEmittedCount = 0;

  if (fpdResourceMap.size > 0) {
    const wrapItems = fpdResourceMapToWrapItems(fpdResourceMap, fpdReportArgsSet);
    const jssKeys = new Set(keys);

    // FPD-only synthetic wrappers
    // Use Map for dedup: additional_wrappers below override entries
    // with same resource key (mirrors Firefox `fp_generate_from_wrappers`
    // override loop in fp_code_builders.js).
    const fpdEntriesMap = new Map();
    for (const item of wrapItems) {
      const resource = item[0];
      const isProperty = item[1] === 1;
      const desc = isProperty
        ? fpBuildPropertyWrapper(item)
        : fpBuildFunctionWrapper(item);

      // fpBuildPropertyWrapper returns {} for empty props — skip those
      if (!desc.parent_object) continue;

      try {
        const body = generateWrapperFunction(resource, desc);
        fpdEntriesMap.set(resource, body);
      } catch (e) {
        console.warn(`  ✗ ${resource}: ${e.message}`);
      }
    }

    // additional_wrappers (offsetHeight, offsetWidth)
    // These OVERRIDE any default property wrapper for the same resource
    // (Firefox does the same in fp_generate_from_wrappers).
    for (const desc of fpdAdditionalWrappers) {
      const resource = `${desc.parent_object}.${desc.parent_object_property}`;
      try {
        const body = generateWrapperFunction(resource, desc);
        fpdEntriesMap.set(resource, body);
      } catch (e) {
        console.warn(`  ✗ ${resource}: ${e.message}`);
      }
    }

    // Convert Map → array for the emit loop below; recompute count.
    const fpdEntries = Array.from(fpdEntriesMap, ([key, body]) => ({ key, body }));
    fpdEmittedCount = fpdEntries.length;

    // Build the "key: function(args) {...}" entries
    for (let i = 0; i < fpdEntries.length; i++) {
      const { key, body } = fpdEntries[i];
      fpdGeneratedFunctions += `    // ---- ${key} ----\n`;
      fpdGeneratedFunctions += `    ${JSON.stringify(key)}: function(args) {\n`;
      fpdGeneratedFunctions += `      try {\n`;
      fpdGeneratedFunctions += body;
      fpdGeneratedFunctions += `      } catch(e) {\n`;
      fpdGeneratedFunctions += `        console.error("[JShelter] FPD wrapper error (${key.replace(/"/g, '\\"')}):", e);\n`;
      fpdGeneratedFunctions += `      }\n`;
      fpdGeneratedFunctions += `    }`;
      fpdGeneratedFunctions += i < fpdEntries.length - 1 ? ",\n\n" : "\n";
    }
  }

  // ----------------------------------------------------------
  // Assemble the output file
  // ----------------------------------------------------------
  let output = `/**
  * wrappers_generated.js — AUTO-GENERATED by generate_wrappers.js, do not edit manually.
  *
  * Wrapper functions converted from string-based definitions to real JS functions.
  *
  * Register in manifest.json as a content_script with "world": "MAIN" alongside
  * an "ISOLATED" content_script that supplies config. Flow:
  *   1. ISOLATED script starts, fetches config
  *   2. MAIN script (this file) starts, requests config via sync Port
  *   3. For each wrapper in config, the matching function is called with args
  *   4. All wrapping completes before any page script runs
  */
  (() => {
    // NOTE: no "use strict" — original wrapper code uses implicit globals
    // in for-of loops (e.g. for (row of ...) without let/var/const)

    let inited = false;
    var original_functions = {};

    // ====== Runtime globals (set during init) ======
    var domainHash;
    var fpdTrackCallers;
    var prng;

    // ====== FPD globals ======
    // fp_enabled gates the per-wrapper counter-call hook. It stays false
    // until init() finishes, so wrappers applied early do not try to
    // postMessage to a port that is not connected yet.
    var fp_enabled = false;
    function updateCount(resource, type, args, stack) {
      try {
        port.postMessage({
          wrapperName: resource,
          wrapperType: type,
          wrapperArgs: args,
          stack: stack
        });
      } catch(e) {
        // Port may be torn down during page unload, etc. Swallow.
      }
    }

    // WASM farbling module placeholder (JS fallback used when not ready)
    var wasm = Object.freeze({ready: false});

    // ====== PRNG and CRC16 (needed by farbling wrappers) ======
    ${sandbox.crc16 || "// crc16 not available"}
    ${sandbox.alea || "// alea not available"}

    // ====== exportFunction shim (Chromium MAIN world) ======
    // In Firefox, exportFunction clones functions across security boundaries.
    // In Chromium MAIN world, we just need Object.defineProperty.
    if (typeof exportFunction === "undefined") {
      var exportFunction = function(fn, obj, opts) {
        if (opts && opts.defineAs) {
          try {
            Object.defineProperty(obj, opts.defineAs, {
              value: fn, configurable: true, writable: true, enumerable: true
            });
          } catch(e) {
            // Fallback for non-configurable properties
            try { obj[opts.defineAs] = fn; } catch(e2) {}
          }
        }
        return fn;
      };
    }

    // ====== WrapHelper shim (Chromium MAIN world) ======
    // In Firefox+NSCL, WrapHelper handles xray wrappers and cross-boundary
    // object marshalling. In Chromium MAIN world these are identity operations.
    if (typeof WrapHelper === "undefined") {
      var WrapHelper = {
        XRAY: false,
        shared: {},
        forPage: function(x) { return x; },
        _forPage: function(x) { return x; },
        isForPage: function() { return true; },
        unX: function(x) { return x; },
        defineProperty: function(obj, prop, descriptor) {
          return Object.defineProperty(obj, prop, descriptor);
        },
        defineProperties: function(obj, descriptors) {
          return Object.defineProperties(obj, descriptors);
        },
        create: function(proto, descriptors) {
          return descriptors
            ? Object.create(proto, descriptors)
            : Object.create(proto);
        },
        getDescriptor: function(obj, prop) {
          var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
          if (!descriptor) {
            for (var proto = Object.getPrototypeOf(obj); proto; proto = Object.getPrototypeOf(proto)) {
              descriptor = Object.getOwnPropertyDescriptor(proto, prop);
              if (descriptor) break;
            }
            if (!descriptor) descriptor = { enumerable: true, configurable: true };
          }
          return descriptor;
        },
        overlay: function(obj, data) {
          var props = Object.getOwnPropertyDescriptors(data);
          for (var p in props) {
            Object.defineProperty(obj, p, props[p]);
          }
          return obj;
        },
        pageAPI: function(f) { return f; },
        OriginalProxy: Proxy,
        Proxy: Proxy,
      };
      Object.freeze(WrapHelper);
    }

    // ====== Wrapper Functions ======
    // Each function receives args array from the level configuration.
    // Example: WRAPPERS["Performance.prototype.now"]([2, true])
    //   where args[0]=precision, args[1]=doNoise
    var WRAPPERS = {

  `;

  // Generate each wrapper function
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const wrapper = finalWrappingCode[key];
    const body = generateWrapperFunction(key, wrapper);

    output += `    // ---- ${key} ----\n`;
    output += `    ${JSON.stringify(key)}: function(args) {\n`;
    output += `      try {\n`;
    output += body;
    output += `      } catch(e) {\n`;
    output += `        console.error("[JShelter] Wrapper error (${key.replace(/"/g, '\\"')}):", e);\n`;
    output += `      }\n`;
    output += `    }`;
    output += i < keys.length - 1 ? ",\n\n" : "\n";
  }

  output += `
    }; // end WRAPPERS

    // ====== FPD_WRAPPERS ======
    // Synthetic wrappers for FPD-only resources + offsetHeight/Width
    // proxies for font fingerprinting detection. They just call the
    // original API and emit the telemetry hook (gated by fp_enabled,
    // so zero-cost when FPD is off). init() picks JSS or FPD per-resource.
    var FPD_WRAPPERS = {

  ${fpdGeneratedFunctions}
    }; // end FPD_WRAPPERS

    // Initialize counters needed by additional_wrappers (offsetHeight/Width)
    WrapHelper.shared["fpd_offsetHeight_set_cnt"] = 0;
    WrapHelper.shared["fpd_offsetWidth_set_cnt"] = 0;

    // ====== Function.prototype.toString protection ======
    // Prevents detection of wrapped functions by returning the
    // original function's toString() result.
    // Uses Object.defineProperty to bypass patchWindow interception
    // which can strip function names when using direct assignment.
    function setupToStringProtection() {
      var originalToStringF = Function.prototype.toString;
      var originalToStringStr = originalToStringF.call(originalToStringF);
      var replacement = function toString() {
        var currentString = originalToStringF.call(this);
        var seen = 0;
        while (original_functions[currentString] !== undefined && seen < 10) {
            currentString = original_functions[currentString];
            seen++;
        }
        return currentString;
        // var originalStr = original_functions[currentString];
        // return (originalStr !== undefined) ? originalStr : currentString;
      };
      Object.defineProperty(Function.prototype, 'toString', {
        value: replacement,
        writable: true,
        configurable: true,
        enumerable: false
      });
      original_functions[originalToStringF.call(replacement)] = originalToStringStr;
    }

    // ====== Initialization ======
    // Called once with config from the ISOLATED world content script.
    // Config: { domainHash, fpdTrackCallers, wrappers: [[key, ...args], ...],
    //           fpdWrappers: [[resource, type, props, sendArgs], ...] }
    var init = function(config) {
      if (inited) return;
      inited = true;

      domainHash = config.domainHash;
      fpdTrackCallers = config.fpdTrackCallers;

      // Initialize PRNG — assign to outer scope so wrappers can access it
      prng = alea(domainHash);

      // Apply JSS wrappers from config.wrappers / config.currentLevel.wrappers.
      // Track which resources got JSS-wrapped so the FPD pass below skips
      // them — JSS wrappers already include the FPD telemetry hook that
      // was inlined at build time (Stage 2.3).
      var jssApplied = new Set();
      var wrappersList = config.wrappers || (config.currentLevel && config.currentLevel.wrappers) || [];
      for (var i = 0; i < wrappersList.length; i++) {
        var entry = wrappersList[i];
        var key = entry[0];
        var wrapperArgs = entry.slice(1);
        if (WRAPPERS[key]) {
          try {
            WRAPPERS[key](wrapperArgs);
            jssApplied.add(key);
          } catch(e) {
            console.error("[JShelter] Wrapper error (" + key + "):", e);
          }
        }
      }

      // Apply FPD-only wrappers from config.fpdWrappers.
      // Format: [resource, type, props_array, sendArgs] — same as
      // Skip resources already wrapped by JSS (their FPD telemetry
      // hook was built in at build time).
      var fpdList = config.fpdWrappers || [];
      for (var j = 0; j < fpdList.length; j++) {
        var fpdEntry = fpdList[j];
        var fpdKey = fpdEntry[0];
        if (jssApplied.has(fpdKey)) continue;
        if (FPD_WRAPPERS[fpdKey]) {
          try {
            FPD_WRAPPERS[fpdKey](fpdEntry.slice(1));
          } catch(e) {
            console.error("[JShelter] FPD wrapper error (" + fpdKey + "):", e);
          }
        }
      }

      // Patch Function.prototype.toString after all wrappers are applied
      setupToStringProtection();

      // Enable FPD telemetry hook now that all wrappers are applied
      // and the port is connected. Until this point updateCount() inside
      // wrappers is short-circuited via \`if (fp_enabled)\` (Stage 2.3).
      fp_enabled = true;
    };

    // ====== Port Communication ======
    // Sync messaging between MAIN (this script) and ISOLATED world via
    // CustomEvent dispatch. This script generates a random portId,
    // dispatches "jshelter-bootstrap", then exchanges {init: true} ↔ config.
    // We save original DOM methods before page scripts can override them.

    var _dispatchEvent = window.dispatchEvent.bind(window);
    var _addEventListener = window.addEventListener.bind(window);
    var _CustomEvent = window.CustomEvent;
    var _getRandomValues = crypto.getRandomValues.bind(crypto);

    // Generate cryptographically random port ID for this page instance
    var _portIdBuf = new Uint8Array(16);
    _getRandomValues(_portIdBuf);
    var portId = "jshelter_";
    for (var _i = 0; _i < _portIdBuf.length; _i++) {
      portId += _portIdBuf[_i].toString(16).padStart(2, "0");
    }

    /**
     * Synchronous Port using CustomEvent dispatch.
     * postMessage() is blocking — return value comes back via a
     * "return:" event before postMessage() exits.
     */
    function Port(from, to) {
      var retStack = [];
      var self = this;

      function fire(e, detail) {
        _dispatchEvent(new _CustomEvent(portId + ":" + e, {
          detail: detail, composed: true
        }));
      }

      this.postMessage = function(msg) {
        retStack.push({});
        fire(to, {msg: msg});
        var ret = retStack.pop();
        if (ret.error) throw ret.error;
        return ret.value;
      };

      _addEventListener(portId + ":" + from, function(event) {
        if (typeof self.onMessage === "function" && event.detail) {
          var ret = {};
          try {
            ret.value = self.onMessage(event.detail.msg, event);
          } catch (error) {
            ret.error = error;
          }
          fire("return:" + to, ret);
        }
      }, true);

      _addEventListener(portId + ":return:" + from, function(event) {
        if (event.detail && retStack.length) {
          retStack[retStack.length - 1] = event.detail;
        }
      }, true);

      this.onMessage = null;
    }

    // Create port (MAIN world side)
    // "extension" = we listen for messages from extension (ISOLATED world)
    // "page"      = we send messages to the page channel (ISOLATED listens)
    var port = new Port("extension", "page");

    // Tell ISOLATED world our portId so it can create its side of the port
    _dispatchEvent(new _CustomEvent("jshelter-bootstrap", {
      detail: {portId: portId}
    }));

    // Handle push from ISOLATED world (if config arrives later)
    port.onMessage = function(msg) {
      if (msg && msg.domainHash) {
        init(msg);
      }
    };

    // Try to pull config immediately (ISOLATED may already have it)
    var conf = port.postMessage({init: true});
    if (conf && conf.domainHash) init(conf);
  })();
  `;

  // ----------------------------------------------------------
  // Write the generated script to disk
  // ----------------------------------------------------------
  fs.writeFileSync(outputFile, output, "utf8");
}

// ============================================================
// Module exports — pure code-generators, exposed for unit tests.
// ============================================================
if (typeof module !== "undefined") {
  module.exports = {
    genExistenceCheck,
    genWrappedObjects,
    genHelpingCode,
    genFunctionReplacement,
    genDeleteProperties,
    genObjectProperties,
    genAssignment,
    genFunctionExport,
    genPostWrappingCode,
    genFreeze,
    genPrototype,
    generateWrapperFunction,
  };
}
