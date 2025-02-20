import type ts from "typescript/lib/tsserverlibrary";
import { expect, test } from "vitest";
import { resolvePluginConfig } from "../src/config";
import { filterSuggestions } from "../src/filter-suggestions";
import entries from "./entries-mock-empty-word-at-caret";

const printSugggestions = (entries: ts.CompletionEntry[]) =>
	entries.map((entry) => ({
		name: entry.name,
		source: entry.source,
		kind: entry.kind,
		kindModifiers: entry.kindModifiers,
	}));

test("keep keywords - false", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			includedGlobals: [],
		}),
	);
	expect(suggestions.some((entry) => entry.kind === "keyword")).toBe(false);
	expect(printSugggestions(suggestions)).toMatchInlineSnapshot(`
		[
		  {
		    "kind": "alias",
		    "kindModifiers": "abstract,export",
		    "name": "EntityBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "TestEntitiesFactory",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "User",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "class",
		    "kindModifiers": "export",
		    "name": "UserBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "module",
		    "kindModifiers": "",
		    "name": "globalThis",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "",
		    "name": "undefined",
		    "source": undefined,
		  },
		  {
		    "kind": "property",
		    "kindModifiers": "declare",
		    "name": "allowedNodeEnvironmentFlags",
		    "source": "node:process",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "BackendEnvConfig",
		    "source": "../../config.ts",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EFSAuthorizationConfigIAM",
		    "source": "@aws-sdk/client-batch",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "ERROR_FLAG",
		    "source": "../../accounting/services/ingestion-plan-reporter/xlsIngestionPlanReporter.ts",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfig",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthScheme",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthSchemeType",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigHeader",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "GetBucketEncryptionOutputFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "InventoryEncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystem",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystemVersion",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "PutBucketEncryptionRequestFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "SelectObjectContentEventStreamFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionByDefaultFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionConfigurationFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionRuleFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		]
	`);
});

test("keep keywords - true", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: true,
			includedGlobals: [],
		}),
	);
	expect(suggestions.some((entry) => entry.kind === "keyword")).toBe(true);
	expect(printSugggestions(suggestions)).toMatchInlineSnapshot(`
		[
		  {
		    "kind": "alias",
		    "kindModifiers": "abstract,export",
		    "name": "EntityBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "TestEntitiesFactory",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "User",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "class",
		    "kindModifiers": "export",
		    "name": "UserBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "abstract",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "any",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "as",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "asserts",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "async",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "await",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "bigint",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "boolean",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "break",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "case",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "catch",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "class",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "const",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "continue",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "debugger",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "declare",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "default",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "delete",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "do",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "else",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "enum",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "export",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "extends",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "false",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "finally",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "for",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "function",
		    "source": undefined,
		  },
		  {
		    "kind": "module",
		    "kindModifiers": "",
		    "name": "globalThis",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "if",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "implements",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "import",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "in",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "infer",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "instanceof",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "interface",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "keyof",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "let",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "module",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "namespace",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "never",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "new",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "null",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "number",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "object",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "package",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "readonly",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "return",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "satisfies",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "string",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "super",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "switch",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "symbol",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "this",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "throw",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "true",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "try",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "type",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "typeof",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "",
		    "name": "undefined",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "unique",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "unknown",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "using",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "var",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "void",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "while",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "with",
		    "source": undefined,
		  },
		  {
		    "kind": "keyword",
		    "kindModifiers": "",
		    "name": "yield",
		    "source": undefined,
		  },
		  {
		    "kind": "property",
		    "kindModifiers": "declare",
		    "name": "allowedNodeEnvironmentFlags",
		    "source": "node:process",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "BackendEnvConfig",
		    "source": "../../config.ts",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EFSAuthorizationConfigIAM",
		    "source": "@aws-sdk/client-batch",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "ERROR_FLAG",
		    "source": "../../accounting/services/ingestion-plan-reporter/xlsIngestionPlanReporter.ts",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfig",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthScheme",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthSchemeType",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigHeader",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "GetBucketEncryptionOutputFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "InventoryEncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystem",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystemVersion",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "PutBucketEncryptionRequestFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "SelectObjectContentEventStreamFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionByDefaultFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionConfigurationFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionRuleFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		]
	`);
});

