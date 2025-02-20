import type ts from "typescript/lib/tsserverlibrary";
import type { IntellisensePluginConfig } from "./config";

export const filterSuggestions = (
	wordAtCaret: string,
	entries: ts.CompletionEntry[],
	config: Required<IntellisensePluginConfig>,
) => {
	const lowercased = wordAtCaret.toLowerCase();
	const shouldFilterWithStartWith =
		wordAtCaret.length <= config.shouldFilterWithStartIfLessThan;
	const shouldFilterWithIncludes =
		wordAtCaret.length <= config.shouldFilterWithIncludesIfLessThan;

	return entries.filter((entry) => {
		if (entry.kind === "keyword") return config.keepKeywords;

		// Ignore unrelevant globals
		if (
			config.excludeUnrelevantGlobals &&
			entry.kindModifiers === "declare" &&
			!entry.source &&
			!config.includedGlobals.includes(entry.name) &&
			(entry.kind === "var" ||
				entry.kind === "alias" ||
				entry.kind === "function" ||
				entry.kind === "const" ||
				entry.kind === "module")
		) {
			return false;
		}

		if (
			config.excludeDeprecated &&
			entry.kindModifiers?.includes("deprecated")
		) {
			return false;
		}

		if (
			config.excludeSourceIncluding?.some((pattern) =>
				entry.source?.includes(pattern),
			)
		) {
			return false;
		}

		// Super short words need to be at least start with the suggestions
		// console.log(entry.name.startsWith(lowercased));
		if (shouldFilterWithStartWith && !entry.name.startsWith(lowercased)) {
			return false;
		}

		// Short words needs to at least be included in the suggestions
		if (shouldFilterWithIncludes && !entry.name.includes(lowercased)) {
			return false;
		}

		return true;
	});
};
