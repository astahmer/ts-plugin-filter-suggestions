import {
	forEachChild,
	isJSDocCommentContainingNode,
	isToken,
	SyntaxKind,
	type EndOfFileToken,
	type JsxText,
	type Node,
	type SourceFile,
} from "typescript";

export function getChildAtPos(from: SourceFile, pos: number): Node | undefined {
	return getNodeAtPosition(from, pos);
}

/** Returns a token if position is in [start-of-leading-trivia, end), includes JSDoc only in JS files */
function getNodeAtPosition(sourceFile: SourceFile, position: number): Node {
	let current: Node = sourceFile;
	const getContainingChild = (child: Node) => {
		if (
			child.pos <= position &&
			(position < child.end ||
				(position === child.end && child.kind === SyntaxKind.EndOfFileToken))
		) {
			return child;
		}
	};
	while (true) {
		const child = forEachChild(current, getContainingChild);
		if (!child) {
			return current;
		}
		current = child;
	}
}

/* -----------------------------------------------------------------------------
 * Below code is copied from the Typescript repo
   https://github.com/microsoft/TypeScript/blob/246507f7f90e08a330fc9f63c1b11c2e706d9193/src/services/utilities.ts#L1578
 * -----------------------------------------------------------------------------*/

function isJsxText(node: Node): node is JsxText {
	return node.kind === SyntaxKind.JsxText;
}

function isWhiteSpaceOnlyJsxText(node: Node): boolean {
	return isJsxText(node) && node.containsOnlyTriviaWhiteSpaces;
}

function isNonWhitespaceToken(n: Node): boolean {
	return isToken(n) && !isWhiteSpaceOnlyJsxText(n);
}

function nodeHasTokens(n: Node, sourceFile: SourceFile): boolean {
	// If we have a token or node that has a non-zero width, it must have tokens.
	// Note: getWidth() does not take trivia into account.
	return n.kind === SyntaxKind.EndOfFileToken
		? // @ts-expect-error
			!!(n as EndOfFileToken).jsDoc
		: n.getWidth(sourceFile) !== 0;
}

/**
 * Finds the rightmost child to the left of `children[exclusiveStartPosition]` which is a non-all-whitespace token or has constituent tokens.
 */
function findRightmostChildNodeWithTokens(
	children: readonly Node[],
	exclusiveStartPosition: number,
	sourceFile: SourceFile,
	parentKind: SyntaxKind,
): Node | undefined {
	for (let i = exclusiveStartPosition - 1; i >= 0; i--) {
		const child = children[i];

		if (isWhiteSpaceOnlyJsxText(child)) {
			if (
				i === 0 &&
				(parentKind === SyntaxKind.JsxText ||
					parentKind === SyntaxKind.JsxSelfClosingElement)
			) {
				console.error(
					"`JsxText` tokens should not be the first child of `JsxElement | JsxSelfClosingElement`",
				);
			}
		} else if (nodeHasTokens(children[i], sourceFile)) {
			return children[i];
		}
	}
}

function findRightmostToken(n: Node, sourceFile: SourceFile): Node | undefined {
	if (isNonWhitespaceToken(n)) {
		return n;
	}

	const children = n.getChildren(sourceFile);
	if (children.length === 0) {
		return n;
	}

	const candidate = findRightmostChildNodeWithTokens(
		children,
		/*exclusiveStartPosition*/ children.length,
		sourceFile,
		n.kind,
	);
	return candidate && findRightmostToken(candidate, sourceFile);
}

/**
 * Finds the rightmost token satisfying `token.end <= position`,
 * excluding `JsxText` tokens containing only whitespace.
 *
 * @internal
 */
