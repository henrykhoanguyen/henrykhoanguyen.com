import { describe, expect, it } from 'vitest';
import { EXIT_KEYWORDS, LOGOUT_LINES } from './logout.js';

describe('the logout sequence', () => {
	it('opens with the command that caused it', () => {
		expect(LOGOUT_LINES[0]).toBe('$ exit');
	});

	it('ends by saying it is done', () => {
		expect(LOGOUT_LINES.at(-1)).toBe('...completed.');
	});

	it('has no blank lines, which the layout provides instead', () => {
		expect(LOGOUT_LINES.filter((l) => l.trim() === '')).toEqual([]);
	});

	it('is short enough to sit on one screen', () => {
		expect(LOGOUT_LINES.length).toBeLessThanOrEqual(8);
	});
});

describe('exit keywords', () => {
	it.each(['quit', ':q!', ':q', 'logout', 'exit'])('includes %s', (word) => {
		expect(EXIT_KEYWORDS).toContain(word);
	});
});
