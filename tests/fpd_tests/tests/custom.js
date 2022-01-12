/** \file
 * \brief Example of custom FPD test file
 *
 *  \author Copyright (C) 2021  Marek Salon
 *
 *  \license SPDX-License-Identifier: GPL-3.0-or-later
 */
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

// definition of test function must have "test_" prefix and "wrappers" parameter
function test_canvasFp(wrappers) {
	// wrap function body to try-catch construction - count only successful accesses
	try {
		var canvas = document.createElement('canvas');
		canvas.height = 60;
		canvas.width = 400;
		var canvasContext = canvas.getContext('2d');
		canvas.style.display = 'inline';
		canvasContext.textBaseline = 'alphabetic';
		canvasContext.fillStyle = '#f60';
		canvasContext.fillRect(125, 1, 62, 20);
		canvasContext.fillStyle = '#069';
		canvasContext.font = '11pt no-real-font-123';
		canvasContext.fillText("co ja viem, \uD83D\uDE03", 2, 15);
		canvasContext.font = 'bold 48px serif';

		// end of function - have to specify all function accesses to resources that supposed to be wrapped and tested 
		// use 'addWrapper' method like here:
		addWrapper(wrappers, "CanvasRenderingContext2D.prototype.fillStyle", "set", 2);
		addWrapper(wrappers, "CanvasRenderingContext2D.prototype.fillText", "call", 1);
		addWrapper(wrappers, "CanvasRenderingContext2D.prototype.font", "set", 2);
		addWrapper(wrappers, "CanvasRenderingContext2D.prototype.textBaseline", "set", 1);
		addWrapper(wrappers, "CanvasRenderingContext2D.prototype.fillRect", "call", 1);
	}
	catch {}
}