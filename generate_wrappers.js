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
 * script under Manifest V3.
 *
 * All wrapper code is produced by build_code() from common/code_builders.js
 * and by the FPD descriptor builders from common/fp_code_builders.js, both
 * evaluated in a vm sandbox — i.e. by the very same pipeline that Firefox
 * uses at injection time (fp_generate_from_wrappers() calls build_code() the
 * same way). This file therefore only:
 *   1. evaluates the wrapper descriptor files in the sandbox;
 *   2. calls build_code() per wrapper and strips the enclose_wrapping()
 *      envelope, embedding the body as a per-resource function of the
 *      WRAPPERS / FPD_WRAPPERS tables;
 *   3. assembles the MAIN-world output with identity shims for
 *      exportFunction and WrapHelper, an init() entry point and a Port
 *      that negotiates with the ISOLATED-world content script.
 *
 *     The exportFunction shim additionally carries the Function.prototype
 *     .toString cloaking adapted from the NoScript Commons Library
 *     (nscl/common/Worlds.main.js, GPL-3.0-or-later): a WeakMap keyed by the
 *     exported function object, consulted by a Proxy installed over
 *     Function.prototype.toString. Registration happens inside the shim, so
 *     every export — including the nested function_define replacements that
 *     define_page_context_function() emits (Date.now) — is covered without
 *     the descriptors or the generator having to know about it.
 *
 * The sandbox sets jshelter_target = "chromium" so that build_code() omits
 * the xray marshalling block (xrayWindow/cloneInto do not exist in the MAIN
 * world). Everything else, including the post-export copy of own properties
 * (the replacement loses e.g. Date.prototype/parse/UTC on export), is emitted
 * by the shared builders for both platforms.
 *
 * The converter is invoked by the Chromium build target in Makefile; its
 * output wrappers_generated.js is placed into build/chrome/ before the
 * extension is packaged.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ============================================================
// Sandbox environment for loading wrapper source files
// ============================================================

