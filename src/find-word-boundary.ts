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

export const findWordAt = (content: string, index: number) => {
	return content.slice(
		findWordBoundary(content, index, "start"),
		findWordBoundary(content, index, "end"),
	);
};
