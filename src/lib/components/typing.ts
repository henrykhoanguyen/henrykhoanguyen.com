/**
 * Timing for the hero typewriter.
 *
 * Kept out of the component so it can be tested without a DOM. The component
 * owns the timers; this owns the decisions.
 */

/**
 * Delay before the next character.
 *
 * Uniform delays read as machine output rather than typing, so each keystroke
 * gets jitter. A pause after a space suggests a hand crossing a word boundary.
 *
 * `random` is injected so tests are deterministic.
 */
export function keystrokeDelay(previousChar: string, random: () => number = Math.random): number {
	const base = previousChar === ' ' ? 68 : 26;
	return Math.round(base + random() * 30);
}
