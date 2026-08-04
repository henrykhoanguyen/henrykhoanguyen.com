import { describe, expect, it } from 'vitest';
import { EXIT_KEYWORDS, LOGOUT_COMMAND, LOGOUT_LINES } from './logout.js';

describe('the logout sequence', () => {
	it('keeps the command out of the output lines', () => {
		// The shell prints `$` itself and the command is echoed, not typed as
		// output — and the two are coloured differently because of it.
		expect(LOGOUT_COMMAND).toBe('exit');
		expect(LOGOUT_LINES).not.toContain('exit');
	});

	it('carries no prompt characters, which the component prints', () => {
		expect(LOGOUT_LINES.filter((l) => l.startsWith('$'))).toEqual([]);
	});

	it('opens with the shell reporting the logout', () => {
		expect(LOGOUT_LINES[0]).toBe('logout');
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
