// Loads an extension script (a classic content script, not a module) into an
// isolated vm context with minimal browser stubs, so its functions can be
// tested without modifying the script itself.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..", "..");

function loadScript(relPath, overrides = {}) {
	const sandbox = {
		console: { log() {}, debug() {}, warn() {}, error() {} },
		document: {
			querySelector: () => null,
			querySelectorAll: () => [],
			arrive() {},
		},
		location: { href: "https://example.com/prweb/" },
		chrome: {
			runtime: { sendMessage() {}, getURL: (p) => p },
			storage: { sync: { get() {}, set() {} }, local: { get() {}, set() {} } },
		},
		$: () => ({ length: 0 }),
		Tinycon: {},
		...overrides,
	};
	sandbox.window = sandbox;
	vm.createContext(sandbox);
	vm.runInContext(fs.readFileSync(path.join(ROOT, relPath), "utf8"), sandbox, { filename: relPath });
	return {
		context: sandbox,
		// `class` and `let`/`const` declarations are not properties of the global
		// object, so they are read back by evaluating an expression in the context.
		evaluate: (expr) => vm.runInContext(expr, sandbox),
	};
}

module.exports = { loadScript };
