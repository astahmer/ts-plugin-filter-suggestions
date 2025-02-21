import { defineConfig } from "tsup";

export default defineConfig({
	outDir: "out",
	entry: ["src/extension.ts"],
	format: ["cjs"],
	shims: false,
	dts: false,
	external: ["vscode"],
});
