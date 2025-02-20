import type ts from "typescript";
import type { PreferImportFrom } from "./config";

export function keepPreferredSourceOnly(
	preferImportFrom: PreferImportFrom[],
	entries: ts.CompletionEntry[],
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
	for (const [name, suggestions] of Object.entries(grouped)) {
		const preferred = suggestions.find(
			(entry) =>
				entry.source &&
				preferenceMap.has(entry.source) &&
				suggestions.some((s) => s.source === preferenceMap.get(entry.source!)),
		);
		result.push(preferred || suggestions[0]);
	}

	return result;
}
