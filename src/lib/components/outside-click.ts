/**
 * "Did this click land on nothing?"
 *
 * Two places clear a selection when you click dead space — the stack filter on
 * /projects and the pinned skill on the home page. Both need the same two
 * exceptions, and getting either wrong is subtle: miss the interactive check and
 * the handler steals clicks from links; miss the selection check and dragging to
 * select text wipes the filter on mouse-up.
 */

const INTERACTIVE = 'a, button, input, select, textarea, dialog, [role="button"]';

export function isDeadSpaceClick(event: MouseEvent): boolean {
	const target = event.target as HTMLElement | null;
	if (target?.closest(INTERACTIVE)) return false;

	// Dragging to select text ends in a click too, and clearing then would feel
	// like the page fighting the user.
	if (typeof window !== 'undefined' && window.getSelection()?.toString()) return false;

	return true;
}
