/**
 * What the terminal prints on the way out.
 *
 * Kept as data rather than markup so the sequence can be tested and reordered
 * without touching the component that types it.
 */
export const LOGOUT_LINES = [
	'$ exit',
	'logout',
	'Saving session...',
	'...copying sus history...',
	'...saving private variables...',
	'...truncating your bookmarks hehe...deleting win32 evil hehe...',
	'...completed.'
] as const;

/** The words that should surface the exit entry in the palette. */
export const EXIT_KEYWORDS = 'quit :q! :q logout exit session close bye';
