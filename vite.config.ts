import { defineConfig } from 'vitest/config';
import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { createHighlighter } from 'shiki';
import { phosphorTheme } from './src/lib/styles/shiki-theme.js';

const highlighter = await createHighlighter({
	themes: [phosphorTheme],
	langs: ['java', 'python', 'sql', 'bash', 'json', 'yaml', 'typescript', 'javascript']
});

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: undefined, strict: true }),
			preprocess: [
				mdsvex({
					extensions: ['.svx', '.md'],
					highlight: {
						highlighter: async (code, lang) => {
							const html = highlighter.codeToHtml(code, {
								lang: highlighter.getLoadedLanguages().includes(lang ?? '')
									? (lang ?? 'text')
									: 'text',
								theme: 'phosphor'
							});
							return `{@html ${JSON.stringify(html)}}`;
						}
					}
				})
			],
			extensions: ['.svelte', '.svx', '.md']
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
