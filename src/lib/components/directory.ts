/**
 * A single row in a directory listing.
 *
 * Lives outside the component because Svelte instance scripts cannot export
 * types, and both the component and every caller need this shape.
 */
export type DirectoryRow = {
	/**
	 * Left gutter. A single value for a project year; an array to stack lines,
	 * which is how a role renders its date range:
	 *
	 * ```
	 * May 2024
	 * -
	 * Present
	 * ```
	 *
	 * Omitted or empty renders a blank gutter, keeping the column aligned.
	 */
	gutter?: string | string[];
	title: string;
	/** Optional second line beneath the title. */
	summary?: string;
	/**
	 * Dashed detail lines beneath the title, for rows that carry more than a
	 * one-line summary — role highlights, for instance.
	 */
	details?: string[];
	/** Right-aligned metadata: stack tags, date ranges. */
	meta?: string;
	/** Omit to render a non-interactive row. */
	href?: string;
	/** Dimmed rather than hidden when a stack filter excludes it. */
	dimmed?: boolean;
};
