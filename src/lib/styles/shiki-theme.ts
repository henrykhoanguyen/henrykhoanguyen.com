import { tokens } from './tokens.js';

/**
 * A Shiki theme built from the site's own tokens rather than an off-the-shelf
 * theme, so code blocks sit inside the green scale instead of importing a
 * second palette into the page.
 *
 * Highlighting runs at build time, so no highlighter ships to the browser.
 */
export const phosphorTheme = {
	name: 'phosphor',
	type: 'dark' as const,
	colors: {
		'editor.background': tokens.bg,
		'editor.foreground': tokens.greenText
	},
	settings: [
		{
			settings: {
				background: tokens.bg,
				foreground: tokens.greenText
			}
		},
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: tokens.greenDim, fontStyle: 'italic' }
		},
		{
			scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'],
			settings: { foreground: tokens.greenBright }
		},
		{
			scope: ['string', 'string.quoted', 'constant.character'],
			settings: { foreground: tokens.greenBright }
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.other'],
			settings: { foreground: tokens.greenBright }
		},
		{
			scope: ['entity.name.function', 'support.function', 'meta.function-call'],
			settings: { foreground: tokens.greenText }
		},
		{
			scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
			settings: { foreground: tokens.greenText }
		},
		{
			scope: ['variable', 'variable.other', 'variable.parameter'],
			settings: { foreground: tokens.greenText }
		},
		{
			scope: ['punctuation', 'meta.brace', 'keyword.operator'],
			settings: { foreground: tokens.greenDim }
		}
	]
};
