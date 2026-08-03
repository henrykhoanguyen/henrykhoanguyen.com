/**
 * Whether the home page's boot sequence is still running.
 *
 * The login banner sits above the nav, which lives in the layout, but only the
 * home page knows whether the animation is playing. Threading a prop up through
 * the layout would put a page's concern in the layout's signature; a small
 * module-scoped rune says the same thing without the plumbing.
 *
 * Every other page leaves this false, which is why the banner shows no skip
 * hint anywhere but home.
 */
class BootState {
	#animating = $state(false);

	get animating(): boolean {
		return this.#animating;
	}

	set(value: boolean) {
		this.#animating = value;
	}
}

export const boot = new BootState();