function findPrecedingToken(
	position: number,
	sourceFile: SourceFile,
	startNode: Node,
	excludeJsdoc?: boolean,
): Node | undefined;
/** @internal */
function findPrecedingToken(
	position: number,
	sourceFile: SourceFile,
	startNode?: Node,
	excludeJsdoc?: boolean,
): Node | undefined;
/** @internal */
function findPrecedingToken(
	position: number,
	sourceFile: SourceFile,
	startNode?: Node,
	excludeJsdoc?: boolean,
): Node | undefined {
	const result = find((startNode || sourceFile) as Node);
	if (result && isWhiteSpaceOnlyJsxText(result)) {
		throw new Error("findPrecedingToken: unexpected whitespace-only JsxText");
	}

	return result;

	function find(n: Node): Node | undefined {
		if (isNonWhitespaceToken(n) && n.kind !== SyntaxKind.EndOfFileToken) {
			return n;
		}

		const children = n.getChildren(sourceFile);
		const i = binarySearchKey(
			children,
			position,
			(_, i) => i,
			(middle, _) => {
				// This last callback is more of a selector than a comparator -
				// `EqualTo` causes the `middle` result to be returned
				// `GreaterThan` causes recursion on the left of the middle
				// `LessThan` causes recursion on the right of the middle
				if (position < children[middle].end) {
					// first element whose end position is greater than the input position
					if (!children[middle - 1] || position >= children[middle - 1].end) {
						return Comparison.EqualTo;
					}
					return Comparison.GreaterThan;
				}
				return Comparison.LessThan;
			},
		);
		if (i >= 0 && children[i]) {
			const child = children[i];
			// Note that the span of a node's tokens is [node.getStart(...), node.end).
			// Given that `position < child.end` and child has constituent tokens, we distinguish these cases:
			// 1) `position` precedes `child`'s tokens or `child` has no tokens (ie: in a comment or whitespace preceding `child`):
			// we need to find the last token in a previous child.
			// 2) `position` is within the same span: we recurse on `child`.
			if (position < child.end) {
				const start = child.getStart(
					sourceFile,
					/*includeJsDoc*/ !excludeJsdoc,
				);
				const lookInPreviousChild =
					start >= position || // cursor in the leading trivia
					!nodeHasTokens(child, sourceFile) ||
					isWhiteSpaceOnlyJsxText(child);

				if (lookInPreviousChild) {
					// actual start of the node is past the position - previous token should be at the end of previous child
					const candidate = findRightmostChildNodeWithTokens(
						children,
						/*exclusiveStartPosition*/ i,
						sourceFile,
						n.kind,
					);
					if (candidate) {
						// Ensure we recurse into JSDoc nodes with children.
						if (
							!excludeJsdoc &&
							isJSDocCommentContainingNode(candidate) &&
							candidate.getChildren(sourceFile).length
						) {
							return find(candidate);
						}
						return findRightmostToken(candidate, sourceFile);
					}
					return undefined;
				} else {
					// candidate should be in this node
					return find(child);
				}
			}
		}

		// Debug.assert(startNode !== undefined || n.kind === SyntaxKind.SourceFile || n.kind === SyntaxKind.EndOfFileToken || isJSDocCommentContainingNode(n));

		// Here we know that none of child token nodes embrace the position,
		// the only known case is when position is at the end of the file.
		// Try to find the rightmost token in the file without filtering.
		// Namely we are skipping the check: 'position < node.end'
		const candidate = findRightmostChildNodeWithTokens(
			children,
			/*exclusiveStartPosition*/ children.length,
			sourceFile,
			n.kind,
		);
		return candidate && findRightmostToken(candidate, sourceFile);
	}
}

/** Get the token whose text contains the position */
export function getTokenAtPositionWorker(
	sourceFile: SourceFile,
	position: number,
	allowPositionInLeadingTrivia: boolean = false,
	includePrecedingTokenAtEndPosition:
		| ((n: Node) => boolean)
		| undefined = undefined,
	includeEndPosition: boolean = false,
): Node {
	let current: Node = sourceFile;
	let foundToken: Node | undefined;
	outer: while (true) {
		// find the child that contains 'position'

		const children = current.getChildren(sourceFile);
		const i = binarySearchKey(
			children,
			position,
			(_, i) => i,
			(middle, _) => {
				// This last callback is more of a selector than a comparator -
				// `EqualTo` causes the `middle` result to be returned
				// `GreaterThan` causes recursion on the left of the middle
				// `LessThan` causes recursion on the right of the middle

				// Let's say you have 3 nodes, spanning positons
				// pos: 1, end: 3
				// pos: 3, end: 3
				// pos: 3, end: 5
				// and you're looking for the token at positon 3 - all 3 of these nodes are overlapping with position 3.
				// In fact, there's a _good argument_ that node 2 shouldn't even be allowed to exist - depending on if
				// the start or end of the ranges are considered inclusive, it's either wholly subsumed by the first or the last node.
				// Unfortunately, such nodes do exist. :( - See fourslash/completionsImport_tsx.tsx - empty jsx attributes create
				// a zero-length node.
				// What also you may not expect is that which node we return depends on the includePrecedingTokenAtEndPosition flag.
				// Specifically, if includePrecedingTokenAtEndPosition is set, we return the 1-3 node, while if it's unset, we
				// return the 3-5 node. (The zero length node is never correct.) This is because the includePrecedingTokenAtEndPosition
				// flag causes us to return the first node whose end position matches the position and which produces and acceptable token
				// kind. Meanwhile, if includePrecedingTokenAtEndPosition is unset, we look for the first node whose start is <= the
				// position and whose end is greater than the position.

				// There are more sophisticated end tests later, but this one is very fast
				// and allows us to skip a bunch of work
				const end = children[middle].getEnd();
				if (end < position) {
					return Comparison.LessThan;
				}

				const start = allowPositionInLeadingTrivia
					? children[middle].getFullStart()
					: children[middle].getStart(sourceFile, /*includeJsDocComment*/ true);
				if (start > position) {
					return Comparison.GreaterThan;
				}

				// first element whose start position is before the input and whose end position is after or equal to the input
				if (nodeContainsPosition(children[middle], start, end)) {
					if (children[middle - 1]) {
						// we want the _first_ element that contains the position, so left-recur if the prior node also contains the position
						if (nodeContainsPosition(children[middle - 1])) {
							return Comparison.GreaterThan;
						}
					}
					return Comparison.EqualTo;
				}

				// this complex condition makes us left-recur around a zero-length node when includePrecedingTokenAtEndPosition is set, rather than right-recur on it
				if (
					includePrecedingTokenAtEndPosition &&
					start === position &&
					children[middle - 1] &&
					children[middle - 1].getEnd() === position &&
					nodeContainsPosition(children[middle - 1])
				) {
					return Comparison.GreaterThan;
				}
				return Comparison.LessThan;
			},
		);

		if (foundToken) {
			return foundToken;
		}
		if (i >= 0 && children[i]) {
			current = children[i];
			continue outer;
		}

		return current;
	}

	function nodeContainsPosition(node: Node, start?: number, end?: number) {
		end ??= node.getEnd();
		if (end < position) {
			return false;
		}
		start ??= allowPositionInLeadingTrivia
			? node.getFullStart()
			: node.getStart(sourceFile, /*includeJsDocComment*/ true);
		if (start > position) {
			// If this child begins after position, then all subsequent children will as well.
			return false;
		}
		if (
			position < end ||
			(position === end &&
				(node.kind === SyntaxKind.EndOfFileToken || includeEndPosition))
		) {
			return true;
		} else if (includePrecedingTokenAtEndPosition && end === position) {
			const previousToken = findPrecedingToken(position, sourceFile, node);
			if (previousToken && includePrecedingTokenAtEndPosition(previousToken)) {
				foundToken = previousToken;
				return true;
			}
		}
		return false;
	}
}

