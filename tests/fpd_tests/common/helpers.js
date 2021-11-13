/** \file
 * \brief Contains helping methods for FPD test suite
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

function updateDoc(result) {
	var parent = document.getElementById("result");
	for (let resource of Object.keys(result)) {	
		var html = "<p>" + resource + "<span class=\"resource\"></span>";
		for (let method of Object.keys(result[resource])) {
			html += "<br><span class=\"method\">" + method +": <span class=\"" + method +"\"style=\"color:blue\">" + result[resource][method] + "</span></span>";
		}
		html += "</p>";
		
		var element = document.createElement('div');
		element.id = resource.replaceAll('.', '');
		element.innerHTML += html;
		parent.appendChild(element);
	}		
}

function addWrapper(wrappers, resource, method, number) {
	wrappers[resource] = wrappers[resource] || {};
	wrappers[resource][method] = wrappers[resource][method] || 0;
	wrappers[resource][method] += number;
}

function messageExtension(test) {
	window.top.postMessage({
		fpdTest: test
	}, "*");
}