const { test, describe } = require("node:test");
const assert = require("node:assert");
const { loadScript } = require("./helpers/load-script");

function loadShared() {
	return loadScript("resources/shared.js");
}

describe("PDT.contrastTextColor", () => {
	const { evaluate } = loadShared();
	const contrast = (color) => evaluate("PDT").contrastTextColor(color);

	test("black text on light backgrounds", () => {
		assert.strictEqual(contrast("#FFFFFF"), "#000000");
		assert.strictEqual(contrast("#00FF00"), "#000000");
		assert.strictEqual(contrast("#FFA30F"), "#000000");
	});

	test("white text on dark backgrounds", () => {
		assert.strictEqual(contrast("#000000"), "#FFFFFF");
		assert.strictEqual(contrast("#FF0000"), "#FFFFFF");
		assert.strictEqual(contrast("#0000FF"), "#FFFFFF");
	});

	test("threshold favors white text (0.3): #808080 is white, #999999 is black", () => {
		assert.strictEqual(contrast("#808080"), "#FFFFFF");
		assert.strictEqual(contrast("#999999"), "#000000");
	});

	test("leading # is optional", () => {
		assert.strictEqual(contrast("FFFFFF"), "#000000");
		assert.strictEqual(contrast("000000"), "#FFFFFF");
	});
});

describe("PDT.isDigit", () => {
	const { evaluate } = loadShared();
	const isDigit = (v) => evaluate("PDT").isDigit(v);

	test("true for single digits (number or string)", () => {
		assert.strictEqual(isDigit(0), true);
		assert.strictEqual(isDigit("7"), true);
		assert.strictEqual(isDigit("9"), true);
	});

	test("false for letters, empty and multi-digit strings", () => {
		assert.strictEqual(isDigit("a"), false);
		assert.strictEqual(isDigit(""), false);
		assert.strictEqual(isDigit("10"), false);
	});
});

describe("extractClassName", () => {
	const { context } = loadShared();
	const extract = (input, full) => context.extractClassName(input, full);

	test("strips everything up to '(' and the closing ')'", () => {
		assert.strictEqual(extract("pyWorkPage (ABC-Work-Case)", true), "ABC-Work-Case");
	});

	test("returns the part after 'Work-'", () => {
		assert.strictEqual(extract("pyWorkPage (ABC-Work-Case)"), "Case");
	});

	test("returns the part after 'Assign-'", () => {
		assert.strictEqual(extract("newAssignPage (Assign-Worklist)"), "Worklist");
	});

	test("keeps the last two segments when there are more than three", () => {
		assert.strictEqual(extract("(Org-App-Data-Thing)"), "Data-Thing");
	});

	test("keeps only the last segment for up to three segments", () => {
		assert.strictEqual(extract("(Org-App-Thing)"), "Thing");
		assert.strictEqual(extract("Org-Thing"), "Thing");
	});

	test("returns input unchanged when there is no hyphen", () => {
		assert.strictEqual(extract("Plain"), "Plain");
	});

	test("returns undefined for empty input", () => {
		assert.strictEqual(extract(""), undefined);
		assert.strictEqual(extract(undefined), undefined);
	});

	test("KNOWN: 'Work-' takes precedence over the segment rule", () => {
		assert.strictEqual(extract("(Org-Work-Case-Sub)"), "Case-Sub");
	});
});

describe("PDT.init site configuration", () => {
	function initWith(href, siteConfig, settings) {
		const { context, evaluate } = loadShared();
		context.location = { href };
		context.browser = {
			storage: {
				sync: {
					get: (_keys, cb) => cb({ siteConfig, settings }),
				},
			},
		};
		const PDT = evaluate("PDT");
		PDT.init();
		return PDT;
	}

	const url = "https://dev1.example.com/prweb/app/x";
	const cfg = (color) => [{ site: "dev1.example.com", label: "DEV1", color }];

	test("normalizes 3-digit hex colors, with or without '#'", () => {
		assert.strictEqual(initWith(url, cfg("#abc")).siteConfig.color, "#aabbcc");
		assert.strictEqual(initWith(url, cfg("abc")).siteConfig.color, "#aabbcc");
	});

	test("keeps 6-digit colors and adds the missing '#'", () => {
		assert.strictEqual(initWith(url, cfg("#112233")).siteConfig.color, "#112233");
		assert.strictEqual(initWith(url, cfg("112233")).siteConfig.color, "#112233");
	});

	test("sets hasConfigForSite only when a configured site matches", () => {
		assert.strictEqual(initWith(url, cfg("#fff")).hasConfigForSite, true);
		assert.strictEqual(initWith("https://other.example.com/prweb/", cfg("#fff")).hasConfigForSite, false);
	});

	test("missing settings default to empty tracer/clipboard/devstudio objects", () => {
		const PDT = initWith(url, undefined, undefined);
		assert.strictEqual(typeof PDT.settings.tracer, "object");
		assert.strictEqual(typeof PDT.settings.clipboard, "object");
		assert.strictEqual(typeof PDT.settings.devstudio, "object");
		assert.strictEqual(PDT.hasConfigForSite, false);
	});

	test("KNOWN: site match is a substring of the full URL, not the hostname", () => {
		const evil = "https://evil.example/prweb/?a=dev1.example.com";
		assert.strictEqual(initWith(evil, cfg("#fff")).hasConfigForSite, true);
	});
});
