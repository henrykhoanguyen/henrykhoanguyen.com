import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		/*
		 * `no-navigation-without-resolve` guards against forgetting the `base`
		 * path on sub-path deployments. Every internal link on this site does use
		 * resolve(); these two components are the exception because their hrefs
		 * arrive as content data and may be absolute URLs — a project row links
		 * either to its case study or straight to GitHub, and footer links are
		 * external or mailto:. resolve() cannot be applied to a value that might
		 * already be absolute, so the rule is switched off here rather than
		 * worked around at each call site.
		 */
		files: [
			'src/lib/components/DirectoryList.svelte',
			'src/lib/components/SiteFooter.svelte',
			'src/lib/components/CommandPalette.svelte',
			// SiteHeader does call resolve(), but appends a #hash to the result for
			// the experience anchor. The rule only recognises a bare resolve() call,
			// not one inside a template literal.
			'src/lib/components/SiteHeader.svelte',
			// QuietLink takes an href that is internal or external depending on the
			// caller; internal ones are resolved before being passed in.
			'src/lib/components/QuietLink.svelte'
		],
		rules: { 'svelte/no-navigation-without-resolve': 'off' }
	}
);
