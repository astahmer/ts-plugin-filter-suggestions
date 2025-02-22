import * as ts from "typescript/lib/tsserverlibrary";
import { resolvePluginConfig, type IntellisensePluginConfig } from "./config";
import { filterSuggestions } from "./filter-suggestions";
import { findWordAt } from "./find-word-boundary";
import { keepPreferredSourceOnly } from "./keep-preferred-source-only";
import { findAncestor, getChildAtPos } from "./typescript.utils";

const isTest = process?.env?.["VITEST"];

function init(_modules: { typescript: typeof ts }) {
	// const ts = modules.typescript;

	let config: Required<IntellisensePluginConfig>;
	let logger: (...args: any[]) => void = () => void 0;

	function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		config = resolvePluginConfig(info.config);
		const enableLogs = config.enableLogs ?? isTest;

		logger = info?.project?.projectService?.logger?.info
			? (...args: any[]) => {
					if (!enableLogs) return;

					isTest && console.log("[ts-intellisense-plugin]", ...args);
					return info.project.projectService.logger.info(
						["[ts-intellisense-plugin-logger]", ...args].join(" "),
					);
				}
			: (...args: any[]) =>
					enableLogs && console.log("[ts-intellisense-plugin]", ...args);

		logger(
			"init",
			JSON.stringify({ resolvedConfig: config, passedConfig: info.config }),
		);

		const proxy: ts.LanguageService = Object.create(null);
		Object.keys(info.languageService).forEach((key) => {
			// @ts-expect-error
			const member = info.languageService[key];
			// @ts-expect-error
			proxy[key] = (...args: Array<{}>) =>
				member.apply(info.languageService, args);
		});

		// Hook into the getCompletionsAtPosition to filter suggestions
		proxy.getCompletionsAtPosition = (fileName, position, options) => {
			const program = info.languageService.getProgram();
			const sourceFile = program?.getSourceFile(fileName);

			const content = sourceFile?.getFullText();
			if (!sourceFile || !content) return;

			let currentNode = getChildAtPos(sourceFile, position);
			if (currentNode?.kind === ts.SyntaxKind.EndOfFileToken) {
				currentNode = getChildAtPos(sourceFile, position - 1);
				if (currentNode?.kind === ts.SyntaxKind.DotToken) {
					currentNode = getChildAtPos(sourceFile, position - 2);
				}
			}

			const stringOrImportAncestor = findAncestor(currentNode, (node) => {
				enableLogs === "debug" &&
					logger(
						"node",
						JSON.stringify(
							{
								kind: node.kind,
								kindName: ts.SyntaxKind[node.kind],
								text: node.getText(),
							},
							null,
							2,
						),
					);

				return (
					node.kind === ts.SyntaxKind.ImportDeclaration ||
					//
					node.kind === ts.SyntaxKind.StringLiteral ||
					node.kind === ts.SyntaxKind.NumericLiteral ||
					//
					node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
					node.kind === ts.SyntaxKind.TemplateHead ||
					node.kind === ts.SyntaxKind.TemplateExpression
				);
			});

			enableLogs === "debug" &&
				logger(
					"currentNode",
					currentNode
						? JSON.stringify({
								position,
								kind: currentNode.kind,
								kindName: ts.SyntaxKind[currentNode.kind],
								text: currentNode.getText(),
							})
						: "_none_",
				);

			if (stringOrImportAncestor) {
				logger(
					"case:0:current-should-have-native-suggestions",
					stringOrImportAncestor.getText(),
				);
				return info.languageService.getCompletionsAtPosition(
					fileName,
					position,
					options,
				);
			}

			let shouldHaveNativeSuggestions = false;
			const unwrappedNode = currentNode && unwrapExpression(currentNode);
			const parent = unwrappedNode?.parent;
			if (parent) {
				logger(
					"case:01:maybe-parent-should-have-native-suggestions",
					unwrappedNode.getText(),
				);
				const unwrappedParent = unwrapExpression(parent);

				// aaa.|
				if (unwrappedParent.kind === ts.SyntaxKind.PropertyAccessExpression) {
					const unwrappedGrandParent = unwrapExpression(unwrappedParent.parent);

					// aaa.| is fine
					// aaa|. is NOT fine
					// aaa.bbb.| is fine
					// aaa.|bbb. is fine
					if (
						unwrappedGrandParent.kind !== ts.SyntaxKind.ExpressionStatement ||
						(unwrappedParent as ts.PropertyAccessExpression).name ===
							unwrappedNode
					) {
						shouldHaveNativeSuggestions = true;
					}
				}
			}

			if (shouldHaveNativeSuggestions) {
				logger("case:01:parent-should-have-native-suggestions");
				return info.languageService.getCompletionsAtPosition(
					fileName,
					position,
					options,
				);
			}

			const currentWordAtCaret = findWordAt(content, position).trim();
			logger(JSON.stringify({ fileName, currentWordAtCaret }, null, 2));

			// Don't suggest anything
			if (
				!currentWordAtCaret ||
				currentWordAtCaret.length <= config.hideSuggestionsIfLessThan
			) {
				logger("case:1:hide-suggestions");
				return {
					entries: [],
					isGlobalCompletion: true,
					isMemberCompletion: false,
					isNewIdentifierLocation: true,
					isIncomplete: true,
				};
			}

			const includeCompletionsForModuleExports = !(
				currentWordAtCaret.length <=
				config.hideCompletionsForModuleExportsIfLessThan
			);
			logger(
				"includeCompletionsForModuleExports",
				includeCompletionsForModuleExports,
			);

			// Enforce minimum length before suggesting externally exported symbols
			const prior = info.languageService.getCompletionsAtPosition(
				fileName,
				position,
				{
					...options,
					includeCompletionsForModuleExports:
						includeCompletionsForModuleExports,
					includeExternalModuleExports: includeCompletionsForModuleExports,
					useLabelDetailsInCompletionEntries:
						typeof config.useLabelDetailsInCompletionEntriesIfLessThan ===
						"boolean"
							? config.useLabelDetailsInCompletionEntriesIfLessThan
							: currentWordAtCaret.length <=
								config.useLabelDetailsInCompletionEntriesIfLessThan,
					// autoImportFileExcludePatterns <- already in VSCode settings
					// allowIncompleteCompletions
				},
			);
			logger("entries:count", prior?.entries?.length);

			logger(
				JSON.stringify(
					{
						isGlobal: prior?.isGlobalCompletion,
						isMember: prior?.isMemberCompletion,
						isNewIdentifierLocation: prior?.isNewIdentifierLocation,
						isIncomplete: prior?.isIncomplete,
					},
					null,
					2,
				),
			);

			if (!prior || prior.entries.length === 0) {
				logger("case:2:empty-suggestions");
				return prior;
			}
			enableLogs === "debug" &&
				logger(
					"debug:entries",
					prior.entries.length,
					JSON.stringify(prior.entries),
				);

			if (
				prior.entries.length >= config.filterIfMoreThanEntries &&
				currentWordAtCaret.length <= config.filterIfLessThan
			) {
				logger("case:3:filter-suggestions", prior.entries.length);

				prior.entries = filterSuggestions(
					currentWordAtCaret,
					prior.entries,
					config,
				);

				enableLogs === "debug" &&
					logger(
						"debug:entries:filtered",
						JSON.stringify({ filtered: prior.entries }),
					);
				logger("case:3:filtered", prior.entries.length);
			} else {
				logger(
					"case:4:preserve-original-suggestions",
					JSON.stringify({
						count: prior.entries.length,
						filterIfMoreThanEntries: config.filterIfMoreThanEntries,
						filterIfLessThan: config.filterIfLessThan,
						currentWordAtCaret,
						currentWordAtCaretLength: currentWordAtCaret.length,
						firstCond: prior.entries.length >= config.filterIfMoreThanEntries,
						secondCond: currentWordAtCaret.length <= config.filterIfLessThan,
					}),
				);
			}

			if (config.preferImportFrom.length) {
				logger("case:5:prefer-import-from", prior.entries.length);
				prior.entries = keepPreferredSourceOnly(
					config.preferImportFrom,
					prior.entries,
					config.preferImportFromMode,
				);
				logger("case:5:filtered", prior.entries.length);
			} else {
				logger("case:6:preserve-current-suggestions", prior.entries.length);
			}

			// idk this somehow prevents ANY suggestions from showing (instead of showing max X.. ?)
			// prior.entries = prior.entries.slice(0, config.maxEntries);
			logger("case:7:sliced", prior.entries.length);

			return prior;
		};

		return proxy;
	}

	return { create };
}

