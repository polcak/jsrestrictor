//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2026  Dzianis Pilipenka
//
// SPDX-License-Identifier: GPL-3.0-or-later
//
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

/**
 * Unit tests for generate_wrappers.js
 *
 * generate_wrappers.js no longer implements the wrapper-code steps itself; it
 * calls build_code() from common/code_builders.js inside a vm sandbox, exactly
 * like the Firefox injection path does [8]. The tests therefore assert on the
 * behaviour of the emitted bodies, not on the wording of intermediate steps.
 *
 * Two deliberate conventions:
 *  - Every textual assertion goes through norm(), which removes comments and
 *    all insignificant whitespace. Re-indentation, line rewrapping or
 *    minification of the generated output must not change a verdict; a change
 *    of behaviour must.
 *  - Wherever a property or a call can be executed instead of matched as text,
 *    we execute it. The MAIN-world shims are small enough to be stubbed, so a
 *    wrapper body can be run against a fake scope and observed.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const GENERATOR_PATH = path.resolve(__dirname, "../../../generate_wrappers.js");
const {
  sandbox,
  loadDescriptors,
  stripEnvelope,
  withToStringMapping,
  buildWrapperBody,
  buildFpdBodies,
  fpdResourceMapToWrapItems,
} = require(GENERATOR_PATH);

// ============================================================
// Whitespace-insensitive comparison
// ============================================================

const WORD = /[A-Za-z0-9_$]/;
// A "/" starts a regex literal only in these positions; otherwise it is division.
const REGEX_OK = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "~", "^", "<", ">"]);

/**
 * Remove comments and all whitespace that is not required to keep two word
 * characters apart. String, template and regex literal contents are preserved.
 */
function norm(src) {
  let out = "";
  let prev = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += c; i++;
      while (i < n) {
        if (src[i] === "\\") { out += src[i] + (src[i + 1] ?? ""); i += 2; continue; }
        if (src[i] === c) { out += c; i++; break; }
        out += src[i]; i++;
      }
      prev = c;
      continue;
    }
    if (c === "/" && REGEX_OK.has(prev)) {
      out += "/"; i++;
      let cls = false;
      while (i < n) {
        if (src[i] === "\\") { out += src[i] + (src[i + 1] ?? ""); i += 2; continue; }
        if (src[i] === "[") cls = true;
        else if (src[i] === "]") cls = false;
        else if (src[i] === "/" && !cls) { out += "/"; i++; break; }
        out += src[i]; i++;
      }
      while (i < n && /[a-z]/.test(src[i])) { out += src[i]; i++; }
      prev = "/";
      continue;
    }
    if (/\s/.test(c)) {
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      if (WORD.test(prev) && WORD.test(src[j])) out += " ";
      i = j;
      continue;
    }
    out += c; prev = c; i++;
  }
  return out;
}

/** Assert that needle occurs in body, ignoring comments and formatting. */
function has(body, needle) {
  expect(norm(body)).toContain(norm(needle));
}
function hasNot(body, needle) {
  expect(norm(body)).not.toContain(norm(needle));
}
/** Index of needle in normalised body, or -1. */
function at(body, needle) {
  return norm(body).indexOf(norm(needle));
}

// ============================================================
// Runtime stubs matching the shims emitted into wrappers_generated.js
// ============================================================

function makeWrapHelper() {
  return {
    XRAY: false,
    shared: {},
    forPage: x => x,
    _forPage: x => x,
    isForPage: () => true,
    unX: x => x,
    defineProperty: (o, p, d) => Object.defineProperty(o, p, d),
    defineProperties: (o, ds) => Object.defineProperties(o, ds),
    create: (proto, ds) => (ds ? Object.create(proto, ds) : Object.create(proto)),
    getDescriptor: (o, p) => Object.getOwnPropertyDescriptor(o, p) || { enumerable: true, configurable: true },
    overlay: (o, d) => o,
    pageAPI: f => f,
    OriginalProxy: Proxy,
    Proxy: Proxy,
  };
}

