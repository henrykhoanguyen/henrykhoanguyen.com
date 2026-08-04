/**
 * What the terminal prints on the way out.
 *
 * The command is separate from the output because they are different things: a
 * shell prints its own `$` and echoes what you typed, then the program writes
 * its lines. Keeping them apart is also what lets the command line be the
 * accent colour, like every other prompt on the site, while output stays in the
 * reading colour.
 */
export const LOGOUT_COMMAND = 'exit';

export const LOGOUT_LINES = [
	'logout',
	'Saving session...',
	'...copying sus history...',
	'...saving private variables...',
	'...truncating your bookmarks hehe...deleting win32 evil hehe...',
	'...completed.'
] as const;

/** The words that should surface the exit entry in the palette. */
export const EXIT_KEYWORDS = 'quit :q! :q logout exit session close bye';
