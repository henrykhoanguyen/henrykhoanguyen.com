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

/**
 * `2024-05` → `2024`.
 *
 * Projects show only a year in the gutter; experience shows a full date range
 * there, which is why the gutter is sized for `May 2024` rather than `2024`.
 */
export function formatYear(value: string): string {
	return value.slice(0, 4);
}

/**
 * The end of a date range. `present` becomes `Present` rather than a date,
 * since a current role has no end to state.
 */
export function formatEnd(value: string): string {
	return value === 'present' ? 'Present' : formatDate(value);
}
