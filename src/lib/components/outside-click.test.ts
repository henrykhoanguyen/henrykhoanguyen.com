import { describe, expect, it, vi, afterEach } from 'vitest';
import { isDeadSpaceClick } from './outside-click.js';

/**
 * The DOM is faked rather than rendered: the only behaviour here is "what did
 * this click land on", which needs `closest` and a selection, not a document.
 */
function clickOn(closestResult: unknown, selection = ''): MouseEvent {
	vi.stubGlobal('window', { getSelection: () => ({ toString: () => selection }) });
	return { target: { closest: () => closestResult } } as unknown as MouseEvent;
}

afterEach(() => vi.unstubAllGlobals());

describe('isDeadSpaceClick', () => {
	it('is true for a click on nothing interactive', () => {
		expect(isDeadSpaceClick(clickOn(null))).toBe(true);
	});

	it('is false when the click landed inside a link or button', () => {
		// Otherwise the handler steals clicks meant for navigation.
		expect(isDeadSpaceClick(clickOn({}))).toBe(false);
	});

	it('is false while text is selected', () => {
		// Dragging to select ends in a click; clearing then feels like the page
		// fighting the user.
		expect(isDeadSpaceClick(clickOn(null, 'some selected text'))).toBe(false);
	});

	it('is true when a previous selection has been collapsed', () => {
		expect(isDeadSpaceClick(clickOn(null, ''))).toBe(true);
	});

	it('handles a click with no target at all', () => {
		vi.stubGlobal('window', { getSelection: () => null });
		expect(isDeadSpaceClick({ target: null } as unknown as MouseEvent)).toBe(true);
	});
});
