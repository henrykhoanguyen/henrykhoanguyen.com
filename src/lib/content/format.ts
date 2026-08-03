const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formatting for dates that are deliberately imprecise.
 *
 * Frontmatter dates may be `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`, because the
 * honest precision varies — a role has a start month, a project spanning three
 * years does not have a start day. These functions render whatever precision
 * the source actually carries rather than inventing one.
 */

/** `2024-05` → `May 2024`. `2024` → `2024`. */
export function formatDate(value: string): string {
	const [year, month] = value.split('-');
	if (!month) return year;
	return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** `2024-05` … `present` → `May 2024 — now`. */
export function formatRange(start: string, end: string): string {
	return `${formatDate(start)} — ${end === 'present' ? 'now' : formatDate(end)}`;
}
