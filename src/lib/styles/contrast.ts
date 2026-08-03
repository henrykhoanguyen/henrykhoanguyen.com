/**
 * WCAG relative luminance and contrast ratios.
 *
 * The green phosphor palette is the riskiest decision on this site: an
 * authentic single-green terminal is close to unreadable, and the three-stop
 * scale exists to avoid that. These functions turn "it looks fine to me" into
 * an assertion the build can enforce.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

type Rgb = { r: number; g: number; b: number };

/** Parses `#rgb` or `#rrggbb` into channel values in the range 0–255. */
export function parseHex(hex: string): Rgb {
	const value = hex.replace('#', '');
	const full =
		value.length === 3
			? value
					.split('')
					.map((c) => c + c)
					.join('')
			: value;

	if (!/^[0-9a-fA-F]{6}$/.test(full)) {
		throw new Error(`Not a hex colour: ${hex}`);
	}

	return {
		r: parseInt(full.slice(0, 2), 16),
		g: parseInt(full.slice(2, 4), 16),
		b: parseInt(full.slice(4, 6), 16)
	};
}

/** Undoes sRGB gamma encoding for a single channel. */
function linearise(channel: number): number {
	const c = channel / 255;
	return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
	const { r, g, b } = parseHex(hex);
	return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** Contrast ratio between two colours, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
	const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
	return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA: 4.5 for body text, 3.0 for large text and UI components. */
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;