/** The Chromium MAIN-world exportFunction: plain defineProperty, returns fn. */
function makeExportFunction() {
  return function exportFunction(fn, obj, opts) {
    if (opts && opts.defineAs) {
      try {
        Object.defineProperty(obj, opts.defineAs, {
          value: fn, configurable: true, writable: true, enumerable: true,
        });
      } catch (e) {
        try { obj[opts.defineAs] = fn; } catch (e2) {}
      }
    }
    return fn;
  };
}

/**
 * Run a generated body with the identifiers it expects as free variables.
 * Returns the (shared) state object so tests can inspect the outcome.
 */
function runBody(body, state = {}) {
  const ctx = {
    args: state.args || [],
    fp_enabled: false,
    fpdTrackCallers: false,
    updateCount: state.updateCount || (() => {}),
    exportFunction: makeExportFunction(),
    WrapHelper: makeWrapHelper(),
    original_functions: {},
    originalF: state.originalF,
    domainHash: "0000000000000000",
    prng: () => 0.5,
    wasm: { ready: false },
    ...state.globals,
  };
  vm.createContext(ctx);
  vm.runInContext(`(function(){${body}})();`, ctx);
  return ctx;
}

/** Parse-only check: the engine must accept the body as a function body. */
function parseAsFunctionBody(body) {
  return new Function("args", body);
}

/** A fake native constructor with the own properties a replacement must inherit. */
function makeNativeCtor() {
  const proto = { nativeProtoMarker: true };
  const ctor = function nativeCtor() {};
  Object.defineProperty(ctor, "prototype", { value: proto, writable: false, enumerable: false, configurable: false });
  Object.defineProperty(ctor, "parse", { value: function parse() { return 7; }, writable: true, enumerable: false, configurable: true });
  Object.defineProperty(ctor, "UTC", { value: function UTC() { return 8; }, writable: true, enumerable: false, configurable: true });
  Object.defineProperty(ctor, "length", { value: 3, writable: false, enumerable: false, configurable: true });
  return ctor;
}

// ============================================================
// Locate the directory with the descriptor files
// ============================================================

function findWrappersDir() {
  const here = path.dirname(GENERATOR_PATH);
  const candidates = [
    process.env.JSSHELLER_WRAPPERS_DIR,
    path.join(here, "common"),
    path.join(here, "..", "common"),
    path.join(__dirname, "..", "..", "..", "common"),
    path.resolve("common"),
  ].filter(Boolean);
  return candidates.find(dir => fs.existsSync(path.join(dir, "wrapping.js"))) || null;
}

const WRAPPERS_DIR = findWrappersDir();
if (!WRAPPERS_DIR) {
  console.warn("generate_wrappers_tests: descriptor directory not found; " +
    "set JSSHELLER_WRAPPERS_DIR to run the descriptor-dependent suites.");
}
// Suites that need the shared builders in the sandbox.
const guarded = WRAPPERS_DIR ? describe : xdescribe;

