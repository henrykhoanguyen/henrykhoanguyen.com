import { describe, expect, it } from 'vitest';
import { filterItems, moveSelection, withGroupHeadings } from './palette.js';
import type { PaletteItem } from './palette.js';

const items: PaletteItem[] = [
	{ label: 'Home', href: '/', group: 'pages' },
	{ label: 'Projects', href: '/projects', group: 'pages' },
	{
		label: 'Retail data platform',
		href: '/projects/retail-data-platform',
		group: 'projects',
		keywords: 'BigQuery Oracle Pub/Sub'
	},
	{ label: 'Vehicle data streaming', href: '/projects/vehicle-data-streaming', group: 'projects' }
];

describe('filterItems', () => {
	it('returns everything for an empty query', () => {
		expect(filterItems(items, '')).toHaveLength(4);
	});

	it('ignores surrounding whitespace', () => {
		expect(filterItems(items, '   ')).toHaveLength(4);
	});

	it('matches on label, case-insensitively', () => {
		expect(filterItems(items, 'RETAIL').map((i) => i.label)).toEqual(['Retail data platform']);
	});

	it('matches on keywords that are never displayed', () => {
		expect(filterItems(items, 'bigquery').map((i) => i.label)).toEqual(['Retail data platform']);
	});

	it('matches on group name, so "projects" finds the section', () => {
		expect(filterItems(items, 'projects').length).toBeGreaterThan(1);
	});

	it('returns nothing when there is no match', () => {
		expect(filterItems(items, 'kubernetes')).toEqual([]);
	});

	it('preserves the original order rather than rescoring', () => {
		expect(filterItems(items, 'data').map((i) => i.label)).toEqual([
			'Retail data platform',
			'Vehicle data streaming'
		]);
	});
});

describe('moveSelection', () => {
	it('advances by one', () => {
		expect(moveSelection(0, 1, 4)).toBe(1);
	});

	it('wraps past the end back to the top', () => {
		expect(moveSelection(3, 1, 4)).toBe(0);
	});

	it('wraps before the start round to the bottom', () => {
		expect(moveSelection(0, -1, 4)).toBe(3);
	});

	it('stays at zero for an empty list rather than going negative', () => {
		expect(moveSelection(0, -1, 0)).toBe(0);
		expect(moveSelection(0, 1, 0)).toBe(0);
	});

	it('never returns an out-of-range index', () => {
		const out = [-5, -1, 0, 1, 7].map((d) => moveSelection(2, d, 4));
		expect(out.every((i) => i >= 0 && i < 4)).toBe(true);
	});
});

describe('withGroupHeadings', () => {
	it('emits a heading only when the group changes', () => {
		const headings = withGroupHeadings(items).map((r) => r.heading);
		expect(headings).toEqual(['pages', undefined, 'projects', undefined]);
	});

	it('keeps every item', () => {
		expect(withGroupHeadings(items)).toHaveLength(items.length);
	});

	it('handles an empty list', () => {
		expect(withGroupHeadings([])).toEqual([]);
	});

	it('re-emits a heading when a group reappears after another', () => {
		const alternating: PaletteItem[] = [
			{ label: 'a', href: '/a', group: 'x' },
			{ label: 'b', href: '/b', group: 'y' },
			{ label: 'c', href: '/c', group: 'x' }
		];
		expect(withGroupHeadings(alternating).map((r) => r.heading)).toEqual(['x', 'y', 'x']);
	});
});
