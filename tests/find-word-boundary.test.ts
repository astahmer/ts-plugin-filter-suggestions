import { test, expect } from "vitest";
import { findWordBoundary, findWordAt } from "../src/find-word-boundary";

function showCaret(text: string, index: number): string {
	return text.slice(0, index) + "|" + text.slice(index);
}

test("findWordBoundary", () => {
	// Test finding start boundary
	const simpleText = "hello world";
	expect(showCaret(simpleText, 2)).toMatchInlineSnapshot('"he|llo world"');
	expect(findWordBoundary(simpleText, 2, "start")).toBe(0);

	expect(showCaret(simpleText, 5)).toMatchInlineSnapshot('"hello| world"');
	expect(findWordBoundary(simpleText, 5, "start")).toBe(0);

	const textWithUnderscore = "hello_world";
	expect(showCaret(textWithUnderscore, 7)).toMatchInlineSnapshot(
		'"hello_w|orld"',
	);
	expect(findWordBoundary(textWithUnderscore, 7, "start")).toBe(0);

	const textWithSpace = " hello";
	expect(showCaret(textWithSpace, 3)).toMatchInlineSnapshot('" he|llo"');
	expect(findWordBoundary(textWithSpace, 3, "start")).toBe(1);

	// Test finding end boundary
	expect(showCaret(simpleText, 0)).toMatchInlineSnapshot('"|hello world"');
	expect(findWordBoundary(simpleText, 0, "end")).toBe(5);

	expect(showCaret(simpleText, 2)).toMatchInlineSnapshot('"he|llo world"');
	expect(findWordBoundary(simpleText, 2, "end")).toBe(5);
	expect(showCaret(simpleText, 5)).toMatchInlineSnapshot(`"hello| world"`);

	expect(showCaret(textWithUnderscore, 6)).toMatchInlineSnapshot(
		'"hello_|world"',
	);
	expect(findWordBoundary(textWithUnderscore, 6, "end")).toBe(11);
	expect(showCaret(simpleText, 11)).toMatchInlineSnapshot(`"hello world|"`);

	const textWithTrailingSpace = "hello ";
	expect(showCaret(textWithTrailingSpace, 2)).toMatchInlineSnapshot(
		'"he|llo "',
	);
	expect(findWordBoundary(textWithTrailingSpace, 2, "end")).toBe(5);

	// Test edge cases
	const emptyText = "";
	expect(showCaret(emptyText, 0)).toMatchInlineSnapshot('"|"');
	expect(findWordBoundary(emptyText, 0, "start")).toBe(0);
	expect(findWordBoundary(emptyText, 0, "end")).toBe(0);

	const singleWord = "word";
	expect(showCaret(singleWord, 0)).toMatchInlineSnapshot('"|word"');
	expect(findWordBoundary(singleWord, 0, "start")).toBe(0);

	expect(showCaret(singleWord, 4)).toMatchInlineSnapshot('"word|"');
	expect(findWordBoundary(singleWord, 4, "end")).toBe(4);

	expect(findWordAt(singleWord, 0)).toBe("word");
	expect(findWordAt(singleWord, 4)).toBe("word");

	// Test code examples
	const consoleLog = 'console.log("hello")';
	expect(showCaret(consoleLog, 7)).toMatchInlineSnapshot(
		`"console|.log("hello")"`,
	);
	expect(findWordBoundary(consoleLog, 7, "start")).toBe(0);
	expect(findWordBoundary(consoleLog, 7, "end")).toBe(7);
	expect(findWordAt(consoleLog, 7)).toBe("console");

	expect(showCaret(consoleLog, 11)).toMatchInlineSnapshot(
		`"console.log|("hello")"`,
	);
	expect(findWordBoundary(consoleLog, 11, "start")).toBe(8);
	expect(findWordBoundary(consoleLog, 11, "end")).toBe(11);
	expect(findWordAt(consoleLog, 11)).toBe("log");

	// Test within string literals
	const stringLiteral = 'const str = "some words here"';
	expect(showCaret(stringLiteral, 17)).toMatchInlineSnapshot(
		`"const str = "some| words here""`,
	);
	expect(findWordBoundary(stringLiteral, 17, "start")).toBe(13);
	expect(findWordBoundary(stringLiteral, 17, "end")).toBe(17);
	expect(findWordAt(stringLiteral, 17)).toBe("some");

	// Test method chains
	const methodChain = "array.map().filter()";
	expect(showCaret(methodChain, 9)).toMatchInlineSnapshot(
		`"array.map|().filter()"`,
	);
	expect(findWordBoundary(methodChain, 9, "start")).toBe(6);
	expect(findWordBoundary(methodChain, 9, "end")).toBe(9);
	expect(findWordAt(methodChain, 9)).toBe("map");

	expect(showCaret(methodChain, 10)).toMatchInlineSnapshot(
		`"array.map(|).filter()"`,
	);
	expect(findWordBoundary(methodChain, 10, "start")).toBe(10);
	expect(findWordBoundary(methodChain, 10, "end")).toBe(10);
	expect(findWordAt(methodChain, 10)).toBe("");

	// Test function calls with parameters
	const functionCall = "setTimeout(handleClick, 1000)";
	expect(showCaret(functionCall, 12)).toMatchInlineSnapshot(
		'"setTimeout(h|andleClick, 1000)"',
	);
	expect(findWordBoundary(functionCall, 12, "start")).toBe(11);
	expect(findWordBoundary(functionCall, 12, "end")).toBe(22);
	expect(findWordAt(functionCall, 12)).toBe("handleClick");

	expect(showCaret(functionCall, 23)).toMatchInlineSnapshot(
		`"setTimeout(handleClick,| 1000)"`,
	);
	expect(findWordBoundary(functionCall, 23, "start")).toBe(23);
	expect(findWordBoundary(functionCall, 23, "end")).toBe(23);
	expect(findWordAt(functionCall, 23)).toBe("");

	expect(showCaret(functionCall, 28)).toMatchInlineSnapshot(
		`"setTimeout(handleClick, 1000|)"`,
	);
	expect(findWordBoundary(functionCall, 28, "start")).toBe(24);
	expect(findWordBoundary(functionCall, 28, "end")).toBe(28);
	expect(findWordAt(functionCall, 28)).toBe("1000");

	const string = "const abcdef = 123;\nconsole.log(abcd)";
	expect(showCaret(string, 36)).toMatchInlineSnapshot(`
          "const abcdef = 123;
          console.log(abcd|)"
        `);
	expect(findWordAt(string, 36)).toBe("abcd");
});
