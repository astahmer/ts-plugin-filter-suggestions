import * as ts from "typescript/lib/tsserverlibrary";
import { describe, expect, test } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IntellisensePluginConfig } from "../src/config";
import plugin from "../src/index";
import {
	createFSBackedSystem,
	createVirtualLanguageServiceHost,
	createVirtualTypeScriptEnvironment,
	type VirtualTypeScriptEnvironment,
} from "@typescript/vfs";

function getDefaultCompilerOptions(tsModule: typeof ts) {
	const defaultCompilerOptions: ts.CompilerOptions = {
		// lib: ["lib.dom.d.ts", "lib.es2017.d.ts", "ESNext", "DOM"],
		types: ["node"],
		target: tsModule.ScriptTarget.Latest,
		moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
		module: tsModule.ModuleKind.CommonJS,
		jsx: tsModule.JsxEmit.Preserve,
	};

	return defaultCompilerOptions;
}

const compilerOpts = getDefaultCompilerOptions(ts);
const fsMap = new Map<string, string>();

// By providing a project root, then the system knows how to resolve node_modules correctly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const system = createFSBackedSystem(fsMap, projectRoot, ts);

const createLanguageServiceHost = (
	env: VirtualTypeScriptEnvironment,
): ts.LanguageServiceHost => {
	return createVirtualLanguageServiceHost(
		env.sys,
		[...fsMap.keys()],
		compilerOpts,
		ts,
	).languageServiceHost;
};

const mockFilename = "index.ts";
fsMap.set(mockFilename, "");

function getCompletions(
	{ sourceCode, position }: { sourceCode: string; position: number },
	options?: IntellisensePluginConfig,
) {
	// If using imports where the types don't directly match up to their FS representation (like the
	// imports for node) then use triple-slash directives to make sure globals are set up first.
	// const content = [`/// <reference types="node" />`, sourceCode].join("\n");
	const content = sourceCode;
	fsMap.set(mockFilename, content);

	const env = createVirtualTypeScriptEnvironment(
		system,
		[mockFilename],
		ts,
		compilerOpts,
	);

	const languageServiceHost = createLanguageServiceHost(env);
	const pluginInfo: ts.server.PluginCreateInfo = {
		languageService: env.languageService,
		languageServiceHost: languageServiceHost,
		serverHost: {} as never,
		project: {} as never,
		config: options ?? {},
	};

	const pluginModule = plugin({ typescript: ts });
	const pluginLanguageService = pluginModule.create(pluginInfo);

	return pluginLanguageService.getCompletionsAtPosition(
		mockFilename,
		position,
		undefined,
	);
}

function showCaret(text: string, index: number): string {
	return text.slice(0, index) + "|" + text.slice(index);
}

test("should suggest symbols from current file if less than 5 characters", () => {
	const string = "const abcdef = 123;\nconsole.log(abcd)";
	const index = 36;
	expect(showCaret(string, 36)).toMatchInlineSnapshot(`
          "const abcdef = 123;
          console.log(abcd|)"
        `);

	const completions = getCompletions(
		{ sourceCode: string, position: index },
		{ enableLogs: false },
	);
	expect(completions?.entries.length).toBe(66);
	expect(completions?.entries.some((e) => e.name === "abcdef")).toBe(true);
});

