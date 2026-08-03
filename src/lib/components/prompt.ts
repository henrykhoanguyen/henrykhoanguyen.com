export const HOST = 'henrykhoanguyen';

/**
 * The shell user for each top-level section.
 *
 * Short, lowercase, and stable — they read as account names rather than labels,
 * which is the point. A section missing from this map falls back to `guest`,
 * which is what an unknown path deserves.
 */
const USERS: Record<string, string> = {
	'': 'home',
	projects: 'proj',
	experiences: 'exp',
	about: 'about'
};

export type Prompt = {
	/** `home`, `proj`, `exp`, `about`, or `guest`. */
	user: string;
	host: string;
	/** `~` at a section root, `~/slug` deeper in. */
	cwd: string;
};

/**
 * Where the visitor is, as a shell prompt: `proj@henrykhoanguyen ~/parquet-diff`.
 *
 * The user says which section, the working directory says how deep — so a case
 * study reads as a directory inside its section rather than as another `~`,
 * which would be the same prompt everywhere and tell nobody anything.
 */
export function promptFor(pathname: string): Prompt {
	const segments = pathname.split('/').filter(Boolean);
	const [section = '', ...rest] = segments;

	return {
		user: USERS[section] ?? 'guest',
		host: HOST,
		cwd: rest.length > 0 ? `~/${rest.join('/')}` : '~'
	};
}
