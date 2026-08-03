const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Where the previous visit is recorded. */
export const LAST_VISIT_KEY = 'henrykhoanguyen:last-visit';

/**
 * A timestamp in the shape `date` prints: `Mon Aug  3 09:14:22`.
 *
 * Single-digit days are space-padded, not zero-padded, which is the detail that
 * separates a real terminal line from an imitation of one.
 */
export function formatLoginTime(date: Date): string {
	const day = String(date.getDate()).padStart(2, ' ');
	const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
		.map((n) => String(n).padStart(2, '0'))
		.join(':');

	return `${DAYS[date.getDay()]} ${MONTHS[date.getMonth()]} ${day} ${time}`;
}

/**
 * Reads the previous visit and records this one.
 *
 * A terminal's login banner reports the *previous* session, so this does too
 * rather than printing the current time and calling it a last login. On a first
 * visit there is no previous session and the banner says so, which is both
 * truthful and the more interesting line to read.
 *
 * Storage failures are ignored: private browsing and blocked storage should
 * cost a visitor a decorative line, not a page.
 */
export function readAndRecordVisit(now: Date = new Date()): Date | null {
	let previous: Date | null = null;

	try {
		const stored = localStorage.getItem(LAST_VISIT_KEY);
		if (stored) {
			const parsed = new Date(stored);
			if (!Number.isNaN(parsed.getTime())) previous = parsed;
		}
		localStorage.setItem(LAST_VISIT_KEY, now.toISOString());
	} catch {
		return null;
	}

	return previous;
}
