/**
 * The single source of truth for the green phosphor palette.
 *
 * Everything consumes these values: the Tailwind `@theme` block, the Shiki
 * code-block theme, and the contrast tests. Change a colour here and it
 * changes everywhere, including the assertions that guard legibility.
 *
 * Green is a three-stop scale rather than one colour. Period-accurate
 * single-green phosphor is genuinely hard to read past a few lines, so the
 * scale keeps the look while staying scannable.
 */
export const tokens = {
	/** Page background. Near-black with a green cast. */
	bg: '#0a0f0a',
	/** Prompts, links, caret, focus rings. The accent. */
	greenBright: '#3bf75e',
	/** Primary text, including case study prose. */
	greenText: '#d3f9d8',
	/** Metadata: dates, stack tags, secondary navigation. */
	greenDim: '#6b9a72',
	/** Hairline dividers. Not used for text. */
	rule: '#1e3a22'
} as const;

/** Token names carrying text, and therefore subject to WCAG AA assertions. */
export const textTokens = ['greenBright', 'greenText', 'greenDim'] as const;

export type TokenName = keyof typeof tokens;
