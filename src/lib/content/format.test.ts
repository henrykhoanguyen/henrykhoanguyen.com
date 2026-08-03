import { describe, expect, it } from 'vitest';
import { formatDate, formatEnd, formatYear } from './format.js';

describe('formatDate', () => {
	it('renders month and year when the source has a month', () => {
		expect(formatDate('2024-05')).toBe('May 2024');
	});

	it('renders the year alone when that is all the source carries', () => {
		expect(formatDate('2026')).toBe('2026');
	});

	it('ignores a day, which is never meaningful for this content', () => {
		expect(formatDate('2024-05-17')).toBe('May 2024');
	});

	it.each([
		['2024-01', 'Jan 2024'],
		['2024-12', 'Dec 2024']
	])('handles the boundary month %s', (input, expected) => {
		expect(formatDate(input)).toBe(expected);
	});
});

describe('formatYear', () => {
	it.each(['2024', '2024-05', '2024-05-17'])('extracts 2024 from %s', (value) => {
		expect(formatYear(value)).toBe('2024');
	});
});

describe('formatEnd', () => {
	it('says Present for a current role rather than inventing an end date', () => {
		expect(formatEnd('present')).toBe('Present');
	});

	it('formats a concrete end date like any other', () => {
		expect(formatEnd('2024-05')).toBe('May 2024');
	});
});

describe('gutter widths', () => {
	// Both listings share one column grid, so the gutter must fit the widest
	// value either produces. September is the longest month abbreviation only in
	// full form; abbreviated, every month is three characters, so "May 2024" and
	// "Present" bound the range.
	it('never produces a gutter line longer than "May 2024"', () => {
		const dates = ['2024-05', '2026-01', '2020-10', '2026-09', '2026'].map(formatDate);
		const ends = ['present', '2024-05'].map(formatEnd);
		const longest = Math.max(...[...dates, ...ends].map((v) => v.length));
		expect(longest).toBeLessThanOrEqual('May 2024'.length);
	});
});
