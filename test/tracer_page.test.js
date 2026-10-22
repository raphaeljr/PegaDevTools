const { test, describe } = require("node:test");
const assert = require("node:assert");
const { loadScript } = require("./helpers/load-script");

function loadTracerPage() {
	let stylesInjected = 0;
	const { context } = loadScript("tracer/tracer_page.js", {
		siteConfig() {},
		injectStyles() {
			stylesInjected++;
		},
		injectScript() {},
	});
	return { prepareSQL: context.prepareSQL, stylesInjected: () => stylesInjected };
}

describe("prepareSQL", () => {
	const { prepareSQL } = loadTracerPage();

	test("replaces each '?' with the matching value, in bold and quoted", () => {
		const out = prepareSQL("SELECT * FROM t WHERE a = ? AND b = ?", "<1> <abc>");
		assert.ok(out.includes("a = <b>'1'</b>"));
		assert.ok(out.includes("b = <b>'abc'</b>"));
	});

	test("wraps SQL keywords in a highlight span", () => {
		const out = prepareSQL("SELECT * FROM t WHERE a = ?", "<1>");
		for (const kw of ["SELECT", "FROM", "WHERE"]) {
			assert.ok(out.includes(`<span class="sql-keyword">${kw}</span>`), kw);
		}
	});

	test("does not highlight lowercase keywords", () => {
		const out = prepareSQL("select * from t where a = ?", "<1>");
		assert.ok(!out.includes("sql-keyword"));
	});

	test("turns a quoted null value into NULL", () => {
		const out = prepareSQL("SELECT * FROM t WHERE a = ?", "<'null'>");
		assert.ok(out.includes("a = <b>NULL</b>"));
	});

	test("expanded mode puts major clauses on new lines", () => {
		const out = prepareSQL("SELECT a, b FROM t WHERE x = 1 AND y = 2", "", true);
		// line breaks are inserted before keywords are wrapped in highlight spans
		for (const kw of ["FROM", "WHERE", "AND"]) {
			assert.ok(out.includes(`<br><span class="sql-keyword">${kw}</span>`), kw);
		}
		assert.ok(out.includes(",<br>"));
	});

	test("collapsed mode (default) adds no line breaks", () => {
		const out = prepareSQL("SELECT a, b FROM t WHERE x = 1 AND y = 2", "");
		assert.ok(!out.includes("<br>"));
	});

	test("replaces '<' and '>' inside values, so values cannot inject tags", () => {
		const out = prepareSQL("SELECT ? FROM t", "<<img src=x>>");
		assert.ok(!out.includes("<img"));
	});

	test("KNOWN: fewer values than '?' placeholders prints 'undefined'", () => {
		const out = prepareSQL("a = ? AND b = ?", "<1>");
		assert.ok(out.includes("<b>undefined</b>"));
	});

	test("injects the keyword style on every call", () => {
		const loaded = loadTracerPage();
		loaded.prepareSQL("SELECT 1", "");
		loaded.prepareSQL("SELECT 2", "");
		assert.strictEqual(loaded.stylesInjected(), 2);
	});
});
