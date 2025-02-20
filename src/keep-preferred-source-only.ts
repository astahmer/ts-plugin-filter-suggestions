import type ts from "typescript";
import type { PreferImportFrom } from "./config";

export function keepPreferredSourceOnly(
	preferImportFrom: PreferImportFrom[],
	entries: ts.CompletionEntry[],
	preferMode: "exclude" | "sort-last" = "exclude",
) {
	const preferenceMap = new Map(
		preferImportFrom.map((p) => [p.prefer, p.insteadOf]),
	);

	const grouped = entries.reduce(
		(acc, entry) => {
			acc[entry.name] = acc[entry.name] || [];
			acc[entry.name].push(entry);
			return acc;
		},
		{} as Record<string, ts.CompletionEntry[]>,
	);

	let result: ts.CompletionEntry[] = [];
	for (const [_name, suggestions] of Object.entries(grouped)) {
		if (preferMode === "exclude") {
			const preferred = suggestions.find(
				(entry) =>
					entry.source &&
					preferenceMap.has(entry.source) &&
					suggestions.some(
						(s) => s.source === preferenceMap.get(entry.source!),
					),
			);
			result.push(preferred || suggestions[0]);
		} else if (preferMode === "sort-last") {
			const preferred: ts.CompletionEntry[] = [];
			const insteadOf: ts.CompletionEntry[] = [];
			suggestions.forEach((suggestion) => {
				if (
					suggestion.source &&
					preferenceMap.has(suggestion.source) &&
					suggestions.some(
						(s) => s.source === preferenceMap.get(suggestion.source!),
					)
				) {
					preferred.push(suggestion);
				} else {
					insteadOf.push(suggestion);
				}
			});

			result.push(...preferred, ...insteadOf);
		}
	}

	return result;
}
