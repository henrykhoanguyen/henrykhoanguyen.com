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
 * Dots are slower still. An ellipsis typed at reading speed looks like text
 * arriving; typed slowly, each dot lands separately and the line reads as
 * something taking time to finish.
 *
 * `random` is injected so tests are deterministic.
 */
export function keystrokeDelay(previousChar: string, random: () => number = Math.random): number {
	const base = previousChar === '.' ? 80 : previousChar === ' ' ? 68 : 26;
	return Math.round(base + random() * 30);
}
