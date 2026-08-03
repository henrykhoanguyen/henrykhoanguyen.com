import { describe, expect, it } from 'vitest';
import { formatDate, formatMonth, formatYear } from './format.js';

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

describe('formatMonth', () => {
	it('returns the abbreviated month', () => {
		expect(formatMonth('2024-05')).toBe('May');
	});

	it('returns nothing when the source has no month, rather than guessing one', () => {
		expect(formatMonth('2026')).toBe('');
	});

	it('reads across the row with the gutter to form the full date', () => {
		// The listing splits a start date: year on the left, month on the right.
		expect(`${formatMonth('2024-05')} ${formatYear('2024-05')}`).toBe('May 2024');
	});
});
