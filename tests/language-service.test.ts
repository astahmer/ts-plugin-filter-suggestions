import * as ts from "typescript/lib/tsserverlibrary";
import { describe, expect, it } from "vitest";
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

describe("language-service", () => {
	it.only("should suggest symbols from current file if less than 5 characters", () => {
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
			    "kind": "const",
			    "kindModifiers": "",
			    "labelDetails": undefined,
			    "name": "abcdef",
			    "replacementSpan": undefined,
			    "sortText": "11",
			    "source": undefined,
			    "sourceDisplay": undefined,
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "abstract",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "any",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "as",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "asserts",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "async",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "await",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "bigint",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "boolean",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "break",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "case",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "catch",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "class",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "const",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "continue",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "debugger",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "declare",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "default",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "delete",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "do",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "else",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "enum",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "export",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "extends",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "false",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "finally",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "for",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "function",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "if",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "implements",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "import",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "in",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "infer",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "instanceof",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "interface",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "keyof",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "let",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "module",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "namespace",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "never",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "new",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "null",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "number",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "object",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "package",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "readonly",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "return",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "satisfies",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "string",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "super",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "switch",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "symbol",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "this",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "throw",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "true",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "try",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "type",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "typeof",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "unique",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "unknown",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "using",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "var",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "void",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "while",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "with",
			    "sortText": "15",
			  },
			  {
			    "kind": "keyword",
			    "kindModifiers": "",
			    "name": "yield",
			    "sortText": "15",
			  },
			]
		`);
		expect(completions?.entries.some((e) => e.name === "abcdef")).toBe(true);
	});
});
