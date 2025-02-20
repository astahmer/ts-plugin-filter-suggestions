export interface PreferImportFrom {
	prefer: string;
	insteadOf: string;
}

export interface IntellisensePluginConfig {
	keepKeywords?: boolean;
	hideSuggestionsIfLessThan?: number;
	hideCompletionsForModuleExportsIfLessThan?: number;
	preferImportFrom?: PreferImportFrom[];
	filterIfLessThan?: number;
	filterIfMoreThanEntries?: number;
	excludeSourceIncluding?: string[];
	excludeDeprecated?: boolean;
	excludeUnrelevantGlobals?: boolean;
	includedGlobals?: string[];
	shouldFilterWithStartIfLessThan?: number;
	shouldFilterWithIncludesIfLessThan?: number;
}

export const resolvePluginConfig = (config: IntellisensePluginConfig) => {
	const {
		keepKeywords = true,
		hideSuggestionsIfLessThan = 1,
		hideCompletionsForModuleExportsIfLessThan = 2,
		shouldFilterWithStartIfLessThan = 3,
		filterIfLessThan = 4,
		filterIfMoreThanEntries = 12, // 12 is the number of suggestions visible in the hover tooltip before scrolling
		preferImportFrom = [],
		excludeSourceIncluding = ["/dist/", "/build/", "/src/"],
		excludeDeprecated = true,
		excludeUnrelevantGlobals = true,
		includedGlobals = defaultIncludedGlobals,
		shouldFilterWithIncludesIfLessThan = 100, // = always
	} = config;

	return {
		keepKeywords,
		hideSuggestionsIfLessThan,
		hideCompletionsForModuleExportsIfLessThan,
		shouldFilterWithStartIfLessThan,
		filterIfLessThan,
		filterIfMoreThanEntries,
		preferImportFrom,
		excludeSourceIncluding,
		excludeDeprecated,
		excludeUnrelevantGlobals,
		includedGlobals,
		shouldFilterWithIncludesIfLessThan,
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
