import * as vscode from "vscode";
import { getTsApi } from "./typescript-language-features";

const getFreshSettings = () => {
	return vscode.workspace.getConfiguration("ts-plugin-filter-suggestions");
};

// https://code.visualstudio.com/api/references/contribution-points#contributes.typescriptServerPlugins
// https://code.visualstudio.com/api/references/contribution-points#Plugin-configuration
export async function activate(context: vscode.ExtensionContext) {
	const log = (...args: any[]) =>
		console.log("[vscode-ts-plugin-filter-suggestions]", ...args);

	const tsApi = await getTsApi();
	if (!tsApi) {
		log("tsApi not found");
		return;
	}

	const settings = getFreshSettings();
	tsApi.configurePlugin("ts-plugin-filter-suggestions", settings);

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((update) => {
			log("onDidChangeConfiguration", update);
			if (!tsApi) return;

			const settings = getFreshSettings();
			console.log(settings);
			tsApi.configurePlugin("ts-plugin-filter-suggestions", settings);
		}),
	);
}

export function deactivate() {
	//
}
