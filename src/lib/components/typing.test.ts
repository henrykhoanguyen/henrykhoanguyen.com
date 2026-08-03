import { describe, expect, it } from 'vitest';
import { keystrokeDelay, typingSteps } from './typing.js';

describe('typingSteps', () => {
	it('starts empty and ends with the whole string', () => {
		const steps = typingSteps('Khoa');
		expect(steps[0]).toBe('');
		expect(steps.at(-1)).toBe('Khoa');
	});

	it('adds exactly one character per step', () => {
		const steps = typingSteps('Khoa Nguyen');
		const wrong = steps.filter((step, i) => step.length !== i);
		expect(wrong).toEqual([]);
	});

	it('handles an empty string without producing a stray step', () => {
		expect(typingSteps('')).toEqual(['']);
	});

	it('preserves spaces rather than collapsing them', () => {
		expect(typingSteps('Khoa Nguyen')[5]).toBe('Khoa ');
	});
});

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

	it('stays within a range that finishes a short name in about a second', () => {
		const slowest = keystrokeDelay(' ', max);
		expect(keystrokeDelay('a', min)).toBeGreaterThanOrEqual(50);
		expect(slowest).toBeLessThanOrEqual(200);
	});

	it('returns whole milliseconds', () => {
		expect(Number.isInteger(keystrokeDelay('a', () => 0.4137))).toBe(true);
	});

	it('never returns a delay that would stall the animation', () => {
		const samples = Array.from({ length: 50 }, (_, i) => keystrokeDelay('a', () => i / 50));
		expect(samples.every((d) => d > 0 && d < 500)).toBe(true);
	});
});