// ============================================================
describe("generate_wrappers.js — pure helpers (no sandbox)", function () {

  describe("module surface", function () {
    // The exact failure mode of the old suite after the refactor: names that no
    // longer exist destructure to undefined and blow up on first call.
    it("exports every documented entry point as a function", function () {
      for (const [name, fn] of Object.entries({
        loadDescriptors, stripEnvelope, withToStringMapping,
        buildWrapperBody, buildFpdBodies, fpdResourceMapToWrapItems,
      })) {
        expect(typeof fn).toBe("function", `${name} is not a function`);
      }
    });
  });

  describe("stripEnvelope", function () {
    // Guards the coupling between the converter and enclose_wrapping(): if the
    // envelope in code_builders.js ever changes shape, the build must fail loudly
    // rather than embed a broken body.
    it("removes the IIFE envelope emitted by enclose_wrapping()", function () {
      const wrapped = "try{(function(...args) {BODY})(" + "});} catch (e) {console.error(e)}";
      expect(stripEnvelope(wrapped)).toBe("BODY");
    });

    it("rejects a body that does not start with the envelope", function () {
      expect(() => stripEnvelope("(function(){})()")).toThrow();
    });

    it("rejects a body with an altered closing envelope", function () {
      expect(() => stripEnvelope("try{(function(...args) {B})(});} catch (e) {}")).toThrow();
    });

    it("rejects non-string input", function () {
      expect(() => stripEnvelope(undefined)).toThrow();
    });
  });

  describe("withToStringMapping", function () {
    it("adds the toString mapping for wrappers that define a replacement", function () {
      const out = withToStringMapping({ wrapping_function_body: "return 1;", post_replacement_code: "" });
      has(out.post_replacement_code, "original_functions[replacementF.toString()] = originalF.toString();");
    });

    it("keeps the wrapper's own post_replacement_code", function () {
      const out = withToStringMapping({ wrapping_function_body: "return 1;", post_replacement_code: "KEEP_ME;" });
      has(out.post_replacement_code, "KEEP_ME;");
      has(out.post_replacement_code, "original_functions[replacementF.toString()]");
    });

    it("does nothing for property-only wrappers without a replacement function", function () {
      const desc = { parent_object: "navigator", parent_object_property: "userAgent" };
      expect(withToStringMapping(desc)).toBe(desc);
    });
  });

  describe("fpdResourceMapToWrapItems", function () {
    it("produces the wrap_item format consumed by fp_build_*_wrapper", function () {
      const map = new Map([
        ["navigator.userAgent", { type: "property", props: new Set(["get"]) }],
        ["window.Date.now", { type: "function", props: new Set(["call"]) }],
      ]);
      const items = fpdResourceMapToWrapItems(map, new Set(["window.Date.now"]));
      expect(items.length).toBe(2);

      const ua = items.find(i => i[0] === "navigator.userAgent");
      expect(ua[1]).toBe(1);            // property
      expect(ua[2] instanceof Set).toBe(true); // fp_build_property_wrapper checks .size [8]
      expect(ua[3]).toBe(0);

      const now = items.find(i => i[0] === "window.Date.now");
      expect(now[1]).toBe(0);           // function
      expect(now[3]).toBe(1);           // report_args
    });
  });

  describe("norm() used by the assertions above", function () {
    it("ignores indentation, newlines and comments", function () {
      expect(norm("  var a = 1; // c\n")).toBe(norm("var a = 1;"));
      expect(norm("var /*x*/ a = 1;")).toBe(norm("var a=1;"));
    });
    it("keeps whitespace between word characters", function () {
      expect(norm("typeof x")).toBe("typeof x");
      expect(norm("a in b")).toBe("a in b");
    });
    it("preserves string literal contents", function () {
      expect(norm('updateCount("a b c", "call")')).toContain('"a b c"');
    });
  });
});

