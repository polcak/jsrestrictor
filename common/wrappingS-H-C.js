//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
// SPDX-FileCopyrightText: 2019 Libor Polcak <polcak@fit.vutbr.cz>
// SPDX-License-Identifier: GPL-3.0-or-later
//

/*
 * Create private namespace
 */
(function() {

	function create_post_wrappers(parent_object) {
		return [
				{
					code_type: "object_properties",
					parent_object: parent_object,
					parent_object_property: "contentWindow",
					wrapped_objects: [
						{
							original_name: "Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')['get'];",
							wrapped_name: "cw",
						},
					],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									var parent=cw.call(this);
									try {
										parent.HTMLCanvasElement;
									}
									catch(d) {
										return; // HTMLIFrameElement.contentWindow properties could not be accessed anyway
									}
									wrapping(parent);
									return parent;
								}`,
						},
					],
				},
				{
					code_type: "object_properties",
					parent_object: parent_object,
					parent_object_property: "contentDocument",
					wrapped_objects: [
						{
							original_name: "Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentDocument')['get'];",
							wrapped_name: "cd",
						},
					],
					wrapped_properties: [
						{
							property_name: "get",
							property_value: `
								function() {
									var parent=cw.call(this);
									try{
										parent.HTMLCanvasElement;
									}
									catch(d) {
										return; // HTMLIFrameElement.contentDocument properties could not be accessed anywaya
									}
									wrapping(parent);
									return cd.call(this);
								}`,
						},
					],
				},
			];
	}

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
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.HTMLCanvasElement.prototype.toDataURL",
			replace_original_function: true,
			wrapping_function_args: "...args",
			wrapping_function_body: `
					var ctx = this.getContext("2d");
					ctx.fillStyle = "white";
					ctx.fillRect(0, 0, this.width, this.height);
					return origToDataURL.call(this, ...args);
				`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
		},
		{
			parent_object: "CanvasRenderingContext2D.prototype",
			parent_object_property: "getImageData",
			wrapped_objects: [],
			helping_code: "",
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.CanvasRenderingContext2D.prototype.getImageData",
			replace_original_function: true,
			wrapping_function_args: "sx, sy, sw, sh",
			wrapping_function_body: `
				var fake_image = new ImageData(sw, sh);
				return fake_image;
			`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
		},
		{
			parent_object: "HTMLCanvasElement.prototype",
			parent_object_property: "toBlob",
			wrapped_objects: [
				{
					original_name: "HTMLCanvasElement.prototype.toBlob",
					wrapped_name: "origToBlob",
				}
			],
			helping_code: "",
			wrapping_code_function_name: "wrapping",
			wrapping_code_function_params: "parent",
			wrapping_code_function_call_window: true,
			original_function: "parent.HTMLCanvasElement.prototype.toBlob",
			replace_original_function: true,
			wrapping_function_args: "callback, mimeType, qualityArgument",
			wrapping_function_body: `
				var fake = document.createElement("canvas");
				fake.setAttribute("width", this.width);
				fake.setAttribute("height", this.height);
				return origToBlob.call(fake, callback, mimeType, qualityArgument);
			`,
			post_wrapping_code: create_post_wrappers("HTMLIFrameElement.prototype"),
		}
	]
	add_wrappers(wrappers);
})();
