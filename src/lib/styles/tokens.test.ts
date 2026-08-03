import { describe, expect, it } from 'vitest';
import { tokens, textTokens } from './tokens.js';
import { AA_LARGE, AA_NORMAL, contrastRatio, parseHex, relativeLuminance } from './contrast.js';

describe('contrast maths', () => {
	it('parses shorthand and longhand hex identically', () => {
		expect(parseHex('#fff')).toEqual(parseHex('#ffffff'));
	});

	it('rejects a value that is not a colour', () => {
		expect(() => parseHex('#zzz')).toThrowError(/hex/);
	});

	it('puts black at zero luminance and white at one', () => {
		expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
		expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
	});

	it('gives black on white the maximum ratio of 21', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
	});

	it('gives a colour against itself a ratio of 1', () => {
		expect(contrastRatio('#3bf75e', '#3bf75e')).toBeCloseTo(1, 5);
	});

	it('is symmetric regardless of argument order', () => {
		expect(contrastRatio('#0a0f0a', '#d3f9d8')).toBeCloseTo(contrastRatio('#d3f9d8', '#0a0f0a'), 5);
	});
});

describe('the phosphor palette meets WCAG AA', () => {
	it.each(textTokens)('%s passes AA for body text against the background', (name) => {
		const ratio = contrastRatio(tokens[name], tokens.bg);
		expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL);
	});

	it('keeps primary text comfortably above the minimum, not merely at it', () => {
		// Case study bodies are set in this colour at 15px. Scraping past 4.5
		// would be technically compliant and unpleasant to read.
		expect(contrastRatio(tokens.greenText, tokens.bg)).toBeGreaterThan(10);
	});

	it('keeps the dim stop legible, since dates and stack tags use it', () => {
		expect(contrastRatio(tokens.greenDim, tokens.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
	});

	it('keeps the bright stop usable for links and focus rings', () => {
		expect(contrastRatio(tokens.greenBright, tokens.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
	});
});

describe('the stops are distinguishable from each other', () => {
	// A three-stop scale only works if the stops read as different. If dim and
	// primary converge, metadata stops being visually secondary and the listing
	// turns into an undifferentiated wall.
	it('separates primary text from metadata', () => {
		expect(contrastRatio(tokens.greenText, tokens.greenDim)).toBeGreaterThanOrEqual(2);
	});

	it('separates the accent from metadata', () => {
		expect(contrastRatio(tokens.greenBright, tokens.greenDim)).toBeGreaterThanOrEqual(2);
	});
});

describe('the rule colour', () => {
	it('is a divider, not a text colour, and is deliberately below AA', () => {
		// Asserted so nobody later mistakes it for a usable foreground.
		expect(contrastRatio(tokens.rule, tokens.bg)).toBeLessThan(AA_LARGE);
	});
});

describe('token hygiene', () => {
	it.each(Object.entries(tokens))('%s is a six-digit hex value', (_name, value) => {
		expect(value).toMatch(/^#[0-9a-f]{6}$/);
	});
});
