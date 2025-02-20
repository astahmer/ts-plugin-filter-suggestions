import * as ts from "typescript/lib/tsserverlibrary";
import { resolvePluginConfig } from "./config";
import { filterSuggestions } from "./filter-suggestions";
import { findWordAt } from "./find-word-boundary";
import { keepPreferredSourceOnly } from "./keep-preferred-source-only";
import { findAncestor, getChildAtPos } from "./typescript.utils";

// @ts-expect-error
const isTest = process?.env?.["VITEST"];

function init(_modules: { typescript: typeof ts }) {
	// const ts = modules.typescript;

	function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		const config = resolvePluginConfig(info.config);
		const enableLogs = config.enableLogs ?? isTest ?? config.enableLogs;

		const logger = info?.project?.projectService?.logger?.info
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

			const currentNode = getChildAtPos(sourceFile, position);
			const importDeclaration = findAncestor(currentNode, (node) => {
				enableLogs === "debug" &&
					logger(
						"node",
						JSON.stringify({ kind: node.kind, text: node.getText() }, null, 2),
					);
				return node.kind === ts.SyntaxKind.ImportDeclaration;
			});

			enableLogs === "debug" &&
				logger(
					"currentNode",
					JSON.stringify({
						position,
						kind: currentNode?.kind,
						text: currentNode?.getText(),
					}),
				);

			if (importDeclaration) {
				logger("case:0:in-import-declaration", importDeclaration.getText());
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
				logger("case:4:preserve-original-suggestions");
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

			prior.entries = prior.entries.slice(0, config.maxEntries);

			return prior;
		};

		return proxy;
	}

	return { create };
}

export = init;
