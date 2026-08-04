type PaletteEntry = {
	label: string;
	/** Grouping label shown above a run of items. */
	group: string;
	/** Extra text matched against but not displayed — a project summary, say. */
	keywords?: string;
};

/** Somewhere to go. */
export type PaletteLink = PaletteEntry & { href: string };

/**
 * Something to do.
 *
 * Actions cannot come from the server load — a function does not survive
 * serialisation — so the palette appends its own.
 */
export type PaletteAction = PaletteEntry & { run: () => void };

export type PaletteItem = PaletteLink | PaletteAction;

export function isAction(item: PaletteItem): item is PaletteAction {
	return 'run' in item;
}

/**
 * Filtering for the command palette.
 *
 * Substring matching rather than fuzzy matching: with a dozen entries, fuzzy
 * scoring mostly produces surprising orderings, and a portfolio palette is for
 * jumping to something you already know the name of.
 */
export function filterItems<T extends PaletteEntry>(items: T[], query: string): T[] {
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
export function withGroupHeadings<T extends PaletteEntry>(
	items: T[]
): { item: T; heading?: string }[] {
	let previous: string | undefined;
	return items.map((item) => {
		const heading = item.group === previous ? undefined : item.group;
		previous = item.group;
		return { item, heading };
	});
}
