import { test, expect } from "vitest";
import { caretInImportSection } from "../src/caret-in-import-section";

function showCaret(text: string, index: number): string {
	return text.slice(0, index) + "|" + text.slice(index);
}

test("caretInImportSection", () => {
	// Test caret in brackets section
	const importWithBrackets = "import { useState, useEffect } from 'react'";

	expect(showCaret(importWithBrackets, 9)).toMatchInlineSnapshot(
		"\"import { |useState, useEffect } from 'react'\"",
	);
	expect(caretInImportSection(importWithBrackets, 9)).toBe("brackets");

	expect(showCaret(importWithBrackets, 18)).toMatchInlineSnapshot(
		"\"import { useState,| useEffect } from 'react'\"",
	);
	expect(caretInImportSection(importWithBrackets, 18)).toBe("brackets");

	// Test right before closing bracket
	expect(showCaret(importWithBrackets, 28)).toMatchInlineSnapshot(
		`"import { useState, useEffect| } from 'react'"`,
	);
	expect(caretInImportSection(importWithBrackets, 28)).toBe("brackets");

	expect(showCaret(importWithBrackets, 29)).toMatchInlineSnapshot(
		"\"import { useState, useEffect |} from 'react'\"",
	);
	expect(caretInImportSection(importWithBrackets, 29)).toBe("brackets");

	// Test caret in from section
	expect(showCaret(importWithBrackets, 37)).toMatchInlineSnapshot(
		`"import { useState, useEffect } from '|react'"`,
	);
	expect(caretInImportSection(importWithBrackets, 37)).toBe("from");

	expect(showCaret(importWithBrackets, 42)).toMatchInlineSnapshot(
		"\"import { useState, useEffect } from 'react|'\"",
	);
	expect(caretInImportSection(importWithBrackets, 42)).toBe("from");

	// Test caret outside import sections
	expect(showCaret(importWithBrackets, 0)).toMatchInlineSnapshot(
		"\"|import { useState, useEffect } from 'react'\"",
	);
	expect(caretInImportSection(importWithBrackets, 0)).toBe("none");

	// Test multiple imports
	const multipleImports = `import { foo } from 'foo'
import { bar } from 'bar'`;

	expect(showCaret(multipleImports, 9)).toMatchInlineSnapshot(`
    "import { |foo } from 'foo'
    import { bar } from 'bar'"
  `);
	expect(caretInImportSection(multipleImports, 9)).toBe("brackets");

	expect(showCaret(multipleImports, 32)).toMatchInlineSnapshot(`
		"import { foo } from 'foo'
		import| { bar } from 'bar'"
	`);
	expect(caretInImportSection(multipleImports, 32)).toBe("none");

	expect(showCaret(multipleImports, 34)).toMatchInlineSnapshot(`
		"import { foo } from 'foo'
		import {| bar } from 'bar'"
	`);
	expect(caretInImportSection(multipleImports, 34)).toBe("brackets");

	// Test default import
	const defaultImport = "import React, { useState } from 'react'";
	expect(showCaret(defaultImport, 20)).toMatchInlineSnapshot(
		`"import React, { useS|tate } from 'react'"`,
	);
	expect(caretInImportSection(defaultImport, 20)).toBe("brackets");

	// Test import without brackets
	const importWithoutBrackets = "import foo from 'foo'";
	expect(showCaret(importWithoutBrackets, 15)).toMatchInlineSnapshot(
		`"import foo from| 'foo'"`,
	);
	expect(caretInImportSection(importWithoutBrackets, 15)).toBe("none");

	// Test non-import line
	const nonImport = "const foo = 'bar'";
	expect(showCaret(nonImport, 5)).toMatchInlineSnapshot(
		"\"const| foo = 'bar'\"",
	);
	expect(caretInImportSection(nonImport, 5)).toBe("none");

	// Test incomplete imports
	const incompleteImport = "import { useState";
	expect(showCaret(incompleteImport, 16)).toMatchInlineSnapshot(
		`"import { useStat|e"`,
	);
	expect(caretInImportSection(incompleteImport, 16)).toBe("brackets");

	expect(showCaret(incompleteImport, 17)).toMatchInlineSnapshot(
		`"import { useState|"`,
	);
	expect(caretInImportSection(incompleteImport, 17)).toBe("none");

	const importWithoutFrom = "import { useState }";
	expect(showCaret(importWithoutFrom, 16)).toMatchInlineSnapshot(
		`"import { useStat|e }"`,
	);
	expect(caretInImportSection(importWithoutFrom, 16)).toBe("brackets");

	expect(showCaret(importWithoutFrom, 18)).toMatchInlineSnapshot(
		`"import { useState |}"`,
	);
	expect(caretInImportSection(importWithoutFrom, 18)).toBe("brackets");
});