export = init;

const getKindName = (node: ts.Node) => ts.SyntaxKind[node.kind];
const debugNode = (node: ts.Node) => ({
	kindName: getKindName(node),
	text: node.getText(),
});

/**
 * adapted my own code (without ts-morph) from
 * @see https://github.com/chakra-ui/panda/blob/029d2eb190bbc653a4fe54a62f009078b3a6e3fa/packages/extractor/src/utils.ts#L24
 */
const unwrapExpression = (node: ts.Node): ts.Node => {
	// Object as any => Object
	if (node.kind === ts.SyntaxKind.AsExpression) {
		return unwrapExpression((node as ts.AsExpression).expression);
	}

	// (Object) => Object
	if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
		return unwrapExpression((node as ts.ParenthesizedExpression).expression);
	}

	// "red"! => "red"
	if (node.kind === ts.SyntaxKind.NonNullExpression) {
		return unwrapExpression((node as ts.NonNullExpression).expression);
	}

	// <T>Object => Object
	if (node.kind === ts.SyntaxKind.TypeAssertionExpression) {
		return unwrapExpression((node as ts.TypeAssertion).expression);
	}

	// xxx satisfies yyy -> xxx
	if (node.kind === ts.SyntaxKind.SatisfiesExpression) {
		return unwrapExpression((node as ts.SatisfiesExpression).expression);
	}

	return node;
};
