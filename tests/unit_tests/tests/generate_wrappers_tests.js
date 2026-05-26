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
//  but WITHOUT ANY WARRANTY; without ev1267027en the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

//  Unit tests for generate_wrappers.js
//  Tests the pure code-generator functions that convert string-based
//  wrapper definitions into real JavaScript function bodies.

const path = require("path");
const {
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
} = require(path.resolve(__dirname, "../../../generate_wrappers.js"));

// ============================================================
describe("generate_wrappers.js — code generator functions", function () {

  // ----------------------------------------------------------
  describe("genExistenceCheck", function () {
    it("should return a string", function () {
      expect(typeof genExistenceCheck({ parent_object: "navigator" })).toBe("string");
    });

    it("should contain a try/catch block", function () {
      const code = genExistenceCheck({ parent_object: "navigator" });
      expect(code).toContain("try {");
      expect(code).toContain("} catch(e) { return; }");
    });

    it("should check that the parent object is not undefined", function () {
      const code = genExistenceCheck({ parent_object: "navigator" });
      expect(code).toContain("navigator === undefined");
      expect(code).toContain("return;");
    });

    it("should use the correct parent_object name", function () {
      const code = genExistenceCheck({ parent_object: "Performance.prototype" });
      expect(code).toContain("Performance.prototype === undefined");
    });
  });

  // ----------------------------------------------------------
  describe("genWrappedObjects", function () {
    it("should return empty string when wrapped_objects is missing", function () {
      expect(genWrappedObjects({})).toBe("");
    });

    it("should return empty string when wrapped_objects is empty array", function () {
      expect(genWrappedObjects({ wrapped_objects: [] })).toBe("");
    });

    it("should generate var declaration using wrapped_name", function () {
      const wrapper = {
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" }
        ]
      };
      const code = genWrappedObjects(wrapper);
      expect(code).toContain("var origNow = Performance.prototype.now;");
    });

    it("should generate undefined guard for each wrapped object", function () {
      const wrapper = {
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" }
        ]
      };
      const code = genWrappedObjects(wrapper);
      expect(code).toContain("if (origNow === undefined) return;");
    });

    it("should use callable_name when wrapped_name is missing", function () {
      const wrapper = {
        wrapped_objects: [
          { callable_name: "callableNow", original_name: "Performance.prototype.now" }
        ]
      };
      const code = genWrappedObjects(wrapper);
      expect(code).toContain("var callableNow = Performance.prototype.now;");
    });

    it("should skip objects with neither wrapped_name nor callable_name", function () {
      const wrapper = {
        wrapped_objects: [
          { original_name: "Performance.prototype.now" }
        ]
      };
      expect(genWrappedObjects(wrapper)).toBe("");
    });

    it("should handle multiple wrapped objects", function () {
      const wrapper = {
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" },
          { wrapped_name: "origGetEntries", original_name: "Performance.prototype.getEntries" }
        ]
      };
      const code = genWrappedObjects(wrapper);
      expect(code).toContain("var origNow");
      expect(code).toContain("var origGetEntries");
    });
  });

  // ----------------------------------------------------------
  describe("genHelpingCode", function () {
    it("should return empty string when helping_code is missing", function () {
      expect(genHelpingCode({})).toBe("");
    });

    it("should return empty string when helping_code is empty string", function () {
      expect(genHelpingCode({ helping_code: "" })).toBe("");
    });

    it("should return empty string when helping_code is null", function () {
      expect(genHelpingCode({ helping_code: null })).toBe("");
    });

    it("should include the helping_code content in output", function () {
      const wrapper = { helping_code: "var precision = args[0];" };
      const code = genHelpingCode(wrapper);
      expect(code).toContain("var precision = args[0];");
    });

    it("should add indentation to helping_code", function () {
      const wrapper = { helping_code: "var x = 1;" };
      const code = genHelpingCode(wrapper);
      expect(code).toMatch(/^\s+var x = 1;/);
    });
  });

  // ----------------------------------------------------------
  describe("genFreeze (opt-in via freeze: true)", function () {
    it("should return empty string when freeze flag is absent", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      expect(genFreeze(wrapper)).toBe("");
    });

    it("should return empty string when freeze is explicitly false", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: false
      };
      expect(genFreeze(wrapper)).toBe("");
    });

    it("should generate freeze code when freeze: true", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: true
      };
      const code = genFreeze(wrapper);
      expect(code).toContain("Object.freeze");
    });

    it("should reference the correct property path", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: true
      };
      const code = genFreeze(wrapper);
      expect(code).toContain("navigator.userAgent");
    });

    it("should wrap freeze in try/catch to handle illegal-invocation getters", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        freeze: true
      };
      const code = genFreeze(wrapper);
      expect(code).toContain("try {");
      expect(code).toContain("} catch(_fe) {}");
    });

    it("should guard against falsy target before freezing", function () {
      // Target may resolve to undefined/null at runtime (e.g. removed APIs);
      // emitted code should null-check before calling Object.freeze.
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: true
      };
      const code = genFreeze(wrapper);
      expect(code).toMatch(/if\s*\(\s*_fp\s*\)/);
    });
  });

  // ----------------------------------------------------------
  describe("genPrototype", function () {
    it("should return empty string when wrapper_prototype is not set", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      expect(genPrototype(wrapper)).toBe("");
    });

    it("should generate setPrototypeOf call when wrapper_prototype is set", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapper_prototype: "Navigator"
      };
      const code = genPrototype(wrapper);
      expect(code).toContain("Object.setPrototypeOf");
      expect(code).toContain("Navigator");
    });

    it("should check prototype before setting it", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapper_prototype: "Navigator"
      };
      const code = genPrototype(wrapper);
      expect(code).toContain("if (");
      expect(code).toContain(".prototype !==");
    });
  });

  // ----------------------------------------------------------
  describe("genAssignment", function () {
    it("should generate a simple assignment statement", function () {
      const spec = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        value: '"spoofed-agent"'
      };
      const code = genAssignment(spec);
      expect(code).toContain('navigator.userAgent = "spoofed-agent"');
    });

    it("should return a string ending with semicolon", function () {
      const spec = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        value: "42"
      };
      expect(genAssignment(spec).trim()).toMatch(/;$/);
    });
  });

  // ----------------------------------------------------------
  describe("genFunctionExport", function () {
    it("should call exportFunction with correct arguments", function () {
      const spec = {
        export_function_name: "myReplacementFn",
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const code = genFunctionExport(spec);
      expect(code).toContain("exportFunction(myReplacementFn");
      expect(code).toContain("navigator");
      expect(code).toContain("userAgent");
    });

    it("should use defineAs option", function () {
      const spec = {
        export_function_name: "myFn",
        parent_object: "navigator",
        parent_object_property: "platform"
      };
      const code = genFunctionExport(spec);
      expect(code).toContain("defineAs");
      expect(code).toContain("platform");
    });
  });

  // ----------------------------------------------------------
  describe("genDeleteProperties", function () {
    it("should return empty string when delete_properties is missing", function () {
      expect(genDeleteProperties({})).toBe("");
    });

    it("should return empty string when delete_properties is empty", function () {
      expect(genDeleteProperties({ delete_properties: [] })).toBe("");
    });

    it("should generate Object.defineProperty for each property to delete", function () {
      const spec = {
        parent_object: "navigator",
        delete_properties: ["getBattery"]
      };
      const code = genDeleteProperties(spec);
      expect(code).toContain("Object.defineProperty");
      expect(code).toContain('"getBattery"');
      expect(code).toContain("navigator");
    });

    it("should set get and set to undefined", function () {
      const spec = {
        parent_object: "navigator",
        delete_properties: ["getBattery"]
      };
      const code = genDeleteProperties(spec);
      expect(code).toContain("get: undefined");
      expect(code).toContain("set: undefined");
    });

    it("should guard with 'in' check before deleting", function () {
      const spec = {
        parent_object: "navigator",
        delete_properties: ["getBattery"]
      };
      const code = genDeleteProperties(spec);
      expect(code).toContain('"getBattery" in navigator');
    });

    it("should handle multiple properties", function () {
      const spec = {
        parent_object: "navigator",
        delete_properties: ["getBattery", "getGamepads"]
      };
      const code = genDeleteProperties(spec);
      expect(code).toContain('"getBattery"');
      expect(code).toContain('"getGamepads"');
    });
  });

  // ----------------------------------------------------------
  describe("genFunctionReplacement", function () {
    it("should return empty string when wrapping_function_body is missing", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      expect(genFunctionReplacement(wrapper)).toBe("");
    });

    it("should fall back to parent_object.parent_object_property for originalF", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapping_function_body: "return 0;"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("var originalF = Performance.prototype.now;");
    });

    it("should use original_function when provided", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        original_function: "Performance.prototype.originalNow",
        wrapping_function_body: "return 0;"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("var originalF = Performance.prototype.originalNow;");
    });

    it("should declare replacementF as a function", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return 'spoofed';"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("var replacementF = function(");
    });

    it("should pass wrapping_function_args to replacementF signature", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapping_function_args: "...args",
        wrapping_function_body: "return 0;"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("var replacementF = function(...args)");
    });

    it("should inline the wrapping_function_body", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return 'CUSTOM_BODY_MARKER';"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("return 'CUSTOM_BODY_MARKER';");
    });

    it("should call exportFunction with defineAs targeting parent_object_property", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return '';"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("exportFunction(replacementF, navigator, {defineAs: 'userAgent'})");
    });

    it("should emit FPD counter-call hook gated by fp_enabled", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return '';"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("fp_enabled");
      expect(code).toContain("updateCount");
      // resource string for the counter must be the full property path
      expect(code).toContain('"navigator.userAgent"');
    });

    it("should record originalF in original_functions for toString protection", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return '';"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("original_functions[replacementF.toString()]");
    });

    describe("apply_if branch", function () {
      it("should emit if/else around wrapping_function_body when apply_if is set", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          apply_if: "args[0] === true",
          wrapping_function_body: "return 'spoofed';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("if (args[0] === true)");
        expect(code).toContain("} else {");
      });

      it("should fall through to originalF.call in the else branch", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          apply_if: "false",
          wrapping_function_body: "return 'spoofed';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("return originalF.call(this");
      });

      it("should forward wrapping_function_args in the else branch", function () {
        const wrapper = {
          parent_object: "Performance.prototype",
          parent_object_property: "now",
          apply_if: "false",
          wrapping_function_args: "...args",
          wrapping_function_body: "return 0;"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("return originalF.call(this, ...args)");
      });

      it("should NOT emit if/else when apply_if is absent", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          wrapping_function_body: "return 'spoofed';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).not.toContain("} else {");
      });
    });

    describe("replace_original_function", function () {
      it("should redirect exportFunction target when replace_original_function + original_function are set", function () {
        const wrapper = {
          parent_object: "Performance.prototype",
          parent_object_property: "now",
          original_function: "window.OtherTarget.method",
          replace_original_function: true,
          wrapping_function_body: "return 0;"
        };
        const code = genFunctionReplacement(wrapper);
        // Target object becomes the path-prefix of original_function,
        // defineAs becomes the last segment.
        expect(code).toContain("exportFunction(replacementF, window.OtherTarget, {defineAs: 'method'})");
      });

      it("should not redirect when replace_original_function is set without original_function", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          replace_original_function: true,
          wrapping_function_body: "return '';"
        };
        const code = genFunctionReplacement(wrapper);
        // Falls back to parent_object / parent_object_property
        expect(code).toContain("exportFunction(replacementF, navigator, {defineAs: 'userAgent'})");
      });
    });

    describe("named function wrapper (wrapping_code_function_name)", function () {
      it("should wrap output in a named function declaration", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          wrapping_code_function_name: "patchUA",
          wrapping_function_body: "return '';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("function patchUA(");
      });

      it("should invoke the named function at the end", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          wrapping_code_function_name: "patchUA",
          wrapping_function_body: "return '';"
        };
        const code = genFunctionReplacement(wrapper);
        // Trailing "patchUA();" call after the function body
        expect(code).toMatch(/patchUA\(\s*\)\s*;/);
      });

      it("should pass 'window' to the named function when wrapping_code_function_call_window is set", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          wrapping_code_function_name: "patchUA",
          wrapping_code_function_call_window: true,
          wrapping_function_body: "return '';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("patchUA(window)");
      });

      it("should include declared params in the function signature", function () {
        const wrapper = {
          parent_object: "navigator",
          parent_object_property: "userAgent",
          wrapping_code_function_name: "patchUA",
          wrapping_code_function_params: "scope",
          wrapping_function_body: "return '';"
        };
        const code = genFunctionReplacement(wrapper);
        expect(code).toContain("function patchUA(scope)");
      });
    });

    it("should include post_replacement_code after exportFunction", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        wrapping_function_body: "return '';",
        post_replacement_code: "console.log('POST_HOOK_MARKER');"
      };
      const code = genFunctionReplacement(wrapper);
      expect(code).toContain("POST_HOOK_MARKER");
      // post code must come AFTER exportFunction call
      const exportIdx = code.indexOf("exportFunction(replacementF");
      const postIdx = code.indexOf("POST_HOOK_MARKER");
      expect(postIdx).toBeGreaterThan(exportIdx);
    });
  });

  // ----------------------------------------------------------
  describe("genObjectProperties", function () {
    it("should guard with 'in' check on parent object", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now"
      };
      const code = genObjectProperties(spec);
      expect(code).toContain('if (!("now" in Performance.prototype)) return;');
    });

    it("should fetch the existing descriptor with getOwnPropertyDescriptor", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now"
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("Object.getOwnPropertyDescriptor");
      expect(code).toContain('Performance.prototype, "now"');
    });

    it("should provide a fallback descriptor when getOwnPropertyDescriptor returns undefined", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now"
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("if (descriptor === undefined)");
    });

    it("should emit var declarations for wrapped_objects", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_objects: [
          { wrapped_name: "originalD_get", original_name: "descriptor.get" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("var originalD_get = descriptor.get;");
    });

    it("should emit replacementPD for each wrapped_property", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_objects: [],
        wrapped_properties: [
          { property_name: "get", property_value: "function() { return 0; }" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("var replacementPD = function(...args)");
      expect(code).toContain('descriptor["get"] = replacementPD;');
    });

    it("should inline the property_value into replacementPD", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_properties: [
          { property_name: "get", property_value: "'INLINE_PV_MARKER'" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("var pv = 'INLINE_PV_MARKER';");
    });

    it("should bind pv to this when it's a function", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_properties: [
          { property_name: "get", property_value: "originalD_get" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("if (typeof pv === 'function')");
      expect(code).toContain("pv.bind(this)(...args)");
    });

    it("should emit FPD counter-call hook inside replacementPD", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_properties: [
          { property_name: "get", property_value: "originalD_get" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("fp_enabled");
      expect(code).toContain('"Performance.prototype.now"');
      expect(code).toContain('"get"');
    });

    it("should record replacementPD in original_functions table", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_properties: [
          { property_name: "get", property_value: "originalD_get" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain("original_functions[replacementPD.toString()]");
    });

    it("should call Object.defineProperty with the modified descriptor", function () {
      const spec = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_properties: [
          { property_name: "get", property_value: "originalD_get" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain('Object.defineProperty(Performance.prototype,\n      "now", descriptor)');
    });

    it("should handle both get and set in one spec", function () {
      const spec = {
        parent_object: "HTMLElement.prototype",
        parent_object_property: "offsetWidth",
        wrapped_properties: [
          { property_name: "get", property_value: "originalD_get" },
          { property_name: "set", property_value: "originalD_set" }
        ]
      };
      const code = genObjectProperties(spec);
      expect(code).toContain('descriptor["get"] = replacementPD;');
      expect(code).toContain('descriptor["set"] = replacementPD;');
    });

    it("should work with empty wrapped_objects and wrapped_properties", function () {
      const spec = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const code = genObjectProperties(spec);
      // Still emits the guard, descriptor fetch, and defineProperty
      expect(code).toContain('"userAgent" in navigator');
      expect(code).toContain("Object.defineProperty(navigator");
    });
  });

  // ----------------------------------------------------------
  describe("genPostWrappingCode", function () {
    it("should return empty string when post_wrapping_code is missing", function () {
      expect(genPostWrappingCode({})).toBe("");
    });

    it("should handle assign code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "assign",
            parent_object: "navigator",
            parent_object_property: "userAgent",
            value: '"test"'
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("navigator.userAgent");
    });

    it("should handle function_export code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "function_export",
            export_function_name: "myFn",
            parent_object: "navigator",
            parent_object_property: "userAgent"
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("exportFunction");
    });

    it("should handle delete_properties code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "delete_properties",
            parent_object: "navigator",
            delete_properties: ["getBattery"]
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("getBattery");
    });

    it("should handle object_properties code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "object_properties",
            parent_object: "Performance.prototype",
            parent_object_property: "now",
            wrapped_properties: [
              { property_name: "get", property_value: "originalD_get" }
            ]
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("Object.defineProperty(Performance.prototype");
    });

    it("should handle function_define code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "function_define",
            parent_object: "navigator",
            parent_object_property: "userAgent",
            wrapping_function_body: "return 'defined';"
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("var replacementF");
    });

    it("should wrap entry in if-block when apply_if is present", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "assign",
            apply_if: "args[0] > 0",
            parent_object: "navigator",
            parent_object_property: "userAgent",
            value: '"spoofed"'
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("if (args[0] > 0)");
    });

    it("should emit comment for unknown code_type", function () {
      const wrapper = {
        post_wrapping_code: [
          {
            code_type: "unknown_type",
            parent_object: "navigator",
            parent_object_property: "userAgent"
          }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      expect(code).toContain("UNSUPPORTED code_type");
    });

    it("should process multiple entries in order", function () {
      const wrapper = {
        post_wrapping_code: [
          { code_type: "assign", parent_object: "a", parent_object_property: "x", value: "1" },
          { code_type: "assign", parent_object: "b", parent_object_property: "y", value: "2" }
        ]
      };
      const code = genPostWrappingCode(wrapper);
      const aIdx = code.indexOf("a.x");
      const bIdx = code.indexOf("b.y");
      expect(aIdx).toBeGreaterThan(-1);
      expect(bIdx).toBeGreaterThan(aIdx);
    });
  });

  // ----------------------------------------------------------
  describe("generateWrapperFunction (integration)", function () {
    it("should return a non-empty string for a minimal wrapper", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    });

    it("should include existence check", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(code).toContain("navigator === undefined");
    });

    it("should NOT include freeze step by default (opt-in)", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(code).not.toContain("Object.freeze");
    });

    it("should include freeze step when freeze: true", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: true
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(code).toContain("Object.freeze");
    });

    it("should include wrapped objects when present", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" }
        ]
      };
      const code = generateWrapperFunction("Performance.prototype.now", wrapper);
      expect(code).toContain("var origNow");
    });

    it("should include helping code when present", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        helping_code: "var precision = args[0];"
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(code).toContain("var precision = args[0];");
    });

    it("should wrap post_wrapping_code in apply_if condition", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        apply_if: "args[0] !== undefined",
        post_wrapping_code: [
          {
            code_type: "assign",
            parent_object: "navigator",
            parent_object_property: "userAgent",
            value: '"spoofed"'
          }
        ]
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(code).toContain("if (args[0] !== undefined)");
    });

    it("should NOT double-wrap apply_if when wrapping_function_body is present", function () {
      // When wrapping_function_body exists, apply_if is handled inside
      // genFunctionReplacement (if/else around the body); post_wrapping_code
      // should NOT be wrapped again at the top level.
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        apply_if: "MARKER_COND",
        wrapping_function_body: "return 'spoofed';"
      };
      const code = generateWrapperFunction("navigator.userAgent", wrapper);
      // exactly one occurrence of the apply_if expression
      const occurrences = code.split("MARKER_COND").length - 1;
      expect(occurrences).toBe(1);
    });

    it("should produce steps in documented order: existence → wrapped → helping → replacement → post → prototype → freeze", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        freeze: true,
        wrapper_prototype: "Function",
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" }
        ],
        helping_code: "var HELPING_MARKER = 1;",
        wrapping_function_body: "return 0;",
        post_wrapping_code: [
          { code_type: "assign", parent_object: "x", parent_object_property: "POST_MARKER", value: "1" }
        ]
      };
      const code = generateWrapperFunction("Performance.prototype.now", wrapper);

      const idxExistence  = code.indexOf("Performance.prototype === undefined");
      const idxWrapped    = code.indexOf("var origNow");
      const idxHelping    = code.indexOf("HELPING_MARKER");
      const idxReplaceF   = code.indexOf("var replacementF");
      const idxPost       = code.indexOf("POST_MARKER");
      const idxPrototype  = code.indexOf("Object.setPrototypeOf");
      const idxFreeze     = code.indexOf("Object.freeze");

      expect(idxExistence).toBeGreaterThanOrEqual(0);
      expect(idxWrapped).toBeGreaterThan(idxExistence);
      expect(idxHelping).toBeGreaterThan(idxWrapped);
      expect(idxReplaceF).toBeGreaterThan(idxHelping);
      expect(idxPost).toBeGreaterThan(idxReplaceF);
      expect(idxPrototype).toBeGreaterThan(idxPost);
      expect(idxFreeze).toBeGreaterThan(idxPrototype);
    });
  });

  // ----------------------------------------------------------
  // Syntactic sanity checks — wrap generated bodies in a function
  // declaration and let the JS engine parse them. Catches unbalanced
  // braces, broken template literals, malformed identifiers etc. that
  // .toContain() assertions cannot detect.
  describe("syntactic sanity (parse via new Function)", function () {

    /**
     * Wrap the generated body in a function declaration with stubs
     * for the identifiers it references at the call site (exportFunction,
     * original_functions, fp_enabled, etc.). new Function() throws
     * SyntaxError on malformed output but tolerates free variables —
     * the var-decl just documents the expected runtime contract.
     */
    function parseAsFunctionBody(body) {
      const wrapped =
        "var exportFunction, original_functions, fp_enabled, fp_call_count, " +
        "fp_get_count, fp_set_count, fpdTrackCallers, updateCount, WrapHelper;\n" +
        body;
      return new Function("args", wrapped);
    }

    it("minimal wrapper should produce parseable code", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent"
      };
      const body = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });

    it("wrapper with function replacement should produce parseable code", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        wrapped_objects: [
          { wrapped_name: "origNow", original_name: "Performance.prototype.now" }
        ],
        wrapping_function_args: "...args",
        wrapping_function_body: "return rounding_function(origNow.call(this, ...args), 100);",
        helping_code: "function rounding_function(n, p) { return n - (n % p); }"
      };
      const body = generateWrapperFunction("Performance.prototype.now", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });

    it("wrapper with apply_if + named function should produce parseable code", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        apply_if: "args[0] === true",
        wrapping_code_function_name: "patchUA",
        wrapping_code_function_call_window: true,
        wrapping_function_args: "...rest",
        wrapping_function_body: "return 'spoofed';",
        post_replacement_code: "var done = true;"
      };
      const body = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });

    it("wrapper with object_properties post_wrapping_code should produce parseable code", function () {
      const wrapper = {
        parent_object: "Performance.prototype",
        parent_object_property: "now",
        post_wrapping_code: [
          {
            code_type: "object_properties",
            parent_object: "Performance.prototype",
            parent_object_property: "now",
            wrapped_objects: [
              { wrapped_name: "originalD_get",
                original_name: 'Object.getOwnPropertyDescriptor(Performance.prototype, "now").get' }
            ],
            wrapped_properties: [
              { property_name: "get", property_value: "function() { return originalD_get.call(this); }" }
            ]
          }
        ]
      };
      const body = generateWrapperFunction("Performance.prototype.now", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });

    it("wrapper with delete_properties should produce parseable code", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        post_wrapping_code: [
          {
            code_type: "delete_properties",
            parent_object: "navigator",
            delete_properties: ["getBattery", "getGamepads"]
          }
        ]
      };
      const body = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });

    it("wrapper with freeze + prototype should produce parseable code", function () {
      const wrapper = {
        parent_object: "navigator",
        parent_object_property: "userAgent",
        freeze: true,
        wrapper_prototype: "Function"
      };
      const body = generateWrapperFunction("navigator.userAgent", wrapper);
      expect(() => parseAsFunctionBody(body)).not.toThrow();
    });
  });

});