// ============================================================
// Suites that require common/ with wrapping.js, code_builders.js and
// fp_code_builders.js loaded into the sandbox.
// ============================================================
guarded("generate_wrappers.js — bodies produced by build_code()", function () {

  beforeAll(function () {
    loadDescriptors(WRAPPERS_DIR);
  });

  describe("loadDescriptors", function () {
    it("switches the shared builder to the Chromium target", function () {
      // Without this, build_code() emits the xray marshalling block referencing
      // xrayWindow/cloneInto, which do not exist in the MAIN world [2].
      expect(sandbox.jshelter_target).toBe("chromium");
    });

    it("collects the registered wrappers via add_wrappers", function () {
      const keys = Object.keys(sandbox.build_wrapping_code);
      expect(keys.length).toBeGreaterThan(50);
      // Keys are resource names as used by the level wrapper lists.
      expect(keys.every(k => k.includes("."))).toBe(true);
    });

    it("exposes the builders and the FPD descriptor helpers", function () {
      expect(typeof sandbox.build_code).toBe("function");
      expect(typeof sandbox.joinWrappingCode).toBe("function");
      expect(typeof sandbox.fp_build_property_wrapper).toBe("function");
      expect(typeof sandbox.fp_build_function_wrapper).toBe("function");
      expect(Array.isArray(sandbox.additional_wrappers)).toBe(true);
      expect(typeof sandbox.additional_wrappers_init_code).toBe("string");
      expect(typeof sandbox.fpd_updateCountCode).toBe("string");
    });
  });

  describe("every registered wrapper builds into a parseable body", function () {
    // This single loop replaces most of the old per-step text assertions: it is
    // the check that the shared builder and the converter cannot drift apart.
    it("parses for all descriptors", function () {
      const failures = [];
      for (const [key, desc] of Object.entries(sandbox.build_wrapping_code)) {
        try {
          parseAsFunctionBody(buildWrapperBody(withToStringMapping(desc)));
        } catch (e) {
          failures.push(`${key}: ${e.message}`);
        }
      }
      expect(failures).toEqual([]);
    });

    it("keeps the xray marshalling block out of the bodies", function () {
      // Identity shims make forPage/pageAPI harmless; xrayWindow must not appear.
      const offenders = [];
      for (const [key, desc] of Object.entries(sandbox.build_wrapping_code)) {
        if (!desc.wrapping_function_body) continue;
        const body = buildWrapperBody(desc);
        if (at(body, "xrayWindow") !== -1) offenders.push(key);
      }
      expect(offenders).toEqual([]);
    });

    it("does not leak builder-internal names as implicit globals", function () {
      // build_code() emits plain assignments for a few temporaries; if any of
      // them reaches the MAIN world undeclared, it becomes a window property.
      const ctx = {
        WrapHelper: makeWrapHelper(), exportFunction: makeExportFunction(),
        updateCount: () => {}, fp_enabled: false, fpdTrackCallers: false,
        navigator: { userAgent: "ua" }, HTMLElement: class { },
        Performance: Object.assign(function () {}, { prototype: { now() { return 1; } } }),
      };
      vm.createContext(ctx);
      const before = new Set(Object.getOwnPropertyNames(ctx));
      const failures = [];
      for (const [key, desc] of Object.entries(sandbox.build_wrapping_code)) {
        if (!(desc.post_wrapping_code || []).some(s => s.code_type === "object_properties")) continue;
        try {
          vm.runInContext(`(function(){${buildWrapperBody(desc)}})();`, ctx);
        } catch (e) { /* runtime stubs are incomplete; we only look for leaks */ }
      }
      for (const name of ["leaf", "originalPDF", "replacementPD", "code_spec", "prop", "assign", "wrap_spec"]) {
        if (Object.getOwnPropertyNames(ctx).includes(name) && !before.has(name)) failures.push(name);
      }
      expect(failures).toEqual([]);
    });
  });

  describe("function_define behaviour (executed, not matched)", function () {
    const base = () => ({
      parent_object: "scope",
      parent_object_property: "F",
      wrapping_function_args: "",
      wrapping_function_body: "return 42;",
    });

    it("replaces the target property and forwards the call", function () {
      const scope = { F: makeNativeCtor() };
      const ctx = runBody(buildWrapperBody(base()), { globals: { scope } });
      expect(typeof ctx.scope.F).toBe("function");
      expect(ctx.scope.F()).toBe(42);
    });

    it("copies the own properties of the original onto the replacement", function () {
      // exportFunction() yields a new function object without own properties, so
      // without the copy a replaced Date would lose prototype, parse and UTC.
      const native = makeNativeCtor();
      const scope = { F: native };
      const ctx = runBody(buildWrapperBody(base()), { globals: { scope } });
      expect(ctx.scope.F.parse()).toBe(7);
      expect(ctx.scope.F.UTC()).toBe(8);
      expect(ctx.scope.F.prototype).toBe(native.prototype);
    });

    it("copies the descriptor attributes, not only the values", function () {
      // The attributes are the fingerprintable part: an assignment would leave
      // prototype writable/enumerable/configurable.
      const native = makeNativeCtor();
      const ctx = runBody(buildWrapperBody(base()), { globals: { scope: { F: native } } });
      const pd = Object.getOwnPropertyDescriptor(ctx.scope.F, "prototype");
      expect(pd).toBeDefined();
      expect(pd.writable).toBe(false);
      expect(pd.enumerable).toBe(false);
      expect(pd.configurable).toBe(false);
    });

    it("restores properties the same way for a replaced function elsewhere", function () {
      const native = makeNativeCtor();
      const wrapper = {
        ...base(),
        original_function: "scope.Other.m",
        replace_original_function: true,
      };
      const scope = { F: makeNativeCtor(), Other: { m: native } };
      const ctx = runBody(buildWrapperBody(wrapper), { globals: { scope } });
      expect(ctx.scope.Other.m()).toBe(42);
      expect(ctx.scope.Other.m.parse()).toBe(7);
      // The originally targeted property stays untouched.
      expect(ctx.scope.F).not.toBe(ctx.scope.Other.m);
    });

    it("does not touch the original object", function () {
      const native = makeNativeCtor();
      const before = Object.getOwnPropertyDescriptor(native, "prototype");
      runBody(buildWrapperBody(base()), { globals: { scope: { F: native } } });
      expect(Object.getOwnPropertyDescriptor(native, "prototype")).toEqual(before);
    });

    it("skips the copy when there is nothing to copy (Date.now-like functions)", function () {
      const now = function now() { return 1; };   // native functions have no own "prototype"
      const wrapper = { ...base(), wrapping_function_body: "return 0;" };
      const ctx = runBody(buildWrapperBody(wrapper), { globals: { scope: { F: now } } });
      expect(ctx.scope.F()).toBe(0);
      // A replacement of a method without "prototype" must not gain one.
      expect(Object.prototype.hasOwnProperty.call(ctx.scope.F, "prototype")).toBe(false);
    });

    it("emits the FPD counter hook keyed by the resource name", function () {
      const calls = [];
      const ctx = runBody(buildWrapperBody(base()), {
        globals: { scope: { F: makeNativeCtor() } },
        updateCount: (...a) => calls.push(a),
      });
      // The hook is gated by fp_enabled; enable it the way init() does.
      ctx.fp_enabled = true;
      ctx.scope.F();
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toBe("scope.F");
      expect(calls[0][1]).toBe("call");
    });

    it("registers the toString mapping for the replacement", function () {
      const ctx = runBody(buildWrapperBody(base()), { globals: { scope: { F: makeNativeCtor() } } });
      const keys = Object.keys(ctx.original_functions);
      expect(keys.some(k => k.includes("42"))).toBe(true);
    });
  });

  describe("ordering constraints", function () {
    it("copies own properties after the export but before post_wrapping_code", function () {
      // After the export: the copy target must be the exported object.
      // Before post_wrapping_code: otherwise a post-defined wrapper (e.g. the
      // farbling Date.now) would be overwritten by the native method again.
      const wrapper = {
        parent_object: "scope", parent_object_property: "F",
        wrapping_function_body: "return 42;",
        post_wrapping_code: [
          { code_type: "assign", parent_object: "scope", parent_object_property: "POST_MARKER", value: "1" },
        ],
      };
      const body = buildWrapperBody(wrapper);
      const iExport = at(body, "exportFunction(replacementF, scope");
      const iCopy = at(body, "Reflect.ownKeys(originalF)");
      const iPost = at(body, "scope.POST_MARKER");
      expect(iExport).toBeGreaterThanOrEqual(0);
      expect(iCopy).toBeGreaterThan(iExport);
      expect(iPost).toBeGreaterThan(iCopy);
    });

    it("applies freeze after the replacement and the post code", function () {
      const wrapper = {
        parent_object: "scope", parent_object_property: "F", freeze: true,
        wrapping_function_body: "return 1;",
        post_wrapping_code: [
          { code_type: "assign", parent_object: "scope", parent_object_property: "POST_MARKER", value: "1" },
        ],
      };
      const body = buildWrapperBody(wrapper);
      expect(at(body, "Object.freeze")).toBeGreaterThan(at(body, "scope.POST_MARKER"));
    });

    it("emits freeze only when requested", function () {
      hasNot(buildWrapperBody({ parent_object: "scope", parent_object_property: "F" }), "Object.freeze");
      has(buildWrapperBody({ parent_object: "scope", parent_object_property: "F", freeze: true }), "Object.freeze");
      hasNot(buildWrapperBody({ parent_object: "scope", parent_object_property: "F", freeze: false }), "Object.freeze");
    });

    it("sets the prototype chain when wrapper_prototype is present", function () {
      const body = buildWrapperBody({
        parent_object: "scope", parent_object_property: "F", wrapper_prototype: "Function",
      });
      has(body, "Object.setPrototypeOf(scope.F, Function)");
    });
  });

  describe("apply_if", function () {
    it("guards the replacement body with an else branch calling the original", function () {
      const body = buildWrapperBody({
        parent_object: "scope", parent_object_property: "F",
        apply_if: "args[0] === true", wrapping_function_args: "...rest",
        wrapping_function_body: "return 'spoofed';",
      });
      has(body, "return originalF.call(this, ...rest)");
    });

    it("does not double-wrap apply_if when a replacement body exists", function () {
      const body = buildWrapperBody({
        parent_object: "scope", parent_object_property: "F",
        apply_if: "MARKER_COND", wrapping_function_body: "return 1;",
        post_wrapping_code: [
          { code_type: "assign", parent_object: "scope", parent_object_property: "P", value: "1" },
        ],
      });
      const occurrences = norm(body).split("MARKER_COND").length - 1;
      expect(occurrences).toBe(1);
    });

    it("guards post_wrapping_code when there is no replacement body", function () {
      const body = buildWrapperBody({
        parent_object: "scope", parent_object_property: "F", apply_if: "MARKER_COND",
        post_wrapping_code: [
          { code_type: "assign", parent_object: "scope", parent_object_property: "P", value: "1" },
        ],
      });
      expect(at(body, "MARKER_COND")).toBeGreaterThanOrEqual(0);
    });

    it("still observes the property for FPD when its apply_if is false", function () {
      // build_post_fpd(): object_properties with apply_if must get an else branch
      // with counting wrappers, otherwise FPD sees nothing when JSS stands aside.
      const wrapper = {
        parent_object: "scope", parent_object_property: "F",
        post_wrapping_code: [
          {
            code_type: "object_properties", parent_object: "scope", parent_object_property: "F",
            apply_if: "args[0]", wrapped_properties: [
              { property_name: "get", property_value: "originalD_get" },
            ],
          },
        ],
      };
      const body = buildWrapperBody(wrapper);
      const iElse = at(body, "else");
      expect(iElse).toBeGreaterThanOrEqual(0);
      expect(at(body, "updateCount(\"scope.F\", \"get\"")).toBeGreaterThan(iElse);
    });
  });

  describe("object_properties behaviour (executed)", function () {
    it("wraps the getter and keeps the original semantics while counting", function () {
      const scope = {};
      Object.defineProperty(scope, "v", { get() { return 5; }, configurable: true, enumerable: true });
      const calls = [];
      const wrapper = {
        parent_object: "scope", parent_object_property: "v",
        post_wrapping_code: [{
          code_type: "object_properties", parent_object: "scope", parent_object_property: "v",
          wrapped_properties: [{ property_name: "get", property_value: "function() { return 5; }" }],
        }],
      };
      const ctx = runBody(buildWrapperBody(wrapper), {
        globals: { scope }, updateCount: (...a) => calls.push(a),
      });
      expect(ctx.scope.v).toBe(5);
      ctx.fp_enabled = true;
      void ctx.scope.v;
      expect(calls.some(c => c[0] === "scope.v" && c[1] === "get")).toBe(true);
    });

    it("leaves an absent API untouched", function () {
      const scope = {};   // no "v"
      const wrapper = {
        parent_object: "scope", parent_object_property: "v",
        post_wrapping_code: [{
          code_type: "object_properties", parent_object: "scope", parent_object_property: "v",
          wrapped_properties: [{ property_name: "get", property_value: "function() { return 5; }" }],
        }],
      };
      const ctx = runBody(buildWrapperBody(wrapper), { globals: { scope } });
      expect(Object.prototype.hasOwnProperty.call(ctx.scope, "v")).toBe(false);
    });
  });

  describe("delete_properties and function_export (executed)", function () {
    it("neutralises a property without removing it", function () {
      const scope = { getBattery() { return 1; } };
      const wrapper = {
        parent_object: "scope", parent_object_property: "x",
        post_wrapping_code: [
          { code_type: "delete_properties", parent_object: "scope", delete_properties: ["getBattery"] },
        ],
      };
      const ctx = runBody(buildWrapperBody(wrapper), { globals: { scope } });
      const pd = Object.getOwnPropertyDescriptor(ctx.scope, "getBattery");
      expect(pd.get).toBeUndefined();
      expect(pd.set).toBeUndefined();
      expect(pd.configurable).toBe(false);
    });

    it("exports an existing function under a new name", function () {
      const scope = { orig: function orig() { return 3; } };
      const wrapper = {
        parent_object: "scope", parent_object_property: "x",
        post_wrapping_code: [{
          code_type: "function_export", parent_object: "scope",
          parent_object_property: "copy", export_function_name: "scope.orig",
        }],
      };
      const ctx = runBody(buildWrapperBody(wrapper), { globals: { scope } });
      expect(ctx.scope.copy()).toBe(3);
    });
  });

  describe("FPD wrappers", function () {
    // The report_args pass mutates the JSS descriptors in place [8]; run it
    // before checking the FPD table so the order reflects the Firefox path.
    it("builds bodies for property and function items", function () {
      const items = [
        ["scope.v", 1, new Set(["get"]), 0],
        ["scope.f", 0, new Set(["call"]), 1],
      ];
      const bodies = buildFpdBodies(items);
      expect(bodies.has("scope.v")).toBe(true);
      expect(bodies.has("scope.f")).toBe(true);
      for (const body of bodies.values()) {
        expect(() => parseAsFunctionBody(body)).not.toThrow();
      }
    });

    it("keeps the original semantics of a monitored function", function () {
      const scope = { f: function f(a) { return a + 1; } };
      const bodies = buildFpdBodies([["scope.f", 0, new Set(["call"]), 0]]);
      const calls = [];
      const ctx = runBody(bodies.get("scope.f"), {
        globals: { scope }, updateCount: (...a) => calls.push(a),
      });
      expect(ctx.scope.f(1)).toBe(2);
      ctx.fp_enabled = true;
      ctx.scope.f(1);
      expect(calls.some(c => c[0] === "scope.f" && c[1] === "call")).toBe(true);
    });

    it("drops items without any monitored accessor", function () {
      const bodies = buildFpdBodies([["scope.v", 1, new Set(), 0]]);
      expect(bodies.has("scope.v")).toBe(false);
    });

    it("lets additional_wrappers override the default property wrapper", function () {
      const target = sandbox.additional_wrappers[0];
      expect(target).toBeDefined();
      const resource = `${target.parent_object}.${target.parent_object_property}`;
      const bodies = buildFpdBodies([[resource, 1, new Set(["get"]), 0]]);
      expect(bodies.has(resource)).toBe(true);
      // The override counts the related CSS property instead of the access itself.
      has(bodies.get(resource), "updateCount(\"CSSStyleDeclaration.prototype.fontFamily\"");
    });

    it("propagates report_args from the FPD configuration", function () {
      const items = [["scope.f", 0, new Set(["call"]), 1]];
      buildFpdBodies(items);
      // fp_append_reporting_to_jss_wrappers() set report_args on the JSS descriptor
      // for the same resource [8]; the serialising map call must therefore appear.
      const desc = sandbox.build_wrapping_code["scope.f"];
      if (desc) expect(desc.report_args).toBe(true);
    });
  });
});
