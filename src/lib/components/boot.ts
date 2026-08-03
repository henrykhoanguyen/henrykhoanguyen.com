/**
 * The home page's boot sequence.
 *
 * The page assembles bottom-up: skills type first, then experiences appear
 * above and push them down, then projects, then the hero above all of it.
 * Because sections render in normal document order and simply are not present
 * yet, the pushing happens on its own — there is no positioning trick here, only
 * absent elements arriving.
 *
 * Steps are named rather than numbered at the call site so the ordering is
 * legible and reordering does not mean renumbering comparisons by hand.
 */
export const STEPS = [
	'skillsCommand',
	'skillsBody',
	'experienceCommand',
	'experienceBody',
	'projectsCommand',
	'projectsBody',
	'whoamiCommand',
	// Tagline before name, even though the name sits above it. The whole page
	// assembles upwards, and typing the lower line first leaves the caret
	// resting on the name — which is where you want a visitor's eye to stop.
	'tagline',
	'name',
	'done'
] as const;

export type Step = (typeof STEPS)[number];

export const FINAL: Step = 'done';

/** Position of a step in the sequence. */
export function indexOf(step: Step): number {
	return STEPS.indexOf(step);
}

/** True once the sequence has reached `step` — i.e. that step has begun. */
export function reached(current: Step, step: Step): boolean {
	return indexOf(current) >= indexOf(step);
}

/** The state a typed run should be in, given where the sequence has got to. */
export function stateFor(current: Step, step: Step): 'pending' | 'typing' | 'done' {
	const diff = indexOf(current) - indexOf(step);
	if (diff < 0) return 'pending';
	if (diff === 0) return 'typing';
	return 'done';
}

/** The step after `step`, clamped at the end. */
export function next(step: Step): Step {
	return STEPS[Math.min(indexOf(step) + 1, STEPS.length - 1)];
}
