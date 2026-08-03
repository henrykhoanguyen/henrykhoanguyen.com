/**
 * Open state for the command palette, shared between the header button and the
 * palette itself.
 *
 * The palette used to own this privately, which was fine while a keyboard
 * shortcut was the only way in. A clickable ⌘K badge in the header is a second
 * opener, and passing a callback down through the layout to reach it would put
 * the header's concerns in the layout's props. A small module-scoped rune is
 * less machinery for the same result.
 *
 * `<dialog>` remains the source of truth for what is actually on screen — this
 * only expresses intent, and the palette syncs the element to it.
 */
class PaletteState {
	#open = $state(false);

	get isOpen(): boolean {
		return this.#open;
	}

	open() {
		this.#open = true;
	}

	close() {
		this.#open = false;
	}

	toggle() {
		this.#open = !this.#open;
	}
}

export const palette = new PaletteState();
