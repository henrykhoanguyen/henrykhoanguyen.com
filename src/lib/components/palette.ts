export type PaletteItem = {
	label: string;
	href: string;
	/** Grouping label shown above a run of items. */
	group: string;
	/** Extra text matched against but not displayed — a project summary, say. */
	keywords?: string;
};

/**
 * Filtering for the command palette.
 *
 * Substring matching rather than fuzzy matching: with a dozen entries, fuzzy
 * scoring mostly produces surprising orderings, and a portfolio palette is for
 * jumping to something you already know the name of.
 */
export function filterItems(items: PaletteItem[], query: string): PaletteItem[] {
	const q = query.trim().toLowerCase();
	if (!q) return items;

	return items.filter((item) =>
		`${item.label} ${item.group} ${item.keywords ?? ''}`.toLowerCase().includes(q)
	);
}

/**
 * Moves the selected index by `delta`, wrapping at both ends.
 *
 * Wrapping matters more than it sounds: pressing Down at the bottom of a short
 * list should return to the top rather than stick.
 */
export function moveSelection(current: number, delta: number, length: number): number {
	if (length === 0) return 0;
	return (current + delta + length) % length;
}

/** Items in order, tagged with whether each one opens a new visual group. */
export function withGroupHeadings(items: PaletteItem[]): { item: PaletteItem; heading?: string }[] {
	let previous: string | undefined;
	return items.map((item) => {
		const heading = item.group === previous ? undefined : item.group;
		previous = item.group;
		return { item, heading };
	});
}
