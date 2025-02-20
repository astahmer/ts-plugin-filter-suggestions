import * as ts from "typescript/lib/tsserverlibrary";
import { describe, expect, it } from "vitest";
import type { IntellisensePluginConfig } from "../src/config";
import plugin from "../src/index";

function getDefaultCompilerOptions(tsModule: typeof ts) {
	const defaultCompilerOptions: ts.CompilerOptions = {
		lib: ["lib.dom.d.ts", "lib.es2017.d.ts", "ESNext", "DOM"],
		types: ["node"],
		target: tsModule.ScriptTarget.Latest,
		moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
		module: tsModule.ModuleKind.CommonJS,
		jsx: tsModule.JsxEmit.Preserve,
	};

	return defaultCompilerOptions;
}

function getLanguageService(
	tsModule: typeof ts,
	sourceCode: string,
	options?: ts.CompilerOptions,
) {
	const defaultCompilerOptions = getDefaultCompilerOptions(tsModule);
	const compilerOptions = { ...defaultCompilerOptions, ...options };
	// const program = tsModule.createProgram(['mockFile.ts'], compilerOptions);

	const registry = tsModule.createDocumentRegistry(true);
	const host: ts.LanguageServiceHost = {
		getScriptSnapshot: () => ts.ScriptSnapshot.fromString(sourceCode),
		getCompilationSettings: () => compilerOptions,
		getCurrentDirectory: () => "/",
		getScriptFileNames: () => ["mockFile.ts"],
		getScriptVersion: () => "1",
		fileExists: () => true,
		readFile: () => sourceCode,
		directoryExists: () => true,
		getDirectories: () => [],
		getDefaultLibFileName: () => "lib.d.ts",
	};
	const languageService = tsModule.createLanguageService(host, registry);
	return languageService;
}

function getCompletions(
	{ sourceCode, position }: { sourceCode: string; position: number },
	options?: IntellisensePluginConfig,
) {
	const sourceFile = ts.createSourceFile(
		"mockFile.ts",
		sourceCode,
		ts.ScriptTarget.ESNext,
	);
	const originalLanguageService = getLanguageService(ts, sourceCode);
	const patchedLanguageService = {
		...originalLanguageService,
		// @ts-expect-error
		getProgram: () => ({ getSourceFile: () => sourceFile }) as ts.Program,
		// getCompletionsAtPosition: (fileName: string, position: number, options: any) => {
		//     console.log(1, fileName, position, options);
		//     return {
		//         entries: [],
		//         isGlobalCompletion: false,
		//         isMemberCompletion: false,
		//         isIncomplete: true,
		//     };
		// },
	};

	const pluginInfo: ts.server.PluginCreateInfo = {
		languageService: patchedLanguageService,
		languageServiceHost: {
			getDefaultLibFileName: () => "lib.d.ts",
			getScriptSnapshot: () => ts.ScriptSnapshot.fromString(sourceCode),
			getCompilationSettings: () => ({}),
			getCurrentDirectory: () => "/",
			getScriptFileNames: () => ["mockFile.ts"],
			getScriptVersion: () => "1",
			fileExists: () => true,
			readFile: () => sourceCode,
			directoryExists: () => true,
			getDirectories: () => [],
		},
		serverHost: {} as any,
		project: undefined as any,
		config: options ?? {},
	};

	const pluginModule = plugin({ typescript: ts });
	const pluginLanguageService = pluginModule.create(pluginInfo);

	return pluginLanguageService.getCompletionsAtPosition(
		"mockFile.ts",
		position,
		undefined,
	);
}

describe("ts-plugin-filter-suggestions", () => {
	it("should suggest symbols from current file if less than 5 characters", () => {
		const string = "const abcdef = 123;\nconsole.log(abcd)";
		const index = 36;
		expect(
			string.slice(0, index) + "|" + string.slice(index),
		).toMatchInlineSnapshot(`
          "const abcdef = 123;
          console.log(abcd|)"
        `);

		const completions = getCompletions(
			{ sourceCode: string, position: index },
			{
				// filterIfLessThan: 0,
			},
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
			    "sortText": "15",
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
		// expect(completions?.entries).toHaveLength(0);
		// expect(completions?.entries.find((e) => e.name === 'abcdef')).toBeDefined();
	});
});
