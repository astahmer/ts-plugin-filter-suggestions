export interface PreferImportFrom {
	prefer: string;
	insteadOf: string;
}

export interface IntellisensePluginConfig {
	/**
	 * Should we always keep keywords ?
	 * @default true
	 */
	keepKeywords?: boolean;
	/**
	 * Will prevent ANY suggestions from showing if current word (found on the caret position) has <= X characters
	 * @default 1
	 */
	hideSuggestionsIfLessThan?: number;
	/**
	 * Maps to `ts.GetCompletionsAtPositionOptions.includeCompletionsForModuleExports` to true if current word (found on the caret position) has <= X characters
	 * @default 2
	 * @see https://github.com/typescript-language-server/typescript-language-server/blob/184c60de3308621380469d6632bdff2e10f672fd/docs/configuration.md
	 */
	hideCompletionsForModuleExportsIfLessThan?: number;
	/**
	 * Maps to `ts.GetCompletionsAtPositionOptions.useLabelDetailsInCompletionEntries` to true if current word (found on the caret position) has <= X characters
	 * @default 100 // = enabled by default
	 * @see https://github.com/typescript-language-server/typescript-language-server/blob/184c60de3308621380469d6632bdff2e10f672fd/docs/configuration.md#:~:text=useLabelDetailsInCompletionEntries%20%5Bboolean%5D%20Indicates,Default%3A%20true
	 */
	useLabelDetailsInCompletionEntriesIfLessThan?: boolean;
	/**
	 * Removes (or move to the bottom) duplicated suggestions (same name, different source) from the completion list
	 * @example
	 * // You're typing `read|` and the suggestions are:
	 * - `readFile` from `node:fs`
	 * - `readFile` from `node:fs/promises`
	 *
	 * // with this option set to [{ prefer: "node:fs/promises", insteadOf: "node:fs" }] the suggestion `readFile` from `node:fs` will be removed
	 * // so that only the `readFile` from `node:fs/promises` will be shown
	 *
	 * @default []
	 */
	preferImportFrom?: PreferImportFrom[];
	/**
	 * Allows to either completely remove duplicated suggestions (same name, different source) or move them last
	 * @default "exclude"
	 */
	preferImportFromMode?: "exclude" | "sort-last";
	/**
	 * Allows to either completely remove filtered suggestions or move them last
	 * @default "exclude"
	 */
	filterMode?: "exclude" | "sort-last";
	/**
	 * Filter suggestions if the current word (found on the caret position) has <= X characters
	 * @default 4
	 */
	filterIfLessThan?: number;
	/**
	 * Filter suggestions only if the number of suggestions is >= X
	 * @default 12
	 */
	filterIfMoreThanEntries?: number;
	/**
	 * Exclude suggestions from the completion list if the source contains any of the following strings
	 *
	 * @example
	 * ```
	 * excludeSourceIncluding: ["/dist/", "/build/", "/src/", "/fp/"]
	 * ```
	 *
	 * will exclude suggestions from the completion list such as:
	 * - import { flushAddSourceMiddleware } from '@segment/analytics-next/dist/types/core/buffer';
	 * - import { startOfSecond } from 'date-fns/fp/startOfSecond';
	 * - import { zodResolver } from '@hookform/resolvers/zod/src/zod.js';
	 * - import { A } from 'vitest/dist/chunks/environment.LoooBwUu.js';
	 * - import Ajv from 'ajv/dist/core';
	 *
	 * @default []
	 */
	excludeSourceIncluding?: string[];
	/**
	 * Anything marked as `@deprecated` will be excluded from the completion list
	 * @default true
	 */
	excludeDeprecated?: boolean;
	/**
	 * Exclude globals that are not relevant for the current file
	 *
	 * a global is identified with `entry.kindModifier === declare && kind === declarations|var|alias|function|const|module`
	 * @default true
	 */
	excludeUnrelevantGlobals?: boolean;
	/**
	 * Globals that SHOULD BE included (exceptions of `excludeUnrelevantGlobals`) in the completion list
	 * @default ["Boolean", "Number", "String", "Symbol", "Object", "Function", "Array", "Date", "Error", "RegExp", "Map", "Set", "WeakMap", "WeakSet", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array", "console", "window", "document", "navigator", "history", "location", "screen", "alert", "confirm", "prompt", "print", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "fetch", "Headers", "Request", "Response", "FormData", "FileReader", "FileList", "Blob", "URL", "URLSearchParams", "HTMLElement", "CSSStyleSheet", "CSSRule", "CSSRuleList", "AbortSignal", "AbortController", "__dirname", "__filename", "Blob"]`
	 */
	includedGlobals?: string[];
	/**
	 * Filter suggestions using `suggestion.name.toLowerCase().startsWith(currentWord.toLowerCase())` if the current word (found on the caret position) has <= X characters
	 * @default 3
	 */
	shouldFilterWithStartWithIfLessThan?: number;
	/**
	 * Filter suggestions using `suggestion.name.toLowerCase().includes(currentWord.toLowerCase())` if the current word (found on the caret position) has <= X characters
	 * @default 100 // = always
	 */
	shouldFilterWithIncludesIfLessThan?: number;
	/**
	 * Enables logs
	 * @default false
	 */
	enableLogs?: boolean | "info" | "debug";
}

