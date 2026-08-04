import { describe, expect, it } from 'vitest';
import { keystrokeDelay } from './typing.js';

describe('keystrokeDelay', () => {
	// Injected randomness keeps these deterministic.
	const min = () => 0;
	const max = () => 1;

	it('pauses longer after a space, so words read as words', () => {
		expect(keystrokeDelay(' ', min)).toBeGreaterThan(keystrokeDelay('a', min));
	});

	it('varies between keystrokes, since a uniform rate reads as a machine', () => {
		expect(keystrokeDelay('a', max)).toBeGreaterThan(keystrokeDelay('a', min));
	});

	it('is brisk enough that the whole sequence does not outstay its welcome', () => {
		// "Khoa Nguyen" is 11 characters; the boot sequence types four more runs
		// after it. Anything slower than this and a visitor is waiting rather
		// than watching.
		expect(keystrokeDelay('a', min)).toBeGreaterThanOrEqual(20);
		expect(keystrokeDelay('a', max)).toBeLessThanOrEqual(70);
		expect(keystrokeDelay(' ', max)).toBeLessThanOrEqual(110);
	});

	it('types a short line in well under a second', () => {
		const line = 'Backend engineer';
		const total = [...line].reduce((sum, char) => sum + keystrokeDelay(char, () => 0.5), 0);
		expect(total).toBeLessThan(900);
	});

	it('returns whole milliseconds', () => {
		expect(Number.isInteger(keystrokeDelay('a', () => 0.4137))).toBe(true);
	});

	it('never returns a delay that would stall the animation', () => {
		const samples = Array.from({ length: 50 }, (_, i) => keystrokeDelay('a', () => i / 50));
		expect(samples.every((d) => d > 0 && d < 500)).toBe(true);
	});
});

describe('ellipses', () => {
	const mid = () => 0.5;

	it('lands each dot slower than a letter, so a pause reads as work', () => {
		expect(keystrokeDelay('.', mid)).toBeGreaterThan(keystrokeDelay('a', mid));
	});

	it('stays quicker than a full stop would be at reading pace', () => {
		// Slow enough to notice, not slow enough to wait through.
		expect(keystrokeDelay('.', mid)).toBeLessThan(150);
	});
});
