import { describe, expect, it } from 'vitest';
import { HOST, promptFor } from './prompt.js';

const render = (path: string) => {
	const { user, host, cwd } = promptFor(path);
	return `${user}@${host} ${cwd}`;
};

describe('promptFor', () => {
	it.each([
		['/', 'home@henrykhoanguyen ~'],
		['/projects', 'proj@henrykhoanguyen ~'],
		['/experiences', 'exp@henrykhoanguyen ~'],
		['/about', 'about@henrykhoanguyen ~']
	])('renders %s as %s', (path, expected) => {
		expect(render(path)).toBe(expected);
	});

	it('shows the slug as a directory on a case study', () => {
		// Otherwise every project page reads as the same `~` and says nothing
		// about where the visitor actually is.
		expect(render('/projects/retail-data-platform')).toBe(
			'proj@henrykhoanguyen ~/retail-data-platform'
		);
	});

	it('keeps nested paths intact', () => {
		expect(render('/projects/tag/pub-sub')).toBe('proj@henrykhoanguyen ~/tag/pub-sub');
	});

	it('falls back to guest on an unknown section', () => {
		expect(render('/does-not-exist')).toBe('guest@henrykhoanguyen ~');
	});

	it('tolerates a trailing slash', () => {
		expect(render('/projects/')).toBe('proj@henrykhoanguyen ~');
	});

	it('treats the bare root the same as /', () => {
		expect(render('')).toBe('home@henrykhoanguyen ~');
	});

	it('always reports the same host', () => {
		const hosts = ['/', '/projects', '/about', '/nope'].map((p) => promptFor(p).host);
		expect(new Set(hosts)).toEqual(new Set([HOST]));
	});

	it('gives every section a distinct user, so the prompt identifies the page', () => {
		const users = ['/', '/projects', '/experiences', '/about'].map((p) => promptFor(p).user);
		expect(new Set(users).size).toBe(users.length);
	});
});