export const resolvePluginConfig = (config: IntellisensePluginConfig) => {
	const {
		keepKeywords = true,
		hideSuggestionsIfLessThan = 1,
		hideCompletionsForModuleExportsIfLessThan = 2,
		useLabelDetailsInCompletionEntriesIfLessThan = 100, // = always
		shouldFilterWithStartWithIfLessThan = 3,
		filterIfLessThan = 4,
		filterIfMoreThanEntries = 12, // 12 is the number of suggestions visible in the hover tooltip before scrolling
		preferImportFrom = [],
		preferImportFromMode = "exclude",
		filterMode = "exclude",
		excludeSourceIncluding = ["/dist/", "/build/", "/src/"],
		excludeDeprecated = true,
		excludeUnrelevantGlobals = true,
		includedGlobals = defaultIncludedGlobals,
		shouldFilterWithIncludesIfLessThan = 100, // = always
		enableLogs = false,
	} = config;

	return {
		keepKeywords,
		hideSuggestionsIfLessThan,
		hideCompletionsForModuleExportsIfLessThan,
		useLabelDetailsInCompletionEntriesIfLessThan,
		shouldFilterWithStartWithIfLessThan,
		filterIfLessThan,
		filterIfMoreThanEntries,
		preferImportFrom,
		preferImportFromMode,
		filterMode,
		excludeSourceIncluding,
		excludeDeprecated,
		excludeUnrelevantGlobals,
		includedGlobals,
		shouldFilterWithIncludesIfLessThan,
		enableLogs,
	} as Required<IntellisensePluginConfig>;
};

const defaultIncludedGlobals = [
	"Boolean",
	"Number",
	"String",
	"Symbol",
	"Object",
	"Function",
	"Array",
	"Date",
	"Error",
	"RegExp",
	"Map",
	"Set",
	"WeakMap",
	"WeakSet",
	"Int8Array",
	"Uint8Array",
	"Uint8ClampedArray",
	"Int16Array",
	"Uint16Array",
	"Int32Array",
	"Uint32Array",
	"Float32Array",
	"Float64Array",
	"BigInt64Array",
	"BigUint64Array",
	"console",
	"window",
	"document",
	"navigator",
	"history",
	"location",
	"screen",
	"alert",
	"confirm",
	"prompt",
	"print",
	"requestAnimationFrame",
	"cancelAnimationFrame",
	"requestIdleCallback",
	"cancelIdleCallback",
	"fetch",
	"Headers",
	"Request",
	"Response",
	"FormData",
	"FileReader",
	"FileList",
	"Blob",
	"URL",
	"URLSearchParams",
	"HTMLElement",
	"CSSStyleSheet",
	"CSSRule",
	"CSSRuleList",
	"AbortSignal",
	"AbortController",
	"__dirname",
	"__filename",
	"Blob",
	//
	// "React",
];
