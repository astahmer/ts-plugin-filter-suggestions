export function caretInImportSection(
	content: string,
	caretIndex: number,
): "brackets" | "from" | "none" {
	let inBrackets = false,
		inQuotes = false,
		quoteChar = "",
		afterFrom = false;

	for (let i = 0; i < content.length; i++) {
		const char = content[i];

		if (i === caretIndex) {
			if (inBrackets) return "brackets";
			if (afterFrom && inQuotes) return "from";
			return "none";
		}

		if (char === "{" && !inQuotes) inBrackets = true;
		if (char === "}" && !inQuotes) inBrackets = false;

		if (!afterFrom && content.slice(i, i + 4) === "from" && !inQuotes) {
			afterFrom = true;
			i += 3; // Jump past 'from'
		}

		if ((char === "'" || char === '"') && !inBrackets) {
			if (inQuotes && quoteChar === char) inQuotes = false;
			else if (!inQuotes) {
				inQuotes = true;
				quoteChar = char;
			}
		}
	}

	return "none";
}
