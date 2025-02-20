import * as ts from "typescript/lib/tsserverlibrary";
import { resolvePluginConfig } from "./config";
import { filterSuggestions } from "./filter-suggestions";
import {
	caretInImportSection,
	findWordBoundary,
	keepPreferredSourceOnly,
} from "./utils";

// @ts-expect-error
const isTest = process?.env?.["VITEST"];
const enableLogs = isTest;

function init(_modules: { typescript: typeof ts }) {
	// const ts = modules.typescript;

	function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
		const config = resolvePluginConfig(info.config);

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

		// Diagnostic logging
		logger("init");

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
			const wordStart = findWordBoundary(content, position, "start");
			const wordEnd = findWordBoundary(content, position, "end");
			const currentWordAtCaret = content.slice(wordStart, wordEnd).trim();
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
			// logger('entries', prior.entries.length, JSON.stringify(prior.entries));

			if (
				prior.entries.length >= config.filterIfMoreThanEntries &&
				currentWordAtCaret.length <= config.filterIfLessThan
			) {
				logger("case:3:filter-suggestions");

				prior.entries = filterSuggestions(
					currentWordAtCaret,
					prior.entries,
					config,
				);

				// logger(
				//     JSON.stringify(
				//         {
				//             count: prior.entries.length,
				//             // filtered: prior.entries,
				//         },
				//         null,
				//         2,
				//     ),
				//     JSON.stringify(prior.entries),
				// );
				return prior;
			} else {
				logger("case:4:preserve-original-suggestions");
			}

			if (config.preferImportFrom.length) {
				prior.entries = keepPreferredSourceOnly(
					config.preferImportFrom,
					prior.entries,
				);
			}

			return prior;
		};

		// prior.entries = prior.entries.filter((entry) => entry.source);

		return proxy;
	}

	return { create };
}

export = init;