test("includedGlobals - using defaults", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
		}),
	);
	expect(suggestions.some((entry) => entry.name === "Array")).toBe(true);
	expect(printSugggestions(suggestions)).toMatchInlineSnapshot(`
		[
		  {
		    "kind": "alias",
		    "kindModifiers": "abstract,export",
		    "name": "EntityBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "TestEntitiesFactory",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "User",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "class",
		    "kindModifiers": "export",
		    "name": "UserBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "__dirname",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "__filename",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "AbortController",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "AbortSignal",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "alert",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "BigInt64Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "BigUint64Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Blob",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Boolean",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "cancelAnimationFrame",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "cancelIdleCallback",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "confirm",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "console",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "CSSRule",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "CSSRuleList",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "CSSStyleSheet",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Date",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "document",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Error",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "fetch",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "FileList",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "FileReader",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Float32Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Float64Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "FormData",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Function",
		    "source": undefined,
		  },
		  {
		    "kind": "module",
		    "kindModifiers": "",
		    "name": "globalThis",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Headers",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "history",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "HTMLElement",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Int8Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Int16Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Int32Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "location",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Map",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "navigator",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Number",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Object",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "print",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "prompt",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "RegExp",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Request",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "requestAnimationFrame",
		    "source": undefined,
		  },
		  {
		    "kind": "function",
		    "kindModifiers": "declare",
		    "name": "requestIdleCallback",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Response",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "screen",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Set",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "String",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Symbol",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Uint8Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Uint8ClampedArray",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Uint16Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "Uint32Array",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "",
		    "name": "undefined",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "URL",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "URLSearchParams",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "WeakMap",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "WeakSet",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "declare",
		    "name": "window",
		    "source": undefined,
		  },
		  {
		    "kind": "property",
		    "kindModifiers": "declare",
		    "name": "allowedNodeEnvironmentFlags",
		    "source": "node:process",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "BackendEnvConfig",
		    "source": "../../config.ts",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EFSAuthorizationConfigIAM",
		    "source": "@aws-sdk/client-batch",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "ERROR_FLAG",
		    "source": "../../accounting/services/ingestion-plan-reporter/xlsIngestionPlanReporter.ts",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfig",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthScheme",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthSchemeType",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigHeader",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "GetBucketEncryptionOutputFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "InventoryEncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystem",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystemVersion",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "PutBucketEncryptionRequestFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "SelectObjectContentEventStreamFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionByDefaultFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionConfigurationFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionRuleFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		]
	`);
});

test("includedGlobals - empty", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			includedGlobals: [],
		}),
	);
	expect(suggestions.some((entry) => entry.name === "Array")).toBe(false);
	expect(printSugggestions(suggestions)).toMatchInlineSnapshot(`
		[
		  {
		    "kind": "alias",
		    "kindModifiers": "abstract,export",
		    "name": "EntityBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "TestEntitiesFactory",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "export",
		    "name": "User",
		    "source": "TypeOnlyAlias/",
		  },
		  {
		    "kind": "class",
		    "kindModifiers": "export",
		    "name": "UserBuilder",
		    "source": undefined,
		  },
		  {
		    "kind": "module",
		    "kindModifiers": "",
		    "name": "globalThis",
		    "source": undefined,
		  },
		  {
		    "kind": "var",
		    "kindModifiers": "",
		    "name": "undefined",
		    "source": undefined,
		  },
		  {
		    "kind": "property",
		    "kindModifiers": "declare",
		    "name": "allowedNodeEnvironmentFlags",
		    "source": "node:process",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "BackendEnvConfig",
		    "source": "../../config.ts",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EFSAuthorizationConfigIAM",
		    "source": "@aws-sdk/client-batch",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "EncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export",
		    "name": "ERROR_FLAG",
		    "source": "../../accounting/services/ingestion-plan-reporter/xlsIngestionPlanReporter.ts",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfig",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthScheme",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigAuthSchemeType",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "EventHookChannelConfigHeader",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "GetBucketEncryptionOutputFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "InventoryEncryptionFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystem",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "alias",
		    "kindModifiers": "declare",
		    "name": "PlatformConditionEvaluatorPlatformOperatingSystemVersion",
		    "source": "@okta/okta-sdk-nodejs",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "PutBucketEncryptionRequestFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "SelectObjectContentEventStreamFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionByDefaultFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionConfigurationFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		  {
		    "kind": "const",
		    "kindModifiers": "export,declare",
		    "name": "ServerSideEncryptionRuleFilterSensitiveLog",
		    "source": "@aws-sdk/client-s3",
		  },
		]
	`);
});

test("excludeUnrelevantGlobals - false", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeUnrelevantGlobals: false,
		}),
	);
	expect(suggestions.some((entry) => entry.name === "AnimationEvent")).toBe(
		true,
	);

	const suggestionsWhenDisabled = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeUnrelevantGlobals: true,
		}),
	);
	expect(
		suggestionsWhenDisabled.some((entry) => entry.name === "AnimationEvent"),
	).toBe(false);

	expect(suggestions.length > suggestionsWhenDisabled.length).toBe(true);
});

