import type ts from "typescript/lib/tsserverlibrary";
import { describe, expect, test } from "vitest";
import { keepPreferredSourceOnly } from "../src/keep-preferred-source-only";

const printSugggestions = (entries: ts.CompletionEntry[]) =>
	entries.map((entry) => {
		if (entry.kind && entry.kindModifiers)
			return {
				name: entry.name,
				source: entry.source,
				kind: entry.kind,
				kindModifiers: entry.kindModifiers,
			};

		return {
			name: entry.name,
			source: entry.source,
		};
	});

describe("keepPreferredSourceOnly - exclude", () => {
	const mode = "exclude";

	test("keepPreferredSourceOnly", () => {
		const mockEntries = [
			{ name: "readFile", source: "node:fs" },
			{ name: "readFile", source: "node:fs/promises" },
			{ name: "writeFile", source: "node:fs" },
			{ name: "writeFile", source: "node:fs/promises" },
			{ name: "uniqueFunction", source: "node:fs" },
			{ name: "otherFunction", source: "other-module" },
		] as ts.CompletionEntry[];

		const result = keepPreferredSourceOnly(
			[{ prefer: "node:fs/promises", insteadOf: "node:fs" }],
			mockEntries,
			mode,
		);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "readFile",
		    "source": "node:fs/promises",
		  },
		  {
		    "name": "writeFile",
		    "source": "node:fs/promises",
		  },
		  {
		    "name": "uniqueFunction",
		    "source": "node:fs",
		  },
		  {
		    "name": "otherFunction",
		    "source": "other-module",
		  },
		]
	`);
	});

	test("keepPreferredSourceOnly with multiple preferences", () => {
		const mockEntries = [
			{ name: "fn1", source: "sourceA" },
			{ name: "fn1", source: "sourceB" },
			{ name: "fn2", source: "sourceC" },
			{ name: "fn2", source: "sourceD" },
		] as ts.CompletionEntry[];

		const preferences = [
			{ prefer: "sourceB", insteadOf: "sourceA" },
			{ prefer: "sourceD", insteadOf: "sourceC" },
		];

		const result = keepPreferredSourceOnly(preferences, mockEntries, mode);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "fn1",
		    "source": "sourceB",
		  },
		  {
		    "name": "fn2",
		    "source": "sourceD",
		  },
		]
	`);
	});

	test("keepPreferredSourceOnly with no matching preferences", () => {
		const mockEntries = [
			{ name: "fn1", source: "sourceA" },
			{ name: "fn2", source: "sourceB" },
		] as ts.CompletionEntry[];

		const preferences = [{ prefer: "sourceC", insteadOf: "sourceD" }];

		const result = keepPreferredSourceOnly(preferences, mockEntries, mode);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "fn1",
		    "source": "sourceA",
		  },
		  {
		    "name": "fn2",
		    "source": "sourceB",
		  },
		]
	`);
	});
});

describe("keepPreferredSourceOnly - exclude", () => {
	const mode = "sort-last";

	test("keepPreferredSourceOnly", () => {
		const mockEntries = [
			{ name: "readFile", source: "node:fs" },
			{ name: "readFile", source: "node:fs/promises" },
			{ name: "writeFile", source: "node:fs" },
			{ name: "writeFile", source: "node:fs/promises" },
			{ name: "uniqueFunction", source: "node:fs" },
			{ name: "otherFunction", source: "other-module" },
		] as ts.CompletionEntry[];

		const result = keepPreferredSourceOnly(
			[{ prefer: "node:fs/promises", insteadOf: "node:fs" }],
			mockEntries,
			mode,
		);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "readFile",
		    "source": "node:fs/promises",
		  },
		  {
		    "name": "writeFile",
		    "source": "node:fs/promises",
		  },
		  {
		    "name": "uniqueFunction",
		    "source": "node:fs",
		  },
		  {
		    "name": "otherFunction",
		    "source": "other-module",
		  },
		]
	`);
	});

	test("keepPreferredSourceOnly with multiple preferences", () => {
		const mockEntries = [
			{ name: "fn1", source: "sourceA" },
			{ name: "fn1", source: "sourceB" },
			{ name: "fn2", source: "sourceC" },
			{ name: "fn2", source: "sourceD" },
		] as ts.CompletionEntry[];

		const preferences = [
			{ prefer: "sourceB", insteadOf: "sourceA" },
			{ prefer: "sourceD", insteadOf: "sourceC" },
		];

		const result = keepPreferredSourceOnly(preferences, mockEntries, mode);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "fn1",
		    "source": "sourceB",
		  },
		  {
		    "name": "fn2",
		    "source": "sourceD",
		  },
		]
	`);
	});

	test("keepPreferredSourceOnly with no matching preferences", () => {
		const mockEntries = [
			{ name: "fn1", source: "sourceA" },
			{ name: "fn2", source: "sourceB" },
		] as ts.CompletionEntry[];

		const preferences = [{ prefer: "sourceC", insteadOf: "sourceD" }];

		const result = keepPreferredSourceOnly(preferences, mockEntries, mode);

		expect(printSugggestions(result)).toMatchInlineSnapshot(`
		[
		  {
		    "name": "fn1",
		    "source": "sourceA",
		  },
		  {
		    "name": "fn2",
		    "source": "sourceB",
		  },
		]
	`);
	});
});
