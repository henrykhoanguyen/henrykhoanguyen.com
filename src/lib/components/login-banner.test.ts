import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatLoginTime, readAndRecordVisit, LAST_VISIT_KEY } from './login-banner.js';

function fakeStorage(initial: Record<string, string> = {}) {
	const store = { ...initial };
	return {
		store,
		api: {
			getItem: (k: string) => store[k] ?? null,
			setItem: (k: string, v: string) => void (store[k] = v)
		}
	};
}

afterEach(() => vi.unstubAllGlobals());

describe('formatLoginTime', () => {
	it('matches the shape `date` prints', () => {
		expect(formatLoginTime(new Date(2026, 7, 3, 9, 14, 22))).toBe('Mon Aug  3 09:14:22');
	});

	it('space-pads a single-digit day, as a real terminal does', () => {
		// Zero-padding here is the tell that gives away an imitation.
		expect(formatLoginTime(new Date(2026, 7, 3, 9, 14, 22))).toContain('Aug  3');
	});

	it('does not pad a two-digit day', () => {
		expect(formatLoginTime(new Date(2026, 7, 23, 9, 14, 22))).toContain('Aug 23');
	});

	it('zero-pads the clock', () => {
		expect(formatLoginTime(new Date(2026, 0, 1, 5, 6, 7))).toBe('Thu Jan  1 05:06:07');
	});
});

describe('readAndRecordVisit', () => {
	it('returns nothing on a first visit', () => {
		const { api } = fakeStorage();
		vi.stubGlobal('localStorage', api);
		expect(readAndRecordVisit()).toBeNull();
	});

	it('records this visit so the next one has something to report', () => {
		const { store, api } = fakeStorage();
		vi.stubGlobal('localStorage', api);
		const now = new Date(2026, 7, 3, 9, 14, 22);

		readAndRecordVisit(now);
		expect(store[LAST_VISIT_KEY]).toBe(now.toISOString());
	});

	it('reports the previous visit, not the current one', () => {
		const previous = new Date(2026, 6, 1, 8, 0, 0);
		const { api } = fakeStorage({ [LAST_VISIT_KEY]: previous.toISOString() });
		vi.stubGlobal('localStorage', api);

		expect(readAndRecordVisit(new Date(2026, 7, 3))?.toISOString()).toBe(previous.toISOString());
	});

	it('ignores a corrupted stored value rather than rendering "Invalid Date"', () => {
		const { api } = fakeStorage({ [LAST_VISIT_KEY]: 'not a date' });
		vi.stubGlobal('localStorage', api);
		expect(readAndRecordVisit()).toBeNull();
	});

	it('survives storage being unavailable', () => {
		// Private browsing and blocked storage should cost a decorative line, not
		// the page.
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('denied');
			},
			setItem: () => {
				throw new Error('denied');
			}
		});
		expect(() => readAndRecordVisit()).not.toThrow();
		expect(readAndRecordVisit()).toBeNull();
	});
});
