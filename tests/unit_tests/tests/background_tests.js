//
//  JShelter is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2020 Martin Bednar
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

/// <reference path="../../common/background.js">

const { tab_levels, tab_urls, current_level, updateBadge, queryInfo, tabUpdate, tabActivate, connected } = require('../tmp/background.js');

const { levels, default_level } = require('../tmp/levels.js');

describe("Background", function() {
	describe("Function updateBadge", function() {		
		it("should be defined.",function() {
			expect(updateBadge).toBeDefined();
		});
	});
	describe("Function tabUpdate", function() {		
		it("should be defined.",function() {
			expect(tabUpdate).toBeDefined();
		});
		it("should return default level.",function() {
			expect(tabUpdate(5,{'url':'https://www.jshelter.org/'})).toBe(default_level);
		});
		it("should return empty level and not throw error when argument changeInfo['url'] is undefined.",function() {
			reset_tab_urls(); // Delete possible artifacts of other tests
			let error;
			try {
				expect(tabUpdate(5,{'url':undefined}).level_id).toBe("");
			}
			catch (e) {
				error = e;
			}
			expect(error).withContext(error && error.stack).toBeUndefined();
		});
		it("should throw error when parametr changeInfo is undefined.",function() {
			expect(function() {tabUpdate(5,undefined)}).toThrowError();
		});
		it("should throw error when no parametr is given.",function() {
			expect(function() {tabUpdate()}).toThrowError();
		});
	});
});
