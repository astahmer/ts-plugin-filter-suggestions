import type ts from "typescript/lib/tsserverlibrary";
import type { IntellisensePluginConfig } from "./config";

const isDebug = false;
const searched = "abcde";

export const filterSuggestions = (
	wordAtCaret: string,
	entries: ts.CompletionEntry[],
	config: Required<IntellisensePluginConfig>,
) => {
	const lowercased = wordAtCaret.toLowerCase();
	const shouldFilterWithStartWith =
		wordAtCaret.length <= config.shouldFilterWithStartWithIfLessThan;
	const shouldFilterWithIncludes =
		wordAtCaret.length <= config.shouldFilterWithIncludesIfLessThan;

	const shouldExclude = config.filterMode === "exclude";
	const excludeOrSortLast = (
		entry: ts.CompletionEntry,
		conditional: boolean,
	) => {
		if (shouldExclude) return conditional;

		if (!conditional) {
			entry.sortText = entry.sortText + "1";
		}

		return true;
	};

	return entries.filter((entry) => {
		if (entry.kind === "keyword") {
			isDebug && entry.name.includes(searched) && console.log(1);
			return excludeOrSortLast(entry, config.keepKeywords);
		}

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
			isDebug && entry.name.includes(searched) && console.log(2);
			return excludeOrSortLast(entry, false);
		}

		if (
			config.excludeDeprecated &&
			entry.kindModifiers?.includes("deprecated")
		) {
			isDebug && entry.name.includes(searched) && console.log(3);
			return excludeOrSortLast(entry, false);
		}

		if (
			config.excludeSourceIncluding?.some((pattern) =>
				entry.source?.includes(pattern),
			)
		) {
			isDebug && entry.name.includes(searched) && console.log(4);
			return excludeOrSortLast(entry, false);
		}

		const lowercaseEntryName = entry.name.toLowerCase();

		// Super short words need to be at least start with the suggestions
		if (
			shouldFilterWithStartWith &&
			!lowercaseEntryName.startsWith(lowercased)
		) {
			isDebug && entry.name.includes(searched) && console.log(5);
			return excludeOrSortLast(entry, false);
		}

		// Short words needs to at least be included in the suggestions
		if (shouldFilterWithIncludes && !lowercaseEntryName.includes(lowercased)) {
			isDebug &&
				entry.name.includes(searched) &&
				console.log(6, { lowercaseEntryName, lowercased });
			return excludeOrSortLast(entry, false);
		}

		isDebug && entry.name.includes(searched) && console.log(7);

		return true;
	});
};
