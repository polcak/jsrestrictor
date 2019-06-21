//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
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

/*
 * Create private namespace
 */
(function() {
	var wrappers = [
		{
			parent_object: "HTMLCanvasElement.prototype",
			parent_object_property: "toDataURL",
			wrapped_objects: [
				{
					original_name: "HTMLCanvasElement.prototype.toDataURL",
					wrapped_name: "origToDataURL",
				}
			],
			helping_code: "",
			wrapping_function_args: "...args",
			wrapping_function_body: `
					var ctx = this.getContext("2d");
					ctx.fillStyle = "white";
					ctx.fillRect(0, 0, this.width, this.height);
					return origToDataURL.call(this, ...args);
				`
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "getImageData",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_args: "sx, sy, sw, sh",
			wrapping_function_body: `
				var fake_image = new ImageData(sw, sh);
				return fake_image;
			`
		},
		{
			parent_object: "HTMLCanvasElement.prototype",
			parent_object_property: "toBlob",
			wrapped_objects: [],
			helping_code: "",
			wrapping_function_args: "callback, mimeType, qualityArgument",
			wrapping_function_body: `
				var fake = document.createElement("canvas");
				fake.setAttribute("width", this.width);
				fake.setAttribute("height", this.height);
				return fake.toBlob(callback, mimeType, qualityArgument);
			`
		}
	]
	add_wrappers(wrappers);
})();
