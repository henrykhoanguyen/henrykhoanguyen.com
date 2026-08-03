import { describe, expect, it } from 'vitest';
import { FINAL, indexOf, next, reached, STEPS, stateFor } from './boot.js';
import type { Step } from './boot.js';

describe('the sequence', () => {
	it('assembles bottom-up: experience, then projects, then the hero', () => {
		expect(indexOf('experienceCommand')).toBeLessThan(indexOf('projectsCommand'));
		expect(indexOf('projectsCommand')).toBeLessThan(indexOf('whoamiCommand'));
	});

	it('types each command before revealing what it produced', () => {
		expect(indexOf('experienceCommand')).toBeLessThan(indexOf('experienceBody'));
		expect(indexOf('projectsCommand')).toBeLessThan(indexOf('projectsBody'));
	});

	it('types the name and tagline after the whoami prompt', () => {
		expect(indexOf('whoamiCommand')).toBeLessThan(indexOf('tagline'));
		expect(indexOf('whoamiCommand')).toBeLessThan(indexOf('name'));
	});

	it('types the tagline before the name, so the caret comes to rest on the name', () => {
		// The name sits above the tagline on screen. Typing the lower line first
		// continues the upward assembly and leaves the caret on the name.
		expect(indexOf('tagline')).toBeLessThan(indexOf('name'));
	});

	it('finishes on the name', () => {
		expect(indexOf('name')).toBe(indexOf(FINAL) - 1);
	});

	it('ends on the final step', () => {
		expect(STEPS.at(-1)).toBe(FINAL);
	});
});

describe('reached', () => {
	it('is true for the current step and everything before it', () => {
		expect(reached('projectsCommand', 'experienceBody')).toBe(true);
		expect(reached('projectsCommand', 'projectsCommand')).toBe(true);
	});

	it('is false for steps still ahead', () => {
		expect(reached('experienceBody', 'whoamiCommand')).toBe(false);
	});

	it('is true for everything once finished', () => {
		const unreached = STEPS.filter((step) => !reached(FINAL, step));
		expect(unreached).toEqual([]);
	});
});

describe('stateFor', () => {
	it('is pending before its turn', () => {
		expect(stateFor('experienceCommand', 'whoamiCommand')).toBe('pending');
	});

	it('is typing on its turn', () => {
		expect(stateFor('whoamiCommand', 'whoamiCommand')).toBe('typing');
	});

	it('is done once the sequence has moved past it', () => {
		expect(stateFor('name', 'whoamiCommand')).toBe('done');
	});

	it('leaves nothing pending or mid-flight at the end', () => {
		const notDone = STEPS.filter((step) => step !== FINAL && stateFor(FINAL, step) !== 'done');
		expect(notDone).toEqual([]);
	});
});

describe('next', () => {
	it('advances one step', () => {
		expect(next('experienceCommand')).toBe('experienceBody');
	});

	it('stops at the end rather than running off it', () => {
		expect(next(FINAL)).toBe(FINAL);
	});

	it('walks the whole sequence when applied repeatedly', () => {
		let step: Step = STEPS[0];
		for (let i = 0; i < STEPS.length * 2; i++) step = next(step);
		expect(step).toBe(FINAL);
	});
});
