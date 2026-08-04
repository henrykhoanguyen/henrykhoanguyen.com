/**
 * Whether the session has been ended from the command palette.
 *
 * When true the layout replaces the entire page — nav, banner, content, footer,
 * palette — with the logout screen. A half-exited terminal that still shows its
 * chrome would give the whole joke away.
 *
 * Deliberately not a route. `/exit` would be a real URL someone could land on,
 * share, or have indexed, and a portfolio whose search result is a logout screen
 * is a bad trade for a gag.
 */
class ExitState {
	#exited = $state(false);

	get exited(): boolean {
		return this.#exited;
	}

	exit() {
		this.#exited = true;
	}

	restore() {
		this.#exited = false;
	}
}

export const session = new ExitState();
