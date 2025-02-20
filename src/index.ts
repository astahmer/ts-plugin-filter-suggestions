import * as ts from "typescript/lib/tsserverlibrary";
import { resolvePluginConfig } from "./config";
import { filterSuggestions } from "./filter-suggestions";
import { findWordAt } from "./find-word-boundary";
import { caretInImportSection } from "./caret-in-import-section";
import { keepPreferredSourceOnly } from "./keep-preferred-source-only";

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
			// logger(
			//     'getCompletionsAtPosition',
			//     fileName,
			//     position,
			//     JSON.stringify(options, null, 2),
			// );
			// logger(
			//     'getCompletionsAtPosition111',
			//     JSON.stringify(
			//         program?.getSourceFiles().map((x) => x.fileName),
			//         null,
			//         2,
			//     ),
			// );
			const sourceFile = program?.getSourceFile(fileName);
			const content = sourceFile?.getFullText();
			if (!content) return;

			const importPosition = caretInImportSection(content, position);
			const currentWordAtCaret = findWordAt(content, position).trim();
			logger(
				JSON.stringify(
					{ fileName, currentWordAtCaret, importPosition },
					null,
					2,
				),
			);

			if (importPosition !== "none") {
				return info.languageService.getCompletionsAtPosition(
					fileName,
					position,
					options,
				);
			}

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

			// Enforce minimum length before suggesting externally exported symbols
			const prior = info.languageService.getCompletionsAtPosition(
				fileName,
				position,
				{
					...options,
					includeCompletionsForModuleExports: !(
						currentWordAtCaret.length <=
						config.hideCompletionsForModuleExportsIfLessThan
					),
				},
			);

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
						JSON.stringify({ filtered: prior.entries }, null, 2),
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

			return prior;
		};

		return proxy;
	}

	return { create };
}

export = init;