test("should have native suggestions if caret inside a string", () => {
	const string = `
		type Role = "admin" | "user";
		const role: Role = {} as Role;
		console.log(role === "");
		`;
	const index = string.length - 6;
	expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					type Role = "admin" | "user";
					const role: Role = {} as Role;
					console.log(role === "|");
					"
		`);

	const completions = getCompletions(
		{ sourceCode: string, position: index },
		{ enableLogs: false },
	);

	expect(completions?.entries).toMatchInlineSnapshot(`
			[
			  {
			    "commitCharacters": [],
			    "kind": "string",
			    "kindModifiers": "",
			    "name": "admin",
			    "replacementSpan": {
			      "length": 0,
			      "start": 90,
			    },
			    "sortText": "11",
			  },
			  {
			    "commitCharacters": [],
			    "kind": "string",
			    "kindModifiers": "",
			    "name": "user",
			    "replacementSpan": {
			      "length": 0,
			      "start": 90,
			    },
			    "sortText": "11",
			  },
			]
		`);
	expect(completions?.entries.length).toBe(2);
	expect(completions?.entries.some((e) => e.name === "admin")).toBe(true);
	expect(completions?.entries.some((e) => e.name === "user")).toBe(true);
});

describe("PropertyAccessExpression", () => {
	test("native suggestions on right side", () => {
		const string = `
		interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		const obj: Options = {} as Options;
		obj.e

		`;
		const index = string.length - 4;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					const obj: Options = {} as Options;
					obj.e|

					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ enableLogs: false },
		);

		expect(completions?.entries).toMatchInlineSnapshot(`
			[
			  {
			    "commitCharacters": undefined,
			    "data": undefined,
			    "filterText": undefined,
			    "hasAction": undefined,
			    "insertText": undefined,
			    "isImportStatementCompletion": undefined,
			    "isPackageJsonImport": undefined,
			    "isRecommended": undefined,
			    "isSnippet": undefined,
			    "kind": "property",
			    "kindModifiers": "optional",
			    "labelDetails": undefined,
			    "name": "enableLogs",
			    "replacementSpan": undefined,
			    "sortText": "11",
			    "source": undefined,
			    "sourceDisplay": undefined,
			  },
			  {
			    "commitCharacters": undefined,
			    "data": undefined,
			    "filterText": undefined,
			    "hasAction": undefined,
			    "insertText": undefined,
			    "isImportStatementCompletion": undefined,
			    "isPackageJsonImport": undefined,
			    "isRecommended": undefined,
			    "isSnippet": undefined,
			    "kind": "property",
			    "kindModifiers": "optional",
			    "labelDetails": undefined,
			    "name": "hideSuggestionsIfLessThan",
			    "replacementSpan": undefined,
			    "sortText": "11",
			    "source": undefined,
			    "sourceDisplay": undefined,
			  },
			]
		`);
		expect(completions?.entries.length).toBe(2);
		expect(completions?.entries.some((e) => e.name === "enableLogs")).toBe(
			true,
		);
	});

	test("native suggestions on nested right side", () => {
		const string = `
		interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		const obj: Options = {} as Options;
		const aaa = { bbb: { obj }}
		aaa.bbb.obj.

		`;
		const index = string.length - 4;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					const obj: Options = {} as Options;
					const aaa = { bbb: { obj }}
					aaa.bbb.obj.|

					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ enableLogs: false },
		);

		expect(completions?.entries).toMatchInlineSnapshot(`
			[
			  {
			    "commitCharacters": undefined,
			    "data": undefined,
			    "filterText": undefined,
			    "hasAction": undefined,
			    "insertText": undefined,
			    "isImportStatementCompletion": undefined,
			    "isPackageJsonImport": undefined,
			    "isRecommended": undefined,
			    "isSnippet": undefined,
			    "kind": "property",
			    "kindModifiers": "optional",
			    "labelDetails": undefined,
			    "name": "enableLogs",
			    "replacementSpan": undefined,
			    "sortText": "11",
			    "source": undefined,
			    "sourceDisplay": undefined,
			  },
			  {
			    "commitCharacters": undefined,
			    "data": undefined,
			    "filterText": undefined,
			    "hasAction": undefined,
			    "insertText": undefined,
			    "isImportStatementCompletion": undefined,
			    "isPackageJsonImport": undefined,
			    "isRecommended": undefined,
			    "isSnippet": undefined,
			    "kind": "property",
			    "kindModifiers": "optional",
			    "labelDetails": undefined,
			    "name": "hideSuggestionsIfLessThan",
			    "replacementSpan": undefined,
			    "sortText": "11",
			    "source": undefined,
			    "sourceDisplay": undefined,
			  },
			]
		`);
		expect(completions?.entries.length).toBe(2);
		expect(completions?.entries.some((e) => e.name === "enableLogs")).toBe(
			true,
		);
	});

	test("native suggestions on nested right side with ; next to it", () => {
		const string = `
		export interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		export const exampleOptions: Options = {} as Options;
		export const nested = {
			inside: { obj: exampleOptions },
			another: { obj: exampleOptions },
		};

		nested.inside.;
		`;
		const index = string.length - 4;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					export interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					export const exampleOptions: Options = {} as Options;
					export const nested = {
						inside: { obj: exampleOptions },
						another: { obj: exampleOptions },
					};

					nested.inside.|;
					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ enableLogs: false },
		);

		expect(completions?.entries.length).toBe(1);
		expect(completions?.entries.some((e) => e.name === "obj")).toBe(true);
	});

	test("filtered suggestions on root of left side", () => {
		const string = `
		interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		const obj: Options = {} as Options;
		obj.e

		`;
		const index = string.length - 6;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					const obj: Options = {} as Options;
					obj|.e

					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ keepKeywords: false, enableLogs: false },
		);

		expect(completions?.entries.length).toBe(2);
		expect(completions?.entries.some((e) => e.name === "enableLogs")).toBe(
			false,
		);
		expect(completions?.entries.some((e) => e.name === "obj")).toBe(true);
	});

	test("native suggestions with ? nested right side", () => {
		const string = `
		export interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		export const exampleOptions: Options = {} as Options;
		export const nested = {
			inside: { obj: exampleOptions },
			another: { obj: exampleOptions },
		};

		nested.inside.obj?.;
		`;
		const index = string.length - 4;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					export interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					export const exampleOptions: Options = {} as Options;
					export const nested = {
						inside: { obj: exampleOptions },
						another: { obj: exampleOptions },
					};

					nested.inside.obj?.|;
					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ enableLogs: false },
		);

		expect(completions?.entries.length).toBe(2);
		expect(completions?.entries.some((e) => e.name === "enableLogs")).toBe(
			true,
		);
		expect(
			completions?.entries.some((e) => e.name === "hideSuggestionsIfLessThan"),
		).toBe(true);
	});

	test("native suggestions with ! nested right side", () => {
		const string = `
		export interface Options {
			enableLogs?: boolean;
			hideSuggestionsIfLessThan?: number;
		}

		export const exampleOptions: Options = {} as Options;
		export const nested = {
			inside: { obj: exampleOptions },
			another: { obj: exampleOptions },
		};

		nested.inside.obj!.;
		`;
		const index = string.length - 4;
		expect(showCaret(string, index)).toMatchInlineSnapshot(`
			"
					export interface Options {
						enableLogs?: boolean;
						hideSuggestionsIfLessThan?: number;
					}

					export const exampleOptions: Options = {} as Options;
					export const nested = {
						inside: { obj: exampleOptions },
						another: { obj: exampleOptions },
					};

					nested.inside.obj!.|;
					"
		`);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{ enableLogs: false },
		);

		expect(completions?.entries.length).toBe(2);
		expect(completions?.entries.some((e) => e.name === "enableLogs")).toBe(
			true,
		);
		expect(
			completions?.entries.some((e) => e.name === "hideSuggestionsIfLessThan"),
		).toBe(true);
	});
});