const sandbox = {
  build_wrapping_code: {},

  // wrapping.js normally defines add_wrappers(); we provide our own to
  // capture wrappers into our map (wrapping.js may redefine it, which is
  // fine — we read sandbox.build_wrapping_code after loading).
  add_wrappers(wrappers) {
    for (const wrapper of wrappers) {
      const key = wrapper.parent_object + "." + wrapper.parent_object_property;
      sandbox.build_wrapping_code[key] = wrapper;
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
    storage: { local: { get() {}, set() {} }, sync: { get() {}, set() {} }, onChanged: { addListener() {} } },
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

// The exact envelope emitted by enclose_wrapping() with no extra args.
const ENVELOPE_OPEN = "try{(function(...args) {";
const ENVELOPE_CLOSE = "})();} catch (e) {console.error(e)}";

/**
 * Strip the IIFE envelope from build_code() output. The body must be embedded
 * directly into a `function(args)` table entry: the envelope's rest parameter
 * would otherwise shadow the runtime args array with an empty one.
 * Throws on an unexpected shape so that a build fails loudly instead of
 * silently emitting broken wrappers.
 */
function stripEnvelope(wrapped) {
  if (typeof wrapped !== "string"
      || !wrapped.startsWith(ENVELOPE_OPEN)
      || !wrapped.endsWith(ENVELOPE_CLOSE)) {
    throw new Error("generate_wrappers.js is out of sync with enclose_wrapping()");
  }
  return wrapped.slice(ENVELOPE_OPEN.length, -ENVELOPE_CLOSE.length);
}

// ============================================================
// Load the shared code builders into the sandbox, then the descriptors.
// ============================================================

function loadIntoContext(dir, files) {
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    try {
      vm.runInContext(fs.readFileSync(filePath, "utf8"), sandbox);
    } catch (e) {
      console.warn(`  \u2717 ${file}: ${e.message}`);
    }
  }
}

function loadDescriptors(wrappersDir) {
  // wrapping.js defines build_wrapping_code / add_wrappers / string helpers.
  loadIntoContext(wrappersDir, ["wrapping.js"]);
  // Support files: string helpers, PRNG, CRC and — crucially — the shared
  // code builders for both JSS and FPD.
  loadIntoContext(wrappersDir,
    ["helpers.js", "crc16.js", "alea.js", "code_builders.js", "fp_code_builders.js"]);
  // Switch to the Chromium target before any build_code() call: suppresses
  // the xray marshalling block, which references xrayWindow/cloneInto.
  sandbox.jshelter_target = "chromium";

  const wrapperFiles = fs
    .readdirSync(wrappersDir)
    .filter((f) => /^wrapping[SL]-.*\.js$/.test(f))
    .sort();
  loadIntoContext(wrappersDir, wrapperFiles);
}

// ============================================================
// Bridges into the sandbox. Evaluated inside the context so they can see
// even the global lexical bindings of code_builders.js.
// ============================================================

const inCtx = (expr) => vm.runInContext(expr, sandbox);

const buildCode = () => inCtx("(wrapper) => build_code(wrapper)");
const joinCode = () => inCtx("(arr) => joinWrappingCode(arr)");
const fpBuildPropertyWrapper = () => inCtx("(item) => fp_build_property_wrapper(item)");
const fpBuildFunctionWrapper = () => inCtx("(item) => fp_build_function_wrapper(item)");
const fpAppendReporting = () => inCtx("(items) => fp_append_reporting_to_jss_wrappers(items)");

/**
 * Produce the table-function body for a single wrapper descriptor using the
 * shared pipeline: build_code() + joinWrappingCode() (the Object.create /
 * Object.defineProperty -> WrapHelper rewrite, with the MAIN-world shim being
 * identity) + envelope strip.
 */
function buildWrapperBody(desc) {
  return joinCode()([stripEnvelope(buildCode()(desc))]);
}

// ============================================================
// FPD descriptor plumbing — same wrap_item format as Firefox
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

/**
 * Build bodies for the FPD_WRAPPERS table, mirroring fp_generate_from_wrappers():
 * descriptor via fp_build_*_wrapper(), overridden by additional_wrappers when
 * the resource is FPD-monitored. report_args are attached to the JSS
 * descriptors first via fp_append_reporting_to_jss_wrappers(), exactly as
 * fp_assemble_injection() does on Firefox.
 */
function buildFpdBodies(fpdItems) {
  fpAppendReporting()(fpdItems);
  const bodies = new Map();
  for (const item of fpdItems) {
    const resource = item[0];
    const desc = item[1] ? fpBuildPropertyWrapper()(item) : fpBuildFunctionWrapper()(item);
    if (!desc.parent_object) continue; // empty property set
    bodies.set(resource, buildWrapperBody(desc));
  }
  for (const additional of sandbox.additional_wrappers) {
    const resource = `${additional.parent_object}.${additional.parent_object_property}`;
    if (bodies.has(resource)) {
      bodies.set(resource, buildWrapperBody(additional));
    }
  }
  return bodies;
}

// ============================================================
// Chromium MAIN-world export shim, emitted verbatim into the output.
// ============================================================
/**
 * exportFunction + Function.prototype.toString cloaking for the MAIN world.
 *
 * The toString mechanism is adapted from the NoScript Commons Library
 * (nscl/common/Worlds.main.js, Copyright (C) 2020-2024 Giorgio Maone
 * <https://maone.net>, GPL-3.0-or-later). NSCL installs the WeakMap/Proxy pair
 * inside its exportFunction(); we do the same, which is why every export is
 * covered by construction.
 *
 * Deliberate deviations from NSCL:
 *   - no Proxy is returned: JShelter wrappers rely on plain function identity
 *     for property writes and `new`, and the copy-back loop emitted by
 *     build_code() must operate on the real function object;
 *   - the displaced original is resolved via descriptors first (reading a
 *     native accessor off its prototype throws "Illegal invocation");
 *   - the map is exposed as exportFunction._toStringMap for introspection and
 *     for the tests, which evaluate this very string.
 */
const EXPORT_SHIM_SOURCE = `// ====== exportFunction shim + toString cloaking (Chromium MAIN world) ======
// In Firefox, exportFunction clones functions across security boundaries and
// hides them behind an XPC proxy; here Object.defineProperty performs the
// export, which would leave the replacement's own source text visible to
// Function.prototype.toString(). The cloaking below closes that hole: the
// replacement reports the source of the function it displaced, exactly like
// Firefox reports the source of the pristine original.
//
// BEGIN code adapted from NoScript Commons Library, nscl/common/Worlds.main.js
//   Copyright (C) 2020-2024 Giorgio Maone <https://maone.net>
//   SPDX-License-Identifier: GPL-3.0-or-later
if (typeof exportFunction === "undefined") {
  var _toStringMap = new WeakMap();
  var _originalToStringF = Function.prototype.toString;
  var _toStringProxy = new Proxy(_originalToStringF, {
    apply: function(target, thisArg, args) {
      return _toStringMap.has(thisArg)
        ? _toStringMap.get(thisArg)
        : Reflect.apply(target, thisArg, args);
    }
  });
  _toStringMap.set(_toStringProxy, _originalToStringF.call(_originalToStringF));
  Object.defineProperty(Function.prototype, "toString", {
    value: _toStringProxy,
    writable: true,
    configurable: true,
    enumerable: false
  });
  // END NSCL-derived toString cloaking

  // Resolve the value a wrapper is about to displace. Descriptor-first: reading
  // an accessor off its home prototype would throw Illegal invocation. The
  // prototype walk mirrors NSCL for accessor exports ("get foo").
  function _displacedOriginal(obj, name, accessor) {
    try {
      for (var o = obj; o; o = Object.getPrototypeOf(o)) {
        var d = Object.getOwnPropertyDescriptor(o, name);
        if (d) {
          if (accessor) return d[accessor];
          if ("value" in d) return d.value;
        }
      }
    } catch (e) {}
    try { return obj[name]; } catch (e) { return undefined; }
  }

  var exportFunction = function(fn, obj, opts) {
    var defineAs = opts && opts.defineAs;
    if (!defineAs) return fn;
    var m = /^(get|set)\\s+(\\w+)$/.exec(defineAs);
    var accessor = m ? m[1] : null;
    var name = m ? m[2] : defineAs;

    // Snapshot the displaced source BEFORE the export overwrites the property.
    var original = _displacedOriginal(obj, name, accessor);

    try {
			let slotPD = name && Object.getOwnPropertyDescriptor(obj, name);
			if (slotPD) {
				if (accessor) {
					slotPD[accessor] = fn;
				}
				else {
					slotPD.value = fn;
				}
	      Object.defineProperty(obj, name, slotPD);
			}
			else {
        // A fresh slot has no descriptor to inherit attributes from, so they
        // are fixed explicitly (the ONE sanctioned enumerable:true — see the
        // "creates a fresh slot" test). The accessor phrase must be honoured:
        // "get v" defines a getter on "v", never a data property and never a
        // property literally named "get v".
        Object.defineProperty(obj, name, accessor
          ? { [accessor]: fn, configurable: true, enumerable: true }
          : { value: fn, configurable: true, writable: true, enumerable: true });
			}
    } catch (e) {
			console.debug("Regular function assignment failed!", obj, name, e);
      try { obj[defineAs] = fn; } catch (e2) {}
    }

    // Report the displaced function's source for the replacement. Chain through
    // the map so re-exporting an already cloaked function cannot unmask it.
    if (typeof fn === "function" && typeof original === "function") {
      try {
        _toStringMap.set(fn, _toStringMap.has(original)
          ? _toStringMap.get(original)
          : _originalToStringF.call(original));
      } catch (e) {}
    }
    return fn;
  };
  exportFunction._toStringMap = _toStringMap;
}
`;

// ============================================================
// MAIN-world runtime template
// ============================================================

function assembleOutput({ jssEntries, fpdEntries, fpdInitCode }) {
  const emitTable = (entries, label) => entries.map(({ key, body }, i) =>
      `    // ---- ${key} ----\n` +
      `    ${JSON.stringify(key)}: function(args) {\n` +
      `      try {\n${body}\n` +
      `      } catch(e) {\n` +
      `        console.error("[JShelter] ${label} error (${key.replace(/"/g, '\\"')}):", e);\n` +
      `      }\n` +
      `    }` + (i < entries.length - 1 ? ",\n\n" : "\n")
    ).join("");

  return `/**
* wrappers_generated.js — AUTO-GENERATED by generate_wrappers.js, do not edit manually.
*
* Wrapper bodies are produced by common/code_builders.js (build_code()), the
* same pipeline Firefox uses at injection time. Only the MAIN-world envelope,
* shims and init/Port plumbing come from generate_wrappers.js. The
* Function.prototype.toString cloaking lives in the exportFunction shim and is
* adapted from the NoScript Commons Library (see EXPORT_SHIM_SOURCE).
*/
(() => {
  // NOTE: no "use strict" — original wrapper code uses implicit globals
  // in for-of loops without let/var/const

  let inited = false;

  // ====== Runtime globals (set during init) ======
  var domainHash;
  var fpdTrackCallers;
  var prng;

  // ====== FPD globals ======
  // fp_enabled gates the per-wrapper counter hook inlined by
  // create_counter_call(). It stays false until init() finishes.
  var fp_enabled = false;
  ${sandbox.fpd_updateCountCode || "// fpd_updateCountCode not available"}

  // WASM farbling module placeholder (JS fallback used when not ready)
  var wasm = Object.freeze({ready: false});

  // ====== PRNG and CRC16 (needed by farbling wrappers) ======
  ${sandbox.crc16 || "// crc16 not available"}
  ${sandbox.alea || "// alea not available"}

  ${EXPORT_SHIM_SOURCE}

  // ====== WrapHelper shim (Chromium MAIN world) ======
  // Identity counterparts of the xray-aware WrapHelper from generate_code().
  if (typeof WrapHelper === "undefined") {
    var WrapHelper = {
      XRAY: false,
      shared: {},
      forPage: function(x) { return x; },
      _forPage: function(x) { return x; },
      isForPage: function() { return true; },
      unX: function(x) { return x; },
			exportFunction: function(funcToExport, targetObj, options) {
				return exportFunction(funcToExport, targetObj, options);
			},
      defineProperty: function(obj, prop, descriptor) {
        return Object.defineProperty(obj, prop, descriptor);
      },
      defineProperties: function(obj, descriptors) {
        return Object.defineProperties(obj, descriptors);
      },
      create: function(proto, descriptors) {
        return descriptors ? Object.create(proto, descriptors) : Object.create(proto);
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

  // ====== Wrapper Functions (bodies emitted by build_code()) ======
  var WRAPPERS = {

${emitTable(jssEntries, "JSS wrapper")}
  }; // end WRAPPERS

  // ====== FPD_WRAPPERS (fp_build_*_wrapper() + build_code()) ======
  var FPD_WRAPPERS = {

${emitTable(fpdEntries, "FPD wrapper")}
  }; // end FPD_WRAPPERS

  var init = function(config) {
    if (inited) return;
    inited = true;

    domainHash = config.domainHash;
    fpdTrackCallers = config.fpdTrackCallers;
    prng = alea(domainHash);

    ${fpdInitCode}

    var jssApplied = new Set();
    var wrappersList = config.wrappers || (config.currentLevel && config.currentLevel.wrappers) || [];
    for (var i = 0; i < wrappersList.length; i++) {
      var entry = wrappersList[i];
      var key = entry[0];
      if (WRAPPERS[key]) {
        try {
          WRAPPERS[key](entry.slice(1));
          jssApplied.add(key);
        } catch(e) {
          console.error("[JShelter] Wrapper error (" + key + "):", e);
        }
      }
    }

    // FPD-only resources; JSS-wrapped ones already carry the inlined hook.
    var fpdList = config.fpdWrappers || [];
    for (var j = 0; j < fpdList.length; j++) {
      var fpdKey = fpdList[j][0];
      if (jssApplied.has(fpdKey)) continue;
      if (FPD_WRAPPERS[fpdKey]) {
        try {
          FPD_WRAPPERS[fpdKey](fpdList[j].slice(1));
        } catch(e) {
          console.error("[JShelter] FPD wrapper error (" + fpdKey + "):", e);
        }
      }
    }

    fp_enabled = true;
  };

  // ====== Port Communication (CustomEvent-based sync port) ======
  var _dispatchEvent = window.dispatchEvent.bind(window);
  var _addEventListener = window.addEventListener.bind(window);
  var _CustomEvent = window.CustomEvent;
  var _getRandomValues = crypto.getRandomValues.bind(crypto);

  var _portIdBuf = new Uint8Array(16);
  _getRandomValues(_portIdBuf);
  var portId = "jshelter_";
  for (var _i = 0; _i < _portIdBuf.length; _i++) {
    portId += _portIdBuf[_i].toString(16).padStart(2, "0");
  }

  function Port(from, to) {
    var retStack = [];
    var self = this;

    function fire(e, detail) {
      _dispatchEvent(new _CustomEvent(portId + ":" + e, { detail: detail, composed: true }));
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

  var port = new Port("extension", "page");

  _dispatchEvent(new _CustomEvent("jshelter-bootstrap", { detail: { portId: portId } }));

  port.onMessage = function(msg) {
    if (msg && msg.domainHash) {
      init(msg);
    }
  };

  var conf = port.postMessage({ init: true });
  if (conf && conf.domainHash) init(conf);
})();
`;
}

// ============================================================
// CLI entry point
// ============================================================
if (require.main === module) {
  const wrappersDir = process.argv[2];
  const outputFile = process.argv[3] || path.join(process.cwd(), "wrappers_generated.js");

  if (!wrappersDir) {
    console.error("Usage: node generate_wrappers.js <wrappersDir> [outputFile]");
    process.exit(1);
  }

  loadDescriptors(wrappersDir);

  const finalWrappingCode = sandbox.build_wrapping_code;
  const keys = Object.keys(finalWrappingCode);

  const jssEntries = [];
  for (const key of keys) {
    try {
      jssEntries.push({ key, body: buildWrapperBody(finalWrappingCode[key]) });
    } catch (e) {
      console.warn(`  \u2717 ${key}: ${e.message}`);
    }
  }

  // FPD config: union across fp_config/wrappers-lvl_*.json
  const fpConfigDir = path.join(wrappersDir, "fp_config");
  const fpdResourceMap = new Map();
  const fpdReportArgsSet = new Set();
  if (fs.existsSync(fpConfigDir)) {
    for (const file of fs.readdirSync(fpConfigDir).filter(f => /^wrappers-lvl_.+\.json$/.test(f)).sort()) {
      try {
        for (const entry of JSON.parse(fs.readFileSync(path.join(fpConfigDir, file), "utf8"))) {
          let acc = fpdResourceMap.get(entry.resource);
          if (!acc) {
            acc = { type: entry.type, props: new Set() };
            fpdResourceMap.set(entry.resource, acc);
          }
          for (const g of entry.groups || []) {
            acc.props.add(g.property !== undefined ? g.property : "get");
            if ("arguments" in g) fpdReportArgsSet.add(entry.resource);
          }
        }
      } catch (e) {
        console.warn(`  \u2717 ${file}: ${e.message}`);
      }
    }
  }

  const fpdMap = fpdMapBuild();
  function fpdMapBuild() {
    const out = new Map();
    if (fpdResourceMap.size === 0) return out;
    const bodies = buildFpdBodies(fpdResourceMapToWrapItems(fpdResourceMap, fpdReportArgsSet));
    for (const [key, body] of bodies) out.set(key, body);
    return out;
  }
  const fpdEntries = Array.from(fpdMap, ([key, body]) => ({ key, body }));

  const output = assembleOutput({
    jssEntries,
    fpdEntries,
    fpdInitCode: sandbox.additional_wrappers_init_code
      || "// additional_wrappers_init_code not available",
  });

  fs.writeFileSync(outputFile, output, "utf8");
}

// ============================================================
// Module exports for unit tests.
// The previous per-step generators (genExistenceCheck, genFunctionReplacement,
// ...) are gone on purpose: the steps are no longer duplicated here. Tests
// should assert on the emitted bodies instead — e.g. that a buildWrapperBody()
// output of a function_define wrapper contains exportFunction( followed by the
// own-property copy loop, and that genPostWrappingCode's apply_if/else FPD
// shape comes out of build_code() unchanged.
// ============================================================
if (typeof module !== "undefined") {
  module.exports = {
    sandbox,
    loadDescriptors,
    stripEnvelope,
		ENVELOPE_OPEN,
		ENVELOPE_CLOSE,
    EXPORT_SHIM_SOURCE,
    buildWrapperBody,
    buildFpdBodies,
    fpdResourceMapToWrapItems,
  };
}
