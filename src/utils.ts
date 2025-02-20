import type ts from "typescript/lib/tsserverlibrary";
import type { PreferImportFrom } from "./config";

export function keepPreferredSourceOnly(
	preferImportFrom: PreferImportFrom[],
	entries: ts.CompletionEntry[],
) {
	const preferSources = new Map(
		preferImportFrom.map((p) => [p.insteadOf, p.prefer]),
	);

	return entries.filter((entry) => {
		const preferredSource = preferSources.get(entry.source ?? "");
		if (!preferredSource) return true;
		return entries.some(
			(e) => e.name === entry.name && e.source === preferredSource,
		);
	});
}

const wordRegex = /\w/;
export function findWordBoundary(
	content: string,
	_index: number,
	direction: "start" | "end",
): number {
	const isWordChar = (char: string) => wordRegex.test(char);
	let index = _index;

	if (direction === "start") {
		while (index > 0 && isWordChar(content[index - 1])) {
			index--;
		}
	} else if (direction === "end") {
		while (index < content.length && isWordChar(content[index])) {
			index++;
		}
	}

	return index;
}

export function caretInImportSection(
	content: string,
	caretIndex: number,
): "brackets" | "from" | "none" {
	const beforeCaret = content.slice(0, caretIndex);
	const afterCaret = content.slice(caretIndex);

	const importIndex = beforeCaret.lastIndexOf("import");
	const openBracketIndex = beforeCaret.lastIndexOf("{");
	const closeBracketIndex = afterCaret.indexOf("}");
	const fromIndex = beforeCaret.lastIndexOf("from");
	const hasFrom = /from\s['"]/.test(afterCaret);

	if (importIndex === -1) return "none";

	if (
		openBracketIndex !== -1 &&
		closeBracketIndex !== -1 &&
		importIndex < openBracketIndex &&
		caretIndex > openBracketIndex &&
		caretIndex <= openBracketIndex + closeBracketIndex + 1
	) {
		return "brackets";
	}

	if (
		fromIndex !== -1 &&
		fromIndex > openBracketIndex &&
		hasFrom &&
		caretIndex > fromIndex
	) {
		return "from";
	}

	return "none";
}
