//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2026 Libor Polčák
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

/// <reference path="../../common/fp_detect_background.js">

describe("fp_detect_background", function() {

	describe("fpdCommonMessageListener (fp-detection) - basic operations", function() {

		afterEach(function() {
			Object.keys(fpDb).forEach(key => delete fpDb[key]);
		});

		it("should create a new fpDb record.", async function() {
			const TAB_ID = 1;
			const RESOURCE = "test.api";
			const TYPE = "get";
			var test_obj = {
					[RESOURCE + "#" + TYPE]:
								{
									"args": {
										"": 1
										},
									"stack": []
								}
				};
			await fpdCommonMessageListener(
				{
					purpose: "fp-detection",
					content: JSON.stringify(test_obj)
				}
				,
				{
					tab: {id: TAB_ID},
				}
			);
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"]).toBeDefined();
			let keys = Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(keys.length).toBe(1);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"][keys[0]]).toBe(1, fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["total"]).toBe(1, fpDb[TAB_ID][RESOURCE][TYPE]);
		});
		it("should register multiple calls of the same API.", async function() {
			const TAB_ID = 2;
			const RESOURCE = "test.api.multicall";
			const TYPE = "get";
			const REPEAT = 10;
			let sum = 0;
			for (let i = 1; i <= REPEAT; i++) {
				var test_obj = {
					[RESOURCE + "#" + TYPE]:
								{
									"args": {
										"": i
										},
									"stack": []
								}
				};
				await fpdCommonMessageListener(
					{
						purpose: "fp-detection",
						content: JSON.stringify(test_obj)
					}
					,
					{
						tab: {id: TAB_ID},
					}
				);
				sum += i;
			}
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"]).toBeDefined();
			let keys = Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(keys.length).toBe(1);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"][keys[0]]).toBe(sum, fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["total"]).toBe(sum, fpDb[TAB_ID][RESOURCE][TYPE]);
		});
		it("should register multiple calls of the same API - different arguments, multiple messages.", async function() {
			const TAB_ID = 2;
			const RESOURCE = "test.api.multicall";
			const TYPE = "get";
			const REPEAT = 10;
			const CALLED1 = 5;
			const CALLED2 = 3;
			const CALLED3 = 18;
			const ARGS = [["0", 5], ["a-b", 3], ["a-b-c", 18]];
			for (let [args, count] of ARGS) {
				var test_obj = {
					[RESOURCE + "#" + TYPE]:
								{
									"args": {
										[args]: count
										},
									"stack": []
								}
				};
				await fpdCommonMessageListener(
					{
						purpose: "fp-detection",
						content: JSON.stringify(test_obj)
					}
					,
					{
						tab: {id: TAB_ID},
					}
				);
			}
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"]).toBeDefined();
			let keys = Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(keys.length).toBe(ARGS.length);
			called = []
			for (key of keys) {
				called.push(fpDb[TAB_ID][RESOURCE][TYPE]["args"][key]);
			}
			expect(called.length).toBe(ARGS.length, fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(called).toEqual(jasmine.arrayContaining([CALLED1, CALLED2, CALLED3]), fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["total"]).toBe(CALLED1 + CALLED2 + CALLED3, fpDb[TAB_ID][RESOURCE][TYPE]);
		});
		it("should register multiple calls of the same API - different arguments, one message.", async function() {
			const TAB_ID = 2;
			const RESOURCE = "test.api.multicall";
			const TYPE = "get";
			const REPEAT = 10;
			const CALLED1 = 5;
			const CALLED2 = 3;
			const CALLED3 = 18;
			const ARGS = [["0", 5], ["a-b", 3], ["a-b-c", 18]];
			let args_obj = {};
			for (let [args, count] of ARGS) {
				args_obj[args] = count;
			};
			var test_obj = {
				[RESOURCE + "#" + TYPE]:
							{
								"args": args_obj,
								"stack": []
							}
			};
			await fpdCommonMessageListener(
				{
					purpose: "fp-detection",
					content: JSON.stringify(test_obj)
				}
				,
				{
					tab: {id: TAB_ID},
				}
			);
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["args"]).toBeDefined();
			let keys = Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(keys.length).toBe(ARGS.length);
			called = []
			for (key of keys) {
				called.push(fpDb[TAB_ID][RESOURCE][TYPE]["args"][key]);
			}
			expect(called.length).toBe(ARGS.length, fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(called).toEqual(jasmine.arrayContaining([CALLED1, CALLED2, CALLED3]), fpDb[TAB_ID][RESOURCE][TYPE]["args"]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["total"]).toBe(CALLED1 + CALLED2 + CALLED3, fpDb[TAB_ID][RESOURCE][TYPE]);
		});
		it("should differentiate between get and set.", async function() {
			const TAB_ID = 3;
			const RESOURCE = "test.api.multicall";
			const TYPES = ["get", "set"];
			const REPEAT = 10;
			for (let i = 0; i < REPEAT; i++) {
				for (const type of TYPES) {
					var test_obj = {
						[RESOURCE + "#" + type]:
									{
										"args": {
											"": 1
											},
										"stack": []
									}
					};
					await fpdCommonMessageListener(
						{
							purpose: "fp-detection",
							content: JSON.stringify(test_obj)
						}
						,
						{
							tab: {id: TAB_ID},
						}
					);
				}
			}
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			for (const type of TYPES) {
				expect(fpDb[TAB_ID][RESOURCE][type]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
				expect(fpDb[TAB_ID][RESOURCE][type]["args"]).toBeDefined();
				let keys = Object.keys(fpDb[TAB_ID][RESOURCE][type]["args"]);
				expect(keys.length).toBe(1);
				expect(fpDb[TAB_ID][RESOURCE][type]["args"][keys[0]]).toBe(REPEAT, fpDb[TAB_ID][RESOURCE][type]["args"]);
				expect(fpDb[TAB_ID][RESOURCE][type]["total"]).toBe(REPEAT, fpDb[TAB_ID][RESOURCE][type]);
			}
		});
		it("should support many resources.", async function() {
			const TAB_ID = 4;
			const RESOURCES = ["resource0", "resource1", "resource2", "resource3", "resource4", "resource5", "resource6", "resource7", "resource8"];
			const TYPES = ["get", "set"];
			const REPEAT = 10;
			for (let i = 0; i < REPEAT; i++) {
				for (const resource of RESOURCES) {
					for (const type of TYPES) {
						var test_obj = {
							[resource + "#" + type]:
										{
											"args": {
												"": 1
												},
											"stack": []
										}
						};
						await fpdCommonMessageListener(
							{
								purpose: "fp-detection",
								content: JSON.stringify(test_obj)
							}
							,
							{
								tab: {id: TAB_ID},
							}
						);
					}
				}
			}
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			for (const resource of RESOURCES) {
				expect(fpDb[TAB_ID][resource]).toBeDefined(fpDb[TAB_ID]);
				for (const type of TYPES) {
					expect(fpDb[TAB_ID][resource][type]).toBeDefined(fpDb[TAB_ID][resource]);
					expect(fpDb[TAB_ID][resource][type]["args"]).toBeDefined();
					let keys = Object.keys(fpDb[TAB_ID][resource][type]["args"]);
					expect(keys.length).toBe(1);
					expect(fpDb[TAB_ID][resource][type]["args"][keys[0]]).toBe(REPEAT, fpDb[TAB_ID][resource][type]["args"]);
					expect(fpDb[TAB_ID][resource][type]["total"]).toBe(REPEAT, fpDb[TAB_ID][resource][type]);
				}
			}
		});
		it("should collect information on stacks - single message.", async function() {
			const TAB_ID = 5;
			const RESOURCE = "test.api";
			const TYPE = "get";
			const STACK_COUNT = 5;
			let stacks = [];
			for (let i = 0; i < STACK_COUNT; i++) {
				stacks.push("stack" + i.toString());
			}
			var test_obj = {
					[RESOURCE + "#" + TYPE]:
								{
									"args": {
										"": 1
										},
									"stack": stacks
								}
				};
			await fpdCommonMessageListener(
				{
					purpose: "fp-detection",
					content: JSON.stringify(test_obj)
				}
				,
				{
					tab: {id: TAB_ID},
				}
			);
			expect(fpDb).toBeDefined();
			expect(fpDb[TAB_ID]).toBeDefined();
			expect(fpDb[TAB_ID][RESOURCE]).toBeDefined(fpDb[TAB_ID]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]).toBeDefined(fpDb[TAB_ID][RESOURCE]);
			expect(fpDb[TAB_ID][RESOURCE][TYPE]["callers"]).toBeDefined();
			for (let i = 0; i < STACK_COUNT; i++) {
				expect(Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["callers"])).toContain("stack" + i.toString());
			}
			expect(Object.keys(fpDb[TAB_ID][RESOURCE][TYPE]["callers"]).length).toBe(STACK_COUNT);
		});
	});

});