/** @internal */
function some<T>(array: readonly T[] | undefined): array is readonly T[];
/** @internal */
function some<T>(
	array: readonly T[] | undefined,
	predicate: (value: T) => boolean,
): boolean;
/** @internal */
function some<T>(
	array: readonly T[] | undefined,
	predicate?: (value: T) => boolean,
): boolean {
	if (array !== undefined) {
		if (predicate !== undefined) {
			for (let i = 0; i < array.length; i++) {
				if (predicate(array[i])) {
					return true;
				}
			}
		} else {
			return array.length > 0;
		}
	}
	return false;
}

/** @internal */
const enum Comparison {
	LessThan = -1,
	EqualTo = 0,
	GreaterThan = 1,
}

/** @internal */
type Comparer<T> = (a: T, b: T) => Comparison;

/**
 * Performs a binary search, finding the index at which an object with `key` occurs in `array`.
 * If no such index is found, returns the 2's-complement of first index at which
 * `array[index]` exceeds `key`.
 * @param array A sorted array whose first element must be no larger than number
 * @param key The key to be searched for in the array.
 * @param keySelector A callback used to select the search key from each element of `array`.
 * @param keyComparer A callback used to compare two keys in a sorted array.
 * @param offset An offset into `array` at which to start the search.
 *
 * @internal
 */
function binarySearchKey<T, U>(
	array: readonly T[],
	key: U,
	keySelector: (v: T, i: number) => U,
	keyComparer: Comparer<U>,
	offset?: number,
): number {
	if (!some(array)) {
		return -1;
	}

	let low = offset ?? 0;
	let high = array.length - 1;
	while (low <= high) {
		const middle = low + ((high - low) >> 1);
		const midKey = keySelector(array[middle], middle);
		switch (keyComparer(midKey, key)) {
			case Comparison.LessThan:
				low = middle + 1;
				break;
			case Comparison.EqualTo:
				return middle;
			case Comparison.GreaterThan:
				high = middle - 1;
				break;
		}
	}

	return ~low;
}

/**
 * Iterates through the parent chain of a node and performs the callback on each parent until the callback
 * returns a truthy value, then returns that value.
 * If no such value is found, it applies the callback until the parent pointer is undefined or the callback returns "quit"
 * At that point findAncestor returns undefined.
 * @see https://github.com/microsoft/TypeScript/blob/246507f7f90e08a330fc9f63c1b11c2e706d9193/src/compiler/utilitiesPublic.ts#L784
 */
export function findAncestor<T extends Node>(
	node: Node | undefined,
	callback: (element: Node) => element is T,
): T | undefined;
export function findAncestor(
	node: Node | undefined,
	callback: (element: Node) => boolean | "quit",
): Node | undefined;
export function findAncestor(
	node: Node | undefined,
	callback: (element: Node) => boolean | "quit",
): Node | undefined {
	while (node) {
		const result = callback(node);
		if (result === "quit") {
			return undefined;
		} else if (result) {
			return node;
		}
		node = node.parent;
	}
	return undefined;
}
