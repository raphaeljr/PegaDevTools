const js = require("@eslint/js");
const globals = require("globals");

// Content scripts share one global scope per frame, so names defined in
// resources/shared.js (and Pega/library globals) are declared here as read-only.
const extensionGlobals = {
	chrome: "readonly",
	browser: "writable",
	$: "readonly",
	jQuery: "readonly",
	CodeMirror: "readonly",
	Tinycon: "readonly",
	Huebee: "readonly",
	pega: "readonly",
	// Pega runtime globals (present in the page when the injected scripts run)
	doClose: "readonly",
	toggleMessages: "readonly",
	flowTypeCategory: "readonly",
	// resources/shared.js
	PDT: "readonly",
	DEBUG: "readonly",
	getFrameId: "readonly",
	copyToClipboard: "readonly",
	messageServiceWorker: "readonly",
	appendScript: "readonly",
	injectScript: "readonly",
	injectScriptWithCallback: "readonly",
	injectSidebarToggle: "readonly",
	injectCloseShortcut: "readonly",
	executeScript: "readonly",
	extractClassName: "readonly",
	injectStyles: "readonly",
	replaceInnerHTML: "readonly",
	siteConfig: "readonly",
	sleep: "readonly",
	isInDevStudio: "readonly",
	injectRuleExport: "readonly",
	getObjectFromStorage: "readonly",
};

module.exports = [
	{
		ignores: ["node_modules/**", "resources/**", "clipboard.experimental.js"],
	},
	js.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "script",
			globals: { ...globals.browser, ...extensionGlobals },
		},
		rules: {
			// Top-level functions are called from other files or inline handlers,
			// so only local scope is checked.
			"no-unused-vars": ["warn", { vars: "local", args: "none", caughtErrors: "none" }],
			"no-empty": "warn",
			// Names from shared.js are declared as globals above; redefining them
			// in the file that owns them is expected.
			"no-redeclare": ["error", { builtinGlobals: false }],
		},
	},
	{
		// TODO: `$xml` is assigned without declaration (implicit global); fix in a separate change.
		files: ["js/copyNameClass.js", "devstudio/devstudio_data.js"],
		rules: {
			"no-undef": "warn",
		},
	},
	{
		files: ["eslint.config.js"],
		languageOptions: {
			globals: globals.node,
		},
	},
];