test("excludeDeprecated - false", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeDeprecated: false,
		}),
	);
	expect(
		suggestions.some((entry) => entry.name === "AudioProcessingEvent"),
	).toBe(true);

	const suggestionsWhenDisabled = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeDeprecated: true,
		}),
	);
	expect(
		suggestionsWhenDisabled.some(
			(entry) => entry.name === "AudioProcessingEvent",
		),
	).toBe(false);

	expect(suggestions.length > suggestionsWhenDisabled.length).toBe(true);
});

test("excludeSourceIncluding - empty", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeSourceIncluding: [],
		}),
	);
	expect(suggestions.some((entry) => entry.name === "escapeFragment")).toBe(
		true,
	);

	const suggestionsWhenDisabled = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
		}),
	);
	expect(
		suggestionsWhenDisabled.some((entry) => entry.name === "escapeFragment"),
	).toBe(false);

	expect(suggestions.length > suggestionsWhenDisabled.length).toBe(true);
});

test("excludeSourceIncluding - node:", () => {
	const suggestions = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeSourceIncluding: ["node:"],
		}),
	);
	expect(suggestions.some((entry) => entry.source?.includes("node:"))).toBe(
		false,
	);

	const suggestionsWhenDisabled = filterSuggestions(
		"",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			excludeSourceIncluding: [],
		}),
	);
	expect(
		suggestionsWhenDisabled.some((entry) => entry.source?.includes("node:")),
	).toBe(true);

	expect(suggestions.length < suggestionsWhenDisabled.length).toBe(true);
});

test("shouldStartWithIfLessThan - 100 (always)", () => {
	const suggestions = filterSuggestions(
		"us",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 100,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestions.every((entry) => entry.name.toLowerCase().startsWith("us")),
	).toBe(true);
	expect(
		suggestions.some((entry) => entry.name === "EncryptionFilterSensitiveLog"),
	).toBe(false);

	const suggestionsWhenDisabled = filterSuggestions(
		"us",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 0,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestionsWhenDisabled.some(
			(entry) => entry.name === "EncryptionFilterSensitiveLog",
		),
	).toBe(true);

	expect(suggestions.length < suggestionsWhenDisabled.length).toBe(true);
});

test("shouldStartWithIfLessThan - 100 (always) - longer word", () => {
	const suggestions = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 100,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestions.every((entry) => entry.name.toLowerCase().startsWith("entit")),
	).toBe(true);
	expect(
		suggestions.some((entry) => entry.name === "TestEntitiesFactory"),
	).toBe(false);

	const suggestionsWhenDisabled = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 0,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestionsWhenDisabled.some(
			(entry) => entry.name === "TestEntitiesFactory",
		),
	).toBe(true);

	expect(suggestions.length < suggestionsWhenDisabled.length).toBe(true);
});

test("shouldFilterWithIncludesIfLessThan - 100 (always)", () => {
	const suggestions = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 100,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestions.every((entry) => entry.name.toLowerCase().startsWith("entit")),
	).toBe(true);
	expect(
		suggestions.some((entry) => entry.name === "TestEntitiesFactory"),
	).toBe(false);
	expect(suggestions.some((entry) => entry.name === "addEventListener")).toBe(
		false,
	);

	const suggestionsWhenDisabled = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 0,
			shouldFilterWithIncludesIfLessThan: 0,
		}),
	);
	expect(
		suggestionsWhenDisabled.some(
			(entry) => entry.name === "TestEntitiesFactory",
		),
	).toBe(true);

	expect(suggestions.length < suggestionsWhenDisabled.length).toBe(true);
});

test("shouldStartWithIfLessThan - 100 (always) - longer word - sort-last", () => {
	const suggestions = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 100,
			shouldFilterWithIncludesIfLessThan: 0,
			filterMode: "sort-last",
		}),
	);
	expect(
		suggestions.every((entry) => entry.name.toLowerCase().startsWith("entit")),
	).toBe(false);
	expect(
		suggestions.some((entry) => entry.name === "TestEntitiesFactory"),
	).toBe(true);

	const suggestionsWhenDisabled = filterSuggestions(
		"entit",
		entries,
		resolvePluginConfig({
			keepKeywords: false,
			shouldFilterWithStartWithIfLessThan: 0,
			shouldFilterWithIncludesIfLessThan: 0,
			filterMode: "exclude",
		}),
	);
	expect(
		suggestionsWhenDisabled.some(
			(entry) => entry.name === "TestEntitiesFactory",
		),
	).toBe(true);

	expect(suggestions.length < suggestionsWhenDisabled.length).toBe(false);
});
