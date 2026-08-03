/**
 * A single row in a directory listing.
 *
 * Lives outside the component because Svelte instance scripts cannot export
 * types, and both the component and every caller need this shape.
 */
export type DirectoryRow = {
	/** Left gutter, typically a year. Empty or omitted renders a blank gutter. */
	gutter?: string;
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
