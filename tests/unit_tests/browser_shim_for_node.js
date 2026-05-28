// SPDX-License-Identifier: CC0-1.0
//
// This file is released into the public domain (CC0 1.0).
// You may use, modify, and distribute it without any restrictions.
//
// Node.js 20+ environment shim for WebExtension-like globals

// unify global scope (WebExtension / Worker style)
global.self = global;

// minimal browser mock (minimum needed for tests)
global.browser = {
	tabs: {
		onUpdated: {
			addListener: () => undefined,
		},
		onRemoved: {
			addListener: () => undefined,
		},
	},
	runtime: {
		onInstalled: {
			addListener: () => undefined,
		},
		onConnect: {
			addListener: () => undefined,
		},
		onMessage: {
			addListener: () => undefined,
		},
	},
	i18n: {
		getMessage: () => "mockup",
	},
	browserAction: {
		setBadgeBackgroundColor: () => undefined,
	},
	storage: {
		sync: {
			get: function (param) {
				let ret = {};
				if (param != null) {
					ret = param;
				};
				return Promise.resolve(ret);
			},
			set: () => Promise.resolve(),
			clear: () => undefined
		},
		onChanged: {
			addListener: () => undefined,
		},
	},
};

// window mock (minimum needed for tests)
window = {
	addEventListener: () => undefined
};

// Node 20 already provides:
// - globalThis.crypto (Web Crypto)
// - globalThis.fetch

// document mock (minimum needed for tests)
global.document = {
	createElement: () => ({
		nodeType: 1,
		nodeName: "DIV",
		style: {},
		appendChild: () => {},
		setAttribute: () => {},
	}),
	documentElement: {
		classList: {
			add: () => {},
			toggle: () => {}
		}
	}
};

